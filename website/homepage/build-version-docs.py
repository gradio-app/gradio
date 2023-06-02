import os
import shutil
from huggingface_hub import upload_file
import tempfile

import jinja2
from src import docs
from utils import get_latest_stable

AUTH_TOKEN = os.getenv("HF_AUTH_TOKEN")
SRC_DIR = "src"
BUILD_DIR = "build"
if os.path.exists(BUILD_DIR):
    shutil.rmtree(BUILD_DIR)
os.makedirs(BUILD_DIR)
jinja_env = jinja2.Environment(loader=jinja2.FileSystemLoader(SRC_DIR))

shutil.copytree(os.path.join(SRC_DIR, "assets"), os.path.join(BUILD_DIR, "assets"))

latest_gradio_stable = get_latest_stable()
new_version_docs = docs.build_pip_template(latest_gradio_stable, jinja_env)

with tempfile.NamedTemporaryFile() as tmp:
    with open(tmp.name, "w") as tmp_file:
        tmp_file.write(new_version_docs)
    upload_file(
        path_or_fileobj=tmp.name,
        repo_type="dataset",
        path_in_repo=f"v{latest_gradio_stable}_template.html",
        repo_id="gradio/docs",
        token=AUTH_TOKEN,
    )
