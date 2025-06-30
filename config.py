"""Flask configuration variables."""

from os import environ, path

from dotenv import load_dotenv

BASE_DIR = path.abspath(path.dirname(__file__))
load_dotenv(path.join(BASE_DIR, ".env"))


class Config:
    """Set Flask configuration from .env file."""

    # General Config
    ENVIRONMENT = environ.get("ENVIRONMENT")
    APP_NAME = "newslocator"

    # Flask Config
    FLASK_APP = "wsgi.py"
    FLASK_DEBUG = environ.get("FLASK_DEBUG")
    MAPBOX_TOKEN = environ.get("MAPBOX_TOKEN")

    # Database
    # SQLALCHEMY_DATABASE_URI: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@nl-postgres:5432/${POSTGRES_DB}"
    SQLALCHEMY_DATABASE_URI = \
        "postgresql://" + \
        environ.get("POSTGRES_USER") + \
        ":" + \
        environ.get("POSTGRES_PASSWORD") + \
        "@" + \
        environ.get("POSTGRES_CONTAINER_NAME") + \
        "/" + \
        environ.get("POSTGRES_DB")
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


settings = Config