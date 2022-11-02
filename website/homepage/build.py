import os
import shutil
import jinja2
from src import index, guides, docs, demos, changelog
import argparse

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
    gradio_version=f.read()
gradio_version = gradio_version.strip()

parser = argparse.ArgumentParser()
parser.add_argument("--url", type=str, help="aws link to gradio wheel")
args = parser.parse_args()
gradio_wheel_url = args.url + f"gradio-{gradio_version}-py3-none-any.whl"

index.build(BUILD_DIR, jinja_env)
guides.build(BUILD_DIR, jinja_env)
docs.build(BUILD_DIR, jinja_env, gradio_wheel_url)
demos.build(BUILD_DIR, jinja_env)
changelog.build(BUILD_DIR, jinja_env)
