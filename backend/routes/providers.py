from utils.auth_middleware import token_required
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


# GET single provider
@providers_bp.route('/providers/<int:id>', methods=['GET'])
def get_provider(id):
    provider = Provider.query.get_or_404(id)

    return jsonify({
        "id": provider.id,
        "name": provider.name,
        "service_type": provider.service_type,
        "phone": provider.phone,
        "email": provider.email
    }), 200


# CREATE provider
@providers_bp.route('/providers', methods=['POST'])
@token_required
def create_provider(current_user):
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


# UPDATE provider
@providers_bp.route('/providers/<int:id>', methods=['PATCH'])
def update_provider(id):
    provider = Provider.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    provider.name = data.get('name', provider.name)
    provider.service_type = data.get('service_type', provider.service_type)
    provider.phone = data.get('phone', provider.phone)
    provider.email = data.get('email', provider.email)

    db.session.commit()

    return jsonify({"message": "Provider updated successfully"}), 200


# DELETE provider
@providers_bp.route('/providers/<int:id>', methods=['DELETE'])
def delete_provider(id):
    provider = Provider.query.get_or_404(id)

    db.session.delete(provider)
    db.session.commit()

    return jsonify({"message": "Provider deleted"}), 200
