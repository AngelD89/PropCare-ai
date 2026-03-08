from flask import Blueprint, request, current_app
from extensions import db
from models import User
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__)

# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(email=email).first():
        return {"error": "User already exists"}, 400

    user = User(email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return {"message": "User registered successfully"}, 201


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return {"error": "Invalid credentials"}, 401

    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(hours=current_app.config["JWT_EXPIRATION_HOURS"])
        },
        current_app.config["JWT_SECRET"],
        algorithm="HS256"
    )

    return {"token": token}
