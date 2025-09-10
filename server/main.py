from flask import Flask, render_template, send_from_directory, request, jsonify, redirect, url_for
from werkzeug.utils import secure_filename
import os, json

app = Flask(__name__, static_folder="server/static", static_url_path="/geo-sound/static")

SOUNDS_DIR = os.path.join(os.path.dirname(__file__), "assets/sounds")
METADATA_DIR = os.path.join(os.path.dirname(__file__), "assets/metadata")
ALLOWED_EXTENSIONS = {"mp3", "json"}

app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # limit 50MB uploads

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def load_tracks():
    tracks = []
    for f in os.listdir(SOUNDS_DIR):
        if f.endswith(".mp3"):
            base = os.path.splitext(f)[0]
            json_path = os.path.join(METADATA_DIR, base + ".json")

            metadata = {}
            if os.path.exists(json_path):
                with open(json_path, "r", encoding="utf-8") as jf:
                    try:
                        metadata = json.load(jf)
                    except Exception as e:
                        metadata = {"error": str(e)}

            tracks.append({
                "file": f,
                "metadata": metadata
            })
    return tracks

@app.route("/")
def index():
    return render_template("index.html", tracks=load_tracks())

@app.route("/sound/<path:filename>")
def serve_sound(filename):
    return send_from_directory(SOUNDS_DIR, filename)

# ---------- API UPLOAD ----------
@app.route("/api/upload", methods=["POST"])
def api_upload_sound():
    """
    Expects multipart/form-data with:
    - "sound": MP3 file
    - "name": string (base filename)
    - "lat": float
    - "lon": float
    """
    if "sound" not in request.files:
        return jsonify({"error": "Missing sound file"}), 400

    sound_file = request.files["sound"]
    name = request.form.get("name")
    owner = request.form.get("owner")
    lat = request.form.get("lat")
    lon = request.form.get("lon")

    # Validate
    if not name or not owner or lat is None or lon is None:
        return jsonify({"error": "Missing required fields: name, lat, lon"}), 400
    if not allowed_file(sound_file.filename):
        return jsonify({"error": "Only MP3 allowed"}), 400

    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return jsonify({"error": "lat and lon must be numbers"}), 400

    # Secure filename
    sound_filename = secure_filename(name + ".mp3")
    metadata_filename = secure_filename(name + ".json")

    # Save files
    sound_path = os.path.join(SOUNDS_DIR, sound_filename)
    metadata_path = os.path.join(METADATA_DIR, metadata_filename)

    sound_file.save(sound_path)

    metadata = {
        "title": name,
        "owner" : owner,
        "lat": lat,
        "lon": lon
    }
    with open(metadata_path, "w", encoding="utf-8") as jf:
        json.dump(metadata, jf, indent=2)

    # If it's a browser form submission, redirect to home page
    if request.accept_mimetypes.accept_html:
        return redirect(url_for("index"))

    # Otherwise, return JSON (API call)
    return jsonify({
        "message": "Upload successful",
        "file": sound_filename,
        "metadata": metadata
    }), 201


if __name__ == "__main__":
    os.makedirs(SOUNDS_DIR, exist_ok=True)
    os.makedirs(METADATA_DIR, exist_ok=True)
    app.run(host="0.0.0.0", port=8000, debug=True)
