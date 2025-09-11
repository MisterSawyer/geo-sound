from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix
from geo_sound.config import DevConfig

def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/geo-sound/static")

    app.wsgi_app = ProxyFix(app.wsgi_app, x_prefix=1)

    config_obj = DevConfig()
    app.config.from_object(config_obj)
    app.config["CONFIG_OBJ"] = config_obj

    # Inject config into Jinja templates
    @app.context_processor
    def inject_config():
        return dict(config=app.config["CONFIG_OBJ"])

    # Register blueprints
    from geo_sound.routes.main import main_bp
    from geo_sound.routes.api import api_bp
    from geo_sound.routes.sound import sound_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(sound_bp, url_prefix="/sound")

    return app
