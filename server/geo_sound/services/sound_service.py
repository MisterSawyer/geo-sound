import os, json
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]
    )

def load_tracks():
    sounds_dir = current_app.config["SOUNDS_DIR"]
    metadata_dir = current_app.config["METADATA_DIR"]

    tracks = []
    for f in os.listdir(sounds_dir):
        if not allowed_file(f):
           continue

        base = os.path.splitext(f)[0]
        json_path = os.path.join(metadata_dir, base + ".json")

        metadata = {}
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as jf:
                metadata = json.load(jf)

        tracks.append({"file": f, "metadata": metadata})
    return tracks


def save_track(request):
    if "sound" not in request.files:
        return None, {"error": "Missing sound file"}

    sound_file = request.files["sound"]
    name = request.form.get("name")
    owner = request.form.get("owner")
    lat = request.form.get("lat")
    lon = request.form.get("lon")
    color = request.form.get("color", "#3388ff")

    if not sound_file or not allowed_file(sound_file.filename):
        return None, {"error": f"Only {', '.join(current_app.config['ALLOWED_EXTENSIONS'])} allowed"}

    if not all([sound_file, name, owner, lat, lon]):
        return None, {"error": "Missing required fields"}

    try:
        lat = float(lat)
        lon = float(lon)
    except ValueError:
        return None, {"error": "lat and lon must be numbers"}

    sounds_dir = current_app.config["SOUNDS_DIR"]
    metadata_dir = current_app.config["METADATA_DIR"]

    os.makedirs(sounds_dir, exist_ok=True)
    os.makedirs(metadata_dir, exist_ok=True)

    ext = sound_file.filename.rsplit(".", 1)[1].lower()
    sound_filename = secure_filename(name + "." + ext)

    metadata_filename = secure_filename(name + ".json")

    sound_path = os.path.join(sounds_dir, sound_filename)
    metadata_path = os.path.join(metadata_dir, metadata_filename)

    # Check for duplicates
    if os.path.exists(sound_path) or os.path.exists(metadata_path):
        return None, {"error": f"A track with the name '{name}' already exists"}

    # Save files
    sound_file.save(sound_path)

    metadata = {"title": name, "owner": owner, "lat": lat, "lon": lon, "color" : color}

    with open(metadata_path, "w", encoding="utf-8") as jf:
        json.dump(metadata, jf, indent=2)

    return {
        "message": "Upload successful",
        "file": sound_filename,
        "metadata": metadata,
    }, None


def delete_track(name: str):
    """Delete sound and metadata files by base name."""
    sounds_dir = current_app.config["SOUNDS_DIR"]
    metadata_dir = current_app.config["METADATA_DIR"]
    
    deleted = []

    # Try all allowed extensions for the sound file
    # Try all allowed extensions for the sound file
    for ext in current_app.config["ALLOWED_EXTENSIONS"]:
        sound_filename = secure_filename(f"{name}.{ext}")
        sound_path = os.path.join(sounds_dir, sound_filename)
        if os.path.exists(sound_path):
            os.remove(sound_path)
            deleted.append(sound_filename)

    # Metadata JSON file
    metadata_filename = secure_filename(f"{name}.json")
    metadata_path = os.path.join(metadata_dir, metadata_filename)
    if os.path.exists(metadata_path):
        os.remove(metadata_path)
        deleted.append(metadata_filename)

    if not deleted:
        return None, {"error": f"No track found with name '{name}'"}

    return {"message": f"Deleted track '{name}'", "deleted": deleted}, None
