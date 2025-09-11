from flask import Blueprint, send_from_directory, current_app
import os

sound_bp = Blueprint("sound", __name__)

@sound_bp.route("/sound/<path:filename>")
def serve_sound(filename):
    sounds_dir = current_app.config["SOUNDS_DIR"]
    return send_from_directory(sounds_dir, filename)