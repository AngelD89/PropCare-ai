from flask import Blueprint, request, jsonify
from models import Provider
from extensions import db

providers_bp = Blueprint('providers', __name__)


# GET all providers
@providers_bp.route('/providers', methods=['GET'])
def get_providers():

    providers = Provider.query.all()

    result = []
    for provider in providers:
        result.append({
            "id": provider.id,
            "name": provider.name,
            "service_type": provider.service_type,
            "phone": provider.phone,
            "email": provider.email,
            "rating": provider.rating
        })

    return jsonify(result), 200


# CREATE provider
@providers_bp.route('/providers', methods=['POST'])
def create_provider():

    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({"error": "Provider name is required"}), 400

    new_provider = Provider(
        name=data['name'],
        service_type=data.get('service_type'),
        phone=data.get('phone'),
        email=data.get('email'),
        rating=data.get("rating", 0)
    )

    db.session.add(new_provider)
    db.session.commit()

    return jsonify({
        "message": "Provider created successfully",
        "id": new_provider.id
    }), 201
