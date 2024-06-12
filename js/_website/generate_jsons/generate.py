import json
import os
from subprocess import run
import boto3
from botocore import UNSIGNED
from botocore.client import Config

from src import changelog, demos, docs, guides

WEBSITE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
GRADIO_DIR = os.path.abspath(os.path.join(WEBSITE_DIR, "..", "..", "gradio"))
ROOT_DIR = os.path.abspath(os.path.join(WEBSITE_DIR, "..", ".."))

def make_dir(root, path):
    return os.path.abspath(os.path.join(root, path))

def download_from_s3(bucket_name, s3_folder, local_dir):
    print("Downloading templates from S3: " + bucket_name + "/" + s3_folder + " to " + local_dir)
    s3 = boto3.client('s3', config=Config(signature_version=UNSIGNED))
    objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=s3_folder)
    for obj in objects.get('Contents', []):
        s3_key = obj['Key']
        local_file_path = os.path.join(local_dir, os.path.relpath(s3_key, s3_folder))
        if not os.path.exists(os.path.dirname(local_file_path)):
            os.makedirs(os.path.dirname(local_file_path))
        s3.download_file(bucket_name, s3_key, local_file_path)

   
def get_latest_release():
    with open(make_dir(ROOT_DIR, "client/js/package.json")) as f:
        js_client_version = json.load(f)["version"]
    with open(make_dir(GRADIO_DIR, "package.json")) as f:
        version = json.load(f)["version"]
        with open(make_dir(WEBSITE_DIR, "src/lib/json/version.json"), "w+") as j:
            json.dump({
                "version": version
                }, j)
        with open(make_dir(WEBSITE_DIR, "src/lib/json/wheel.json"), "w+") as j:
            sha = run(["git", "log", "-1", "--format='%H'"], capture_output=True).stdout.decode("utf-8").strip("'\n")
            json.dump({
                        "gradio_install": f"pip install https://gradio-builds.s3.amazonaws.com/{sha}/gradio-{version}-py3-none-any.whl",
                        "gradio_py_client_install": f"pip install 'gradio-client @ git+https://github.com/gradio-app/gradio@{sha}#subdirectory=client/python'",
                        "gradio_js_client_install": f"npm install https://gradio-builds.s3.amazonaws.com/{sha}/gradio-client-{js_client_version}.tgz",
                        }, j)
        if not os.path.exists(make_dir(WEBSITE_DIR, f"src/lib/templates_{version.replace('.', '-')}")):
            download_from_s3("gradio-docs-json", f"{version}/templates/", make_dir(WEBSITE_DIR, f"src/lib/templates_{version.replace('.', '-')}"))

            
def create_dir_if_not_exists(path):
    if not os.path.exists(path):
        os.makedirs(path)
        
create_dir_if_not_exists(make_dir(WEBSITE_DIR, "src/lib/json"))
create_dir_if_not_exists(make_dir(WEBSITE_DIR, "src/lib/json/guides"))

demos.generate(make_dir(WEBSITE_DIR, "src/lib/json/demos.json"))
guides.generate(make_dir(WEBSITE_DIR, "src/lib/json/guides/") + "/")
docs.generate(make_dir(WEBSITE_DIR, "src/lib/json/docs.json"))
docs.generate(make_dir(WEBSITE_DIR, "src/lib/templates/docs.json"))
changelog.generate(make_dir(WEBSITE_DIR, "src/lib/json/changelog.json"))
get_latest_release()

print("JSON generated! " + make_dir(WEBSITE_DIR, "src/lib/json/"))