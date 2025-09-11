from flask import Blueprint, request, jsonify, redirect, url_for
from geo_sound.services.sound_service import save_track, delete_track, rename_track

api_bp = Blueprint("api", __name__)

@api_bp.route("/upload", methods=["POST"])
def upload():
    result, error = save_track(request)
    if error:
        return jsonify(error), 400
    return jsonify(result), 201

@api_bp.route("/delete/<name>", methods=["DELETE"])
def delete(name):
    result, error = delete_track(name)
    if error:
        return jsonify(error), 404
    return jsonify(result), 200


@api_bp.route("/rename/<string:old_name>", methods=["PUT"])
def rename(old_name : str):
    data = request.get_json(silent=True)
    if not data or "new_name" not in data:
        return jsonify({"error": "Missing 'new_name' in request"}), 400

    result, error = rename_track(old_name, data["new_name"])
    if error:
        return jsonify(error), 404
    return jsonify(result), 200