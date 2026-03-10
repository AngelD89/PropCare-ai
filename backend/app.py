from flask import Flask, request, render_template
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
import os

from models import Property, Service
from utils.auth_middleware import token_required

# Blueprints
from routes.properties import properties_bp
from routes.providers import providers_bp
from routes.services import services_bp

from openai import OpenAI


load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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

    db.init_app(app)

    # Register API routes
    app.register_blueprint(properties_bp, url_prefix="/api")
    app.register_blueprint(providers_bp, url_prefix="/api")
    app.register_blueprint(services_bp, url_prefix="/api")

    # Serve frontend
    @app.route("/")
    def home():
        return render_template("index.html")

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/login")
    def login():
        return render_template("login.html")

    # =========================
    # AI Assistant
    # =========================
    @app.route("/api/ai/assistant", methods=["POST"])
    @token_required
    def ai_assistant(current_user):

        data = request.get_json()
        prompt = data.get("prompt")

        properties = Property.query.filter_by(
            user_id=current_user.id
        ).all()

        services = Service.query.join(Property).filter(
            Property.user_id == current_user.id
        ).all()

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
    @token_required
    def analytics_summary(current_user):

        user_properties = Property.query.filter_by(
            user_id=current_user.id
        ).all()

        property_ids = [p.id for p in user_properties]

        total_properties = len(user_properties)

        total_services = Service.query.filter(
            Service.property_id.in_(property_ids)
        ).count()

        completed_services = Service.query.filter(
            Service.property_id.in_(property_ids),
            Service.status == "completed"
        ).count()

        scheduled_services = Service.query.filter(
            Service.property_id.in_(property_ids),
            Service.status == "scheduled"
        ).count()

        return {
            "properties": total_properties,
            "services": total_services,
            "completed": completed_services,
            "scheduled": scheduled_services
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
