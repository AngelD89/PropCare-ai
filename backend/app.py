from flask import Flask, request, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
import os
import json
import requests
from datetime import datetime

load_dotenv()

from models import Property, Service

# Blueprints
from routes.auth import auth_bp
from routes.properties import properties_bp
from routes.providers import providers_bp
from routes.services import services_bp

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

print("Google API Key Loaded:", GOOGLE_API_KEY)


# =========================
# Google Maps Service Search
# =========================

def search_services(service_type):

    property_obj = Property.query.first()

    location = "Puerto Rico"

    if property_obj and property_obj.address:
        location = property_obj.address

    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"

    params = {
        "query": f"{service_type} near {location}",
        "key": GOOGLE_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    results = []

    for place in data.get("results", [])[:5]:

        results.append({
            "name": place.get("name"),
            "address": place.get("formatted_address"),
            "rating": place.get("rating", "N/A")
        })

    return results


# =========================
# Detect AI Intent
# =========================

def detect_ai_intent(prompt):

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
You analyze a user request.

Return JSON.

Examples:

User: "Find a plumber"
{
 "service": "plumber",
 "schedule": false
}

User: "Schedule cleaning tomorrow"
{
 "service": "cleaning",
 "schedule": true
}

User: "The sink is leaking"
{
 "service": "plumber",
 "schedule": false
}

If no service is detected:
{
 "service": "none",
 "schedule": false
}
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    response = completion.choices[0].message.content

    try:
        return json.loads(response)
    except:
        return {"service": "none", "schedule": False}


# =========================
# Create Flask App
# =========================

def create_app():

    app = Flask(__name__)
    CORS(app)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        "DATABASE_URL",
        "sqlite:///" + os.path.join(BASE_DIR, "database.db")
    )

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'dev-secret-key')
    app.config['JWT_EXPIRATION_HOURS'] = 24

    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(properties_bp, url_prefix="/api")
    app.register_blueprint(providers_bp, url_prefix="/api")
    app.register_blueprint(services_bp, url_prefix="/api")


    # =========================
    # Frontend Routes
    # =========================

    @app.route("/")
    def landing():
        return render_template("index.html")

    @app.route("/login")
    def login():
        return render_template("login.html")

    @app.route("/landing")
    def dashboard():
        return render_template("index.html")


    # =========================
    # API Health Check
    # =========================

    @app.route("/api/health")
    def health_check():
        return {
            "status": "ok",
            "service": "PropCare AI API",
            "version": "1.0"
        }


    # =========================
    # AI Assistant
    # =========================

    @app.route("/api/ai/assistant", methods=["POST"])
    def ai_assistant():

        data = request.get_json()
        prompt = data.get("prompt")

        intent = detect_ai_intent(prompt)

        service_type = intent.get("service")
        should_schedule = intent.get("schedule")

        if service_type != "none":

            providers = search_services(service_type)

            if should_schedule:

                service_date = datetime.now()

                property_obj = Property.query.first()

                new_service = Service(
                    type=service_type,
                    date=service_date,
                    status="scheduled",
                    property_id=property_obj.id if property_obj else None
                )

                db.session.add(new_service)
                db.session.commit()

                property_name = property_obj.name if property_obj else "your property"

                return {
                    "message": f"{service_type} scheduled at {property_name}",
                    "providers": providers
                }

            return {
                "service_found": service_type,
                "providers": providers
            }

        # Fallback AI conversation

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI assistant helping Airbnb property managers."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        response = completion.choices[0].message.content

        return {"response": response}


    # =========================
    # Analytics
    # =========================

    @app.route("/api/analytics/summary", methods=["GET"])
    def analytics_summary():

        properties = Property.query.all()
        services = Service.query.all()

        total_properties = len(properties)
        total_services = len(services)

        completed_services = Service.query.filter_by(status="completed").count()
        scheduled_services = Service.query.filter_by(status="scheduled").count()

        return {
            "total_properties": total_properties,
            "total_services": total_services,
            "completed_services": completed_services,
            "scheduled_services": scheduled_services
        }

    return app


# =========================
# Run Server
# =========================

if __name__ == "__main__":

    app = create_app()

    with app.app_context():
        db.create_all()

    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
