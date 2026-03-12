from flask import Blueprint, request, jsonify
from models import Service
from extensions import db

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


# CREATE service
@services_bp.route('/services', methods=['POST'])
def create_service():

    data = request.get_json()

    service = Service(
        property_id=data["property_id"],
        provider_id=data.get("provider_id"),
        type=data["type"],
        date=data.get("date"),
        status="scheduled",
        notes=data.get("notes")
    )

    db.session.add(service)
    db.session.commit()

    return jsonify({
        "message": "Service created successfully",
        "service_id": service.id
    }), 201
