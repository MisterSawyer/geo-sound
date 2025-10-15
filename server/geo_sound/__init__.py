import os
import logging
from flask import Flask

from werkzeug.middleware.proxy_fix import ProxyFix
from geo_sound.config import DevConfig, JWT
from geo_sound.services.database_service import init_db

def create_app():
    app = Flask(__name__, static_folder="static", static_url_path="/geo-sound/static")

    app.wsgi_app = ProxyFix(app.wsgi_app, x_prefix=1)

    config_obj = DevConfig()
    app.logger.setLevel(logging.DEBUG)

    if(not os.path.exists(config_obj.ASSETS_DIR)):
        app.logger.info("Creating assets directory: {}".format(config_obj.ASSETS_DIR))
        os.makedirs(config_obj.ASSETS_DIR)

    if(not os.path.exists(config_obj.SOUNDS_DIR)):
        app.logger.info("Creating sounds directory: {}".format(config_obj.SOUNDS_DIR))
        os.makedirs(config_obj.SOUNDS_DIR)
    if(not os.path.exists(config_obj.METADATA_DIR)):
        app.logger.info("Creating metadata directory: {}".format(config_obj.METADATA_DIR))
        os.makedirs(config_obj.METADATA_DIR)


    app.config.from_object(config_obj)
    app.config["CONFIG_OBJ"] = config_obj
    app.config["JWT_BLACKLIST_ENABLED"] = True
    app.config["JWT_BLACKLIST_TOKEN_CHECKS"] = ["access"]

    # initialize database
    if(not os.path.exists(config_obj.DB_FILE)):
        app.logger.info("Will create database file: {}".format(config_obj.DB_FILE))

    init_db(config_obj)

    # Inject config into Jinja templates
    @app.context_processor
    def inject_config():
        return dict(config=app.config["CONFIG_OBJ"])

    # Register blueprints
    from geo_sound.routes.main import main_bp
    from geo_sound.routes.api import api_bp
    from geo_sound.routes.sound import sound_bp
    from geo_sound.routes.auth import auth_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(sound_bp, url_prefix="/sound")
    app.register_blueprint(auth_bp, url_prefix="/auth")

    JWT.init_app(app)

    return app
