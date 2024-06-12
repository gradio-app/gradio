from __future__ import annotations

import argparse
import json
import os
import pathlib
import shutil
import tempfile
import textwrap
import requests
import time
import warnings


import huggingface_hub

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIR = os.path.dirname(__file__)
GRADIO_DEMO_DIR = os.path.abspath(os.path.join(ROOT, "demo"))

# Reasoning:
# 1. all_demos includes all demos and is for testing PRs
# 2. reset_components includes media files that are only present in all_demos (only for PRs)
# 3. custom_path doesn't have .launch since the point is to show how to launch with uvicorn
# 4. The same reason as 2 for kitchen_sink_random and blocks_kitchen_sink
DEMOS_TO_SKIP = {"all_demos", "clear_components", "custom_path", "kitchen_sink_random", "blocks_kitchen_sink"}

api = huggingface_hub.HfApi()

def space_exists(space_id):
    url = f"https://huggingface.co/spaces/{space_id}"
    try:
        for _ in range(5):
            with warnings.catch_warnings():
                warnings.filterwarnings("ignore")
                r = requests.head(url, timeout=3, verify=False)
            if r.status_code == 200:
                return True
            time.sleep(0.500)
    except requests.ConnectionError:
        return False
    return False

def upload_demo_to_space(
    demo_name: str, 
    space_id: str, 
    hf_token: str, 
    gradio_version: str | None, 
    gradio_wheel_url: str | None = None,
    gradio_client_url: str | None = None
):
    """Upload a demo in the demo directory to a huggingface space.
    Parameters:
        demo_name: The name of the demo to upload.
        space_id: The id of the space to upload the demo to.
        hf_token: HF api token. Need to have permission to write to space_id for this to work.
        gradio_version: If not None, will set the gradio version in the created Space to the given version.
        gradio_wheel_url: If not None, will install the version of gradio using the wheel url in the created Space.
        gradio_client_url: If not None, will install the version of gradio client using the wheel url in the created Space.
    """
    print(f"Uploading {demo_name} to {space_id}...")
    with tempfile.TemporaryDirectory() as tmpdir:
        demo_path = pathlib.Path(GRADIO_DEMO_DIR, demo_name)
        shutil.copytree(demo_path, tmpdir, dirs_exist_ok=True)
        readme = pathlib.Path(tmpdir, "README.md")
        readme_content = f"""
                            ---
                            title: {space_id.split("/")[-1]} 
                            emoji: 🔥
                            colorFrom: indigo
                            colorTo: indigo
                            sdk: gradio
                            sdk_version: {gradio_version}
                            app_file: run.py
                            pinned: false
                            hf_oauth: true
                            ---
                            """
        readme.open("w").write(textwrap.dedent(readme_content))

        if gradio_wheel_url and gradio_client_url:
            requirements_path = os.path.join(tmpdir, "requirements.txt")
            if not os.path.exists(requirements_path):
                with open(os.path.join(requirements_path), "w") as f:
                    f.write(gradio_client_url + "\n" + gradio_wheel_url)
            else:
                with open(os.path.join(requirements_path), "r") as f:
                    content = f.read()
                with open(os.path.join(requirements_path), "w") as f:
                    f.seek(0, 0)
                    f.write(gradio_client_url + "\n" + gradio_wheel_url + "\n" + content)
        
        try: 
            if not space_exists(space_id):
                print(f"Creating space {space_id}")
                api.create_repo(
                    space_id,
                    space_sdk="gradio",
                    repo_type="space",
                    token=hf_token,
                    exist_ok=True,
                )

            api.upload_folder(
                token=hf_token,
                repo_id=space_id,
                repo_type="space",
                folder_path=tmpdir,
                path_in_repo="",
            )
        except Exception as e:
            print(f"Failed to upload {demo_name} to {space_id}. Error: {e}")
            return
    return f"https://huggingface.co/spaces/{space_id}"

demos = os.listdir(GRADIO_DEMO_DIR)
demos = [demo for demo in demos if demo not in DEMOS_TO_SKIP and os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo)) and  os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "run.py"))]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--WHEEL_URL", type=str, help="aws link to gradio wheel")
    parser.add_argument("--CLIENT_URL", type=str, help="gradio version")
    parser.add_argument("--AUTH_TOKEN", type=str, help="huggingface auth token")
    parser.add_argument("--GRADIO_VERSION", type=str, help="gradio version")
    args = parser.parse_args()
    gradio_wheel_url = args.WHEEL_URL + f"gradio-{args.GRADIO_VERSION}-py3-none-any.whl"
    
    if args.AUTH_TOKEN is not None:
        hello_world_version = str(huggingface_hub.space_info("gradio/hello_world").cardData["sdk_version"])
        for demo in demos:
            if hello_world_version != args.GRADIO_VERSION:
                upload_demo_to_space(demo_name=demo, space_id="gradio/" + demo, hf_token=args.AUTH_TOKEN, gradio_version=args.GRADIO_VERSION)
            upload_demo_to_space(demo_name=demo, space_id="gradio/" + demo + "_main", hf_token=args.AUTH_TOKEN, gradio_version=args.GRADIO_VERSION, gradio_wheel_url=gradio_wheel_url, gradio_client_url=args.CLIENT_URL)
