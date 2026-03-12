from functools import wraps
from flask import request, current_app
import jwt


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        token = None

        # Check Authorization header
        auth_header = request.headers.get("Authorization")

        if auth_header:
            parts = auth_header.split(" ")

            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]

        if not token:
            return {"error": "Token is missing"}, 401

        try:
            data = jwt.decode(
                token,
                current_app.config["JWT_SECRET"],
                algorithms=["HS256"]
            )

            from models import User

            current_user = User.query.get(data["user_id"])

            if not current_user:
                return {"error": "User not found"}, 401

        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}, 401

        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}, 401

        return f(current_user, *args, **kwargs)

    return decorated
