# geo_sound/routes/auth.py
from flask import Blueprint, current_app, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from geo_sound.services.database_service import register_user, verify_user
from geo_sound.config import JWT

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Missing username or password"}), 400
    
    config  = current_app.config["CONFIG_OBJ"]
    ok, err = register_user(config, data["username"], data["password"])
    if not ok:
        return jsonify({"error": err}), 400
    
    return jsonify({"message": "User registered successfully", "username": data["username"]}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Missing username or password"}), 400
    
    config = current_app.config["CONFIG_OBJ"]
    if verify_user(config, data["username"], data["password"]):
        token = create_access_token(identity=data["username"])
        return jsonify({"access_token": token, "username" : data["username"]}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Return current logged in user info."""
    username = get_jwt_identity()
    return jsonify({"username": username}), 200

@JWT.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    config = current_app.config["CONFIG_OBJ"]
    return jwt_payload["jti"] in config.JWT_BLACKLIST

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    config = current_app.config["CONFIG_OBJ"]
    jti = get_jwt()["jti"]   # unique token ID
    config.JWT_BLACKLIST.add(jti)
    return jsonify({"message": "Logged out"}), 200
