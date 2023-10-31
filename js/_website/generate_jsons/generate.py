import json
import os
from subprocess import run

from src import changelog, demos, docs, guides

WEBSITE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GRADIO_DIR = os.path.abspath(os.path.join(WEBSITE_DIR, "..", "..", "gradio"))

def make_dir(root, path):
    return os.path.abspath(os.path.join(root, path))

def get_latest_release():
    with open(make_dir(GRADIO_DIR, "package.json")) as f:
        version = json.load(f)["version"]
        with open(make_dir(WEBSITE_DIR, "src/lib/json/version.json"), "w+") as j:
            json.dump({
                "version": version
                }, j)
        with open(make_dir(WEBSITE_DIR, "src/lib/json/wheel.json"), "w+") as j:
            sha = run(["git", "log", "-1", "--format='%H'"], capture_output=True).stdout.decode("utf-8").strip("'\n")
            json.dump({
                        "wheel": f"https://gradio-builds.s3.amazonaws.com/{sha}/gradio-{version}-py3-none-any.whl"
                        }, j)

            
def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)
        
create_dir_if_not_exists(make_dir(WEBSITE_DIR, "src/lib/json"))
create_dir_if_not_exists(make_dir(WEBSITE_DIR, "src/lib/json/guides"))

demos.generate(make_dir(WEBSITE_DIR, "src/lib/json/demos.json"))
guides.generate(make_dir(WEBSITE_DIR, "src/lib/json/guides/") + "/")
docs.generate(make_dir(WEBSITE_DIR, "src/lib/json/docs.json"))
changelog.generate(make_dir(WEBSITE_DIR, "src/lib/json/changelog.json"))
get_latest_release()

print("JSON generated! " + make_dir(WEBSITE_DIR, "src/lib/json/"))