import os

class Config:
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    SOUNDS_DIR = os.path.join(os.path.dirname(__file__), "../assets/sounds")
    METADATA_DIR = os.path.join(os.path.dirname(__file__), "../assets/metadata")
    ALLOWED_EXTENSIONS = {"mp3", "wav"}
    @property
    def FILE_ACCEPT(self):
        return ",".join(f".{ext}" for ext in sorted(self.ALLOWED_EXTENSIONS))
    
class DevConfig(Config):
    DEBUG = True

class ProdConfig(Config):
    DEBUG = False
