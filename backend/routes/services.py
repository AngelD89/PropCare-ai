from flask import Blueprint, request, jsonify
from models import Service
from extensions import db
from datetime import datetime

services_bp = Blueprint('services', __name__)


# =========================
# GET all services
# =========================
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
            "created_at": service.created_at.isoformat() if service.created_at else None
        })

    return jsonify(result), 200


# =========================
# CREATE service
# =========================
@services_bp.route('/services', methods=['POST'])
def create_service():

    data = request.get_json()

    # Convert date if provided
    service_date = None
    if data.get("date"):
        try:
            service_date = datetime.fromisoformat(data["date"])
        except:
            service_date = None

    service = Service(
        property_id=data.get("property_id"),
        provider_id=data.get("provider_id"),
        type=data.get("type"),
        date=service_date,
        status=data.get("status", "scheduled"),
        notes=data.get("notes")
    )

    db.session.add(service)
    db.session.commit()

    return jsonify({
        "message": "Service created successfully",
        "service_id": service.id
    }), 201


# =========================
# DELETE service
# =========================
@services_bp.route('/services/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):

    service = Service.query.get(service_id)

    if not service:
        return jsonify({"error": "Service not found"}), 404

    db.session.delete(service)
    db.session.commit()

    return jsonify({
        "message": "Service deleted successfully"
    }), 200
