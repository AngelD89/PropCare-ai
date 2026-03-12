from flask import Flask, request, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
import os

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

    # =========================
    # Register API routes
    # =========================

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(properties_bp, url_prefix="/api")
    app.register_blueprint(providers_bp, url_prefix="/api")
    app.register_blueprint(services_bp, url_prefix="/api")



    # =========================
    # Serve frontend
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

        properties = Property.query.all()
        services = Service.query.all()

        property_list = [p.name for p in properties]

        service_list = [
            f"{s.type} on {s.date}"
            for s in services
        ]

        context = f"""
        User properties: {property_list}

        Scheduled services: {service_list}
        """

        try:

            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI assistant helping Airbnb property managers manage maintenance and services."
                    },
                    {
                        "role": "system",
                        "content": context
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )

            response = completion.choices[0].message.content

            return {"response": response}

        except Exception as e:
            return {"error": str(e)}, 500



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
