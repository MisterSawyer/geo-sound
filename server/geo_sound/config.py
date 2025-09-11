import os

class Config:
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    SOUNDS_DIR = os.path.join(os.path.dirname(__file__), "../assets/sounds")
    METADATA_DIR = os.path.join(os.path.dirname(__file__), "../assets/metadata")

class DevConfig(Config):
    DEBUG = True

class ProdConfig(Config):
    DEBUG = False
