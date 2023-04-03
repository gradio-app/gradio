import os
import shutil

import jinja2
from src import docs
from utils import get_latest_stable

SRC_DIR = "src"
BUILD_DIR = "build"
if os.path.exists(BUILD_DIR):
    shutil.rmtree(BUILD_DIR)
os.makedirs(BUILD_DIR)
jinja_env = jinja2.Environment(loader=jinja2.FileSystemLoader(SRC_DIR))

shutil.copytree(
    os.path.join(SRC_DIR, "assets"), os.path.join(BUILD_DIR, "assets")
)

latest_gradio_stable = get_latest_stable()
docs.build_pip_template(latest_gradio_stable , jinja_env)
