from flask import Blueprint, current_app, request, jsonify, redirect, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from geo_sound.services.track_service import (
    get_track_metadata, save_track, delete_track, rename_track,
    change_track_color, change_track_location, change_track_recorded_at
)

api_bp = Blueprint("api", __name__)

@api_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload():
    result, error = save_track(request, owner = get_jwt_identity())
    if error:
        return jsonify(error), 400
    return jsonify(result), 201

@api_bp.route("/delete/<name>", methods=["DELETE"])
@jwt_required()
def delete(name):
    username = get_jwt_identity()
    config = current_app.config["CONFIG_OBJ"]

    # Get track metadata (to check owner)
    metadata = get_track_metadata(name)
    if metadata == {}:
        return jsonify({"error": "Track not found"}), 404

    if username not in config.admins and metadata.get("owner") != username:
        return jsonify({"error": "Not authorized to delete this track"}), 403

    result, error = delete_track(name)
    if error:
        return jsonify(error), 404
    return jsonify(result), 200


@api_bp.route("/rename/<string:old_name>", methods=["PUT"])
@jwt_required()
def rename(old_name: str):
    username = get_jwt_identity()
    config = current_app.config["CONFIG_OBJ"]

    data = request.get_json(silent=True)
    if not data or "new_name" not in data:
        return jsonify({"error": "Missing 'new_name' in request"}), 400

    metadata = get_track_metadata(old_name)
    if metadata == {}:
        return jsonify({"error": "Track not found"}), 404

    if username not in config.admins and metadata.get("owner") != username:
        return jsonify({"error": "Not authorized to rename this track"}), 403

    result, error = rename_track(old_name, data["new_name"])
    if error:
        return jsonify(error), 404
    return jsonify(result), 200


@api_bp.route("/color/<string:name>", methods=["PUT"])
@jwt_required()
def update_color(name: str):
    username = get_jwt_identity()
    config = current_app.config["CONFIG_OBJ"]

    data = request.get_json(silent=True)
    if not data or "color" not in data:
        return jsonify({"error": "Missing 'color' in request"}), 400

    metadata = get_track_metadata(name)
    if metadata == {}:
        return jsonify({"error": "Track not found"}), 404

    if username not in config.admins and metadata.get("owner") != username:
        return jsonify({"error": "Not authorized to change color"}), 403

    result, error = change_track_color(name, data["color"])
    if error:
        return jsonify(error), 404
    return jsonify(result), 200

@api_bp.route("/location/<string:name>", methods=["PUT"])
@jwt_required()
def update_location(name: str):
    username = get_jwt_identity()
    config = current_app.config["CONFIG_OBJ"]

    data = request.get_json(silent=True)
    if not data or "lat" not in data or "lon" not in data:
        return jsonify({"error": "Missing 'lat' or 'lon' in request"}), 400

    metadata = get_track_metadata(name)
    if metadata == {}:
        return jsonify({"error": "Track not found"}), 404

    if username not in config.admins and metadata.get("owner") != username:
        return jsonify({"error": "Not authorized to change location"}), 403

    result, error = change_track_location(name, data["lat"], data["lon"])
    if error:
        return jsonify(error), 400
    return jsonify(result), 200

@api_bp.route("/recorded_at/<string:name>", methods=["PUT"])
@jwt_required()
def update_recorded_at(name: str):
    username = get_jwt_identity()
    config = current_app.config["CONFIG_OBJ"]

    data = request.get_json(silent=True) or {}
    # recorded_at is optional: if missing/empty -> clear
    new_val = data.get("recorded_at", "")

    metadata = get_track_metadata(name)
    if metadata == {}:
        return jsonify({"error": "Track not found"}), 404

    if username not in config.admins and metadata.get("owner") != username:
        return jsonify({"error": "Not authorized to change recorded_at"}), 403

    result, error = change_track_recorded_at(name, new_val)
    if error:
        return jsonify(error), 400
    return jsonify(result), 200