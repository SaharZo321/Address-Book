from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
CORS(app=app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///addressbook.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app=app)

get_ep = "/contacts"
create_ep = "/create"
delete_ep = "/delete"
update_ep = "/update"