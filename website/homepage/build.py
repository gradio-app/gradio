import argparse
import os
import shutil

import jinja2
from src import changelog, demos, docs, guides, index
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

parser = argparse.ArgumentParser()
parser.add_argument("--url", type=str, help="aws link to gradio wheel")
args = parser.parse_args()


VERSION_TXT = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "gradio", "version.txt"))
with open(VERSION_TXT) as f:
    version = f.read()
version = version.strip()


gradio_wheel_url = args.url + f"gradio-{version}-py3-none-any.whl"

index.build(BUILD_DIR, jinja_env, latest_gradio_stable)
guides.build(BUILD_DIR, jinja_env, latest_gradio_stable)
docs.build(BUILD_DIR, jinja_env, gradio_wheel_url, latest_gradio_stable)
demos.build(BUILD_DIR, jinja_env, latest_gradio_stable)
changelog.build(BUILD_DIR, jinja_env, latest_gradio_stable)
