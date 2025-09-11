from flask import Blueprint, render_template, send_from_directory, current_app
from geo_sound.services.sound_service import load_tracks

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return render_template("index.html", tracks=load_tracks())


@main_bp.route("/favicon.ico")
def favicon():
    return send_from_directory(
        current_app.static_folder,
        "favicon.ico",
        mimetype="image/vnd.microsoft.icon"
    )
