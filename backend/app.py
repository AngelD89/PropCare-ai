from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
import os
from collections import Counter

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # =========================
    # Configuration
    # =========================
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(BASE_DIR, 'database.db')
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False') == 'True'

    db.init_app(app)

    # Import models
    from models import User, Property, Provider, Service

    # =========================
    # Register Blueprints
    # =========================
    from routes.properties import properties_bp
    from routes.providers import providers_bp
    from routes.services import services_bp

    app.register_blueprint(properties_bp, url_prefix='/api')
    app.register_blueprint(providers_bp, url_prefix='/api')
    app.register_blueprint(services_bp, url_prefix='/api')

    # =========================
    # Root Route
    # =========================
    @app.route("/")
    def home():
        return {"message": "PropCare AI backend running!"}

    # =========================
    # SMART AI ASSISTANT
    # =========================
    @app.route("/api/ai/assistant", methods=["POST"])
    def ai_assistant():
        data = request.get_json()
        prompt = data.get("prompt", "").lower()

        from models import Provider, Service, Property

        # -------------------------
        # Flexible Keyword Mapping
        # -------------------------
        keyword_map = {
            "electrician": ["electrician", "electrical", "wiring", "electric"],
            "plumber": ["plumber", "plumbing", "pipe", "leak"],
            "cleaner": ["cleaner", "cleaning", "maid"],
            "painter": ["painter", "painting"]
        }

        providers = Provider.query.all()
        matching_providers = []

        for provider in providers:
            if not provider.service_type:
                continue

            service_type = provider.service_type.lower()

            for category, keywords in keyword_map.items():

                # If provider type matches category OR synonym
                if service_type == category or service_type in keywords:

                    # If user prompt contains any related word
                    if any(word in prompt for word in keywords):
                        matching_providers.append(provider)
                        break

        if matching_providers:
            response = "Here are available providers:\n\n"

            for p in matching_providers:
                response += (
                    f"{p.name} - {p.service_type}\n"
                    f"Phone: {p.phone or 'N/A'} | "
                    f"Email: {p.email or 'N/A'}\n\n"
                )

            return {"response": response.strip()}

        # -------------------------
        # Fallback Summary
        # -------------------------
        services = Service.query.all()

        if not services:
            return {
                "response": "There are currently no services or matching providers in the system."
            }

        status_counts = Counter(service.status for service in services)
        property_counts = Counter(service.property_id for service in services)

        busiest_property_id = property_counts.most_common(1)[0][0]
        busiest_property = Property.query.get(busiest_property_id)

        response = (
            f"You have {status_counts.get('scheduled', 0)} scheduled services, "
            f"{status_counts.get('completed', 0)} completed services, "
            f"and {status_counts.get('canceled', 0)} canceled services. "
            f"The busiest property is '{busiest_property.name}' "
            f"with {property_counts[busiest_property_id]} services."
        )

        return {"response": response}

    # =========================
    # Error Handlers
    # =========================
    @app.errorhandler(404)
    def not_found(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def server_error(error):
        return {"error": "Internal server error"}, 500

    return app


# =========================
# App Instance
# =========================
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(
        debug=app.config['DEBUG'],
        host='0.0.0.0',
        port=5000
    )
