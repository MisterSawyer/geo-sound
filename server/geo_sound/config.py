import os, json
from flask_jwt_extended import JWTManager
from dataclasses import dataclass

JWT = JWTManager()

@dataclass
class Config:
    SECRET_KEY = "super-secret-change-me" # TODO
    JWT_SECRET_KEY = "super-secret-jwt"  # TODO for JWT
    ASSETS_DIR = os.path.join(os.path.dirname(__file__), "../assets")
    DB_FILE = os.path.join(os.path.dirname(__file__), ASSETS_DIR, "geo_sound.db")
    CONFIG_JSON = os.path.join(os.path.dirname(__file__), ASSETS_DIR, "config.json")

    JWT_BLACKLIST = set()

    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    SOUNDS_DIR = os.path.join(os.path.dirname(__file__), ASSETS_DIR, "sounds")
    METADATA_DIR = os.path.join(os.path.dirname(__file__), ASSETS_DIR, "metadata")
    ALLOWED_EXTENSIONS = {"mp3", "wav"}

    @property
    def FILE_ACCEPT(self):
        return ",".join(f".{ext}" for ext in sorted(self.ALLOWED_EXTENSIONS))
    
    def __init__(self):
        self.admins = []
        self.load_config_file()

    def load_config_file(self):
        """Load config.json if exists."""
        if os.path.exists(self.CONFIG_JSON):
            try:
                with open(self.CONFIG_JSON, "r", encoding="utf-8") as f:
                    print("Loading config.json")
                    data = json.load(f)
                    self.admins = data.get("admins", [])
            except Exception as e:
                print("Failed to load config.json:", e)

class DevConfig(Config):
    DEBUG = True

class ProdConfig(Config):
    DEBUG = False
