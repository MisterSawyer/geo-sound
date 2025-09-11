from flask import Blueprint, render_template
from geo_sound.services.sound_service import load_tracks

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return render_template("index.html", tracks=load_tracks())
