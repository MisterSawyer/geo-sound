from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/geo-sound/static")

    app.wsgi_app = ProxyFix(app.wsgi_app, x_prefix=1)

    app.config.from_object("geo_sound.config.DevConfig")

    # Register blueprints
    from geo_sound.routes.main import main_bp
    from geo_sound.routes.api import api_bp
    from geo_sound.routes.sound import sound_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(sound_bp, url_prefix="/sound")

    return app
