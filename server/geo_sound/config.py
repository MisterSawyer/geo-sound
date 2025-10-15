import os
from flask_jwt_extended import JWTManager
from dataclasses import dataclass

JWT = JWTManager()

@dataclass
class Config:
    SECRET_KEY = "super-secret-change-me" # TODO
    JWT_SECRET_KEY = "super-secret-jwt"  # TODO for JWT
    ASSETS_DIR = os.path.join(os.path.dirname(__file__), "../assets")
    DB_FILE = os.path.join(os.path.dirname(__file__), ASSETS_DIR, "geo_sound.db")
    
    JWT_BLACKLIST = set()

    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    SOUNDS_DIR = os.path.join(os.path.dirname(__file__), ASSETS_DIR, "sounds")
    METADATA_DIR = os.path.join(os.path.dirname(__file__), ASSETS_DIR, "metadata")
    ALLOWED_EXTENSIONS = {"mp3", "wav"}

    @property
    def FILE_ACCEPT(self):
        return ",".join(f".{ext}" for ext in sorted(self.ALLOWED_EXTENSIONS))
    
class DevConfig(Config):
    DEBUG = True

class ProdConfig(Config):
    DEBUG = False
