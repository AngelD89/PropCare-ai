# =========================
# Properties Routes
# =========================

from flask import Blueprint, request, jsonify
from models import Property
from extensions import db

properties_bp = Blueprint('properties', __name__)


# =========================
# GET all properties
# =========================
@properties_bp.route('/properties', methods=['GET'])
def get_properties():

    properties = Property.query.all()

    result = []

    for prop in properties:
        result.append({
            "id": prop.id,
            "name": prop.name,
            "address": prop.address,
            "notes": prop.notes,
            "created_at": prop.created_at
        })

    return jsonify(result), 200


# =========================
# GET single property
# =========================
@properties_bp.route('/properties/<int:id>', methods=['GET'])
def get_property(id):

    prop = Property.query.get_or_404(id)

    return jsonify({
        "id": prop.id,
        "name": prop.name,
        "address": prop.address,
        "notes": prop.notes,
        "created_at": prop.created_at
    }), 200


# =========================
# CREATE property
# =========================
@properties_bp.route('/properties', methods=['POST'])
def create_property():

    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({"error": "Property name is required"}), 400

    new_property = Property(
        name=data['name'],
        address=data.get('address'),
        notes=data.get('notes'),
        user_id=1  # temporary user for MVP
    )

    db.session.add(new_property)
    db.session.commit()

    return jsonify({
        "message": "Property created successfully",
        "id": new_property.id
    }), 201


# =========================
# DELETE property
# =========================
@properties_bp.route('/properties/<int:id>', methods=['DELETE'])
def delete_property(id):

    prop = Property.query.get_or_404(id)

    db.session.delete(prop)
    db.session.commit()

    return jsonify({"message": "Property deleted"}), 200
