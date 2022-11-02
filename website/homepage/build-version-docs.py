import os
import shutil
import jinja2
from src import index, guides, docs, demos, changelog
import requests

SRC_DIR = "src"
BUILD_DIR = "build"
if os.path.exists(BUILD_DIR):
    shutil.rmtree(BUILD_DIR)
os.makedirs(BUILD_DIR)
jinja_env = jinja2.Environment(loader=jinja2.FileSystemLoader(SRC_DIR))

shutil.copytree(
    os.path.join(SRC_DIR, "assets"), os.path.join(BUILD_DIR, "assets")
)

VERSION_TXT = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "gradio", "version.txt"))
with open(VERSION_TXT) as f:
    version = f.read()
version = version.strip()

latest_gradio_stable = requests.get("https://pypi.org/pypi/gradio/json").json()["info"]["version"]
if version == latest_gradio_stable:
    docs.build_pip_template(version , jinja_env)
