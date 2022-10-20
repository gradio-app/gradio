import os
import shutil
import jinja2
from src import index, guides, docs, demos, changelog

SRC_DIR = "src"
BUILD_DIR = "build"
if os.path.exists(BUILD_DIR):
    shutil.rmtree(BUILD_DIR)
os.makedirs(BUILD_DIR)
jinja_env = jinja2.Environment(loader=jinja2.FileSystemLoader(SRC_DIR))

shutil.copytree(
    os.path.join(SRC_DIR, "assets"), os.path.join(BUILD_DIR, "assets")
)
index.build(BUILD_DIR, jinja_env)
guides.build(BUILD_DIR, jinja_env)
docs.build(BUILD_DIR, jinja_env)
demos.build(BUILD_DIR, jinja_env)
changelog.build(BUILD_DIR, jinja_env)

# docs.build_pip_template("3.6", jinja_env)