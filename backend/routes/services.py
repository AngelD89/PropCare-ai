from flask import Blueprint, request, jsonify
from models import db, Service, Property
from utils.auth_middleware import token_required

services_bp = Blueprint('services', __name__)

# ================================
# GET all services for logged-in user
# ================================
@services_bp.route('/services', methods=['GET'])
def get_services():

    services = Service.query.join(Property).filter(
        Property.user_id == current_user.id
    ).all()

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


# ================================
# GET single service
# ================================
@services_bp.route('/services/<int:id>', methods=['GET'])
@token_required
def get_service(current_user, id):

    service = Service.query.get_or_404(id)

    # 🔐 Ensure user owns this service
    if service.property.owner.id != current_user.id:
        return {"error": "Unauthorized"}, 403

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


# ================================
# CREATE service
# ================================
@services_bp.route('/services', methods=['POST'])
@token_required
def create_service(current_user):

    data = request.get_json()

    property = Property.query.get(data["property_id"])

    # 🔐 Verify property belongs to logged-in user
    if not property or property.user_id != current_user.id:
        return {"error": "Unauthorized property access"}, 403

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


# ================================
# UPDATE service status
# ================================
@services_bp.route('/services/<int:id>', methods=['PATCH'])
@token_required
def update_service(current_user, id):

    service = Service.query.get_or_404(id)

    if service.property.owner.id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()

    if "status" in data:
        service.status = data["status"]

    if "notes" in data:
        service.notes = data["notes"]

    db.session.commit()

    return jsonify({
        "message": "Service updated successfully"
    })


# ================================
# DELETE service
# ================================
@services_bp.route('/services/<int:id>', methods=['DELETE'])
@token_required
def delete_service(current_user, id):

    service = Service.query.get_or_404(id)

    # 🔐 Prevent deleting other users' services
    if service.property.owner.id != current_user.id:
        return {"error": "Unauthorized"}, 403

    db.session.delete(service)
    db.session.commit()

    return jsonify({
        "message": "Service deleted successfully"
    }), 200
