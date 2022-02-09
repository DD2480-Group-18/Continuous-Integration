from flask import Flask

app = Flask(__name__)


@app.route("/")
def landing():
    return "Hello"


@app.route("/builds")
def builds():
    return "Builds"
