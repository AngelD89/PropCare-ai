from flask import Blueprint, request, jsonify
from models import Service, Property, Provider
from extensions import db
from datetime import datetime

services_bp = Blueprint('services', __name__)


# GET all services
@services_bp.route('/services', methods=['GET'])
def get_services():
    services = Service.query.all()

    result = []
    for service in services:
        result.append({
            "id": service.id,
            "property_id": service.property_id,
            "provider_id": service.provider_id,
            "type": service.type,
            "date": service.date.isoformat() if service.date else None,
            "status": service.status,
            "notes": service.notes,
            "created_at": service.created_at.isoformat()
        })

    return jsonify(result), 200


# GET single service
@services_bp.route('/services/<int:id>', methods=['GET'])
def get_service(id):
    service = Service.query.get_or_404(id)

    return jsonify({
        "id": service.id,
        "property_id": service.property_id,
        "provider_id": service.provider_id,
        "type": service.type,
        "date": service.date.isoformat() if service.date else None,
        "status": service.status,
        "notes": service.notes,
        "created_at": service.created_at.isoformat()
    }), 200


# CREATE service
@services_bp.route('/services', methods=['POST'])
def create_service():
    data = request.get_json()

    if not data or not data.get('property_id') or not data.get('type'):
        return jsonify({"error": "property_id and type are required"}), 400

    # Validate property exists
    property_exists = Property.query.get(data['property_id'])
    if not property_exists:
        return jsonify({"error": "Property not found"}), 404

    # Validate provider if provided
    provider_id = data.get('provider_id')
    if provider_id:
        provider_exists = Provider.query.get(provider_id)
        if not provider_exists:
            return jsonify({"error": "Provider not found"}), 404

    # Convert date string to datetime
    service_date = None
    if data.get('date'):
        try:
            service_date = datetime.fromisoformat(data['date'])
        except ValueError:
            return jsonify({"error": "Invalid date format. Use ISO format."}), 400

    new_service = Service(
        property_id=data['property_id'],
        provider_id=provider_id,
        type=data['type'],
        date=service_date,
        status=data.get('status', 'scheduled'),
        notes=data.get('notes')
    )

    db.session.add(new_service)
    db.session.commit()

    return jsonify({
        "message": "Service created successfully",
        "id": new_service.id
    }), 201


# UPDATE service
@services_bp.route('/services/<int:id>', methods=['PATCH'])
def update_service(id):
    service = Service.query.get_or_404(id)
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    service.type = data.get('type', service.type)
    service.status = data.get('status', service.status)
    service.notes = data.get('notes', service.notes)

    if data.get('provider_id'):
        provider = Provider.query.get(data['provider_id'])
        if not provider:
            return jsonify({"error": "Provider not found"}), 404
        service.provider_id = data['provider_id']

    if data.get('date'):
        try:
            service.date = datetime.fromisoformat(data['date'])
        except ValueError:
            return jsonify({"error": "Invalid date format. Use ISO format."}), 400

    db.session.commit()

    return jsonify({"message": "Service updated successfully"}), 200


# DELETE service
@services_bp.route('/services/<int:id>', methods=['DELETE'])
def delete_service(id):
    service = Service.query.get_or_404(id)

    db.session.delete(service)
    db.session.commit()

    return jsonify({"message": "Service deleted"}), 200

@services_bp.route("/services/<int:id>/status", methods=["PATCH"])
def update_service_status(id):
    service = Service.query.get_or_404(id)

    data = request.get_json()
    new_status = data.get("status")

    allowed_statuses = ["scheduled", "completed", "canceled"]

    if new_status not in allowed_statuses:
        return {"error": "Invalid status"}, 400

    service.status = new_status
    db.session.commit()

    return {"message": "Service status updated successfully"}
