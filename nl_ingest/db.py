"""Initialize DB."""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy()
db.init_app(app)
