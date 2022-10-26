import pathlib
import shutil
import tempfile
import textwrap
from typing import Optional
import huggingface_hub
import os
import json
import argparse

AUTH_TOKEN = os.getenv("AUTH_TOKEN")
VERSION_TXT = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "gradio", "version.txt"))
DIR = os.path.dirname(__file__)
GRADIO_DEMO_DIR = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "demo"))
with open(VERSION_TXT) as f:
    gradio_version=f.read()
gradio_version = gradio_version.strip()

def upload_demo_to_space(
    demo_name: str, space_id: str, hf_token: str, gradio_version: Optional[str], gradio_wheel_url: Optional[str] = None
):
    """Upload a demo in the demo directory to a huggingface space.
    Args:
        demo_name: The name of the demo to upload.
        space_id: The id of the space to upload the demo to.
        hf_token: HF api token. Need to have permission to write to space_id for this to work.
        gradio_version: If not None, will set the gradio version in the created space to the given version.
    """

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
                            ---
                            """
        readme.open("w").write(textwrap.dedent(readme_content))
        
        if gradio_wheel_url:
            with open (os.path.join(tmpdir, "requirements.txt"), "w+") as r:
                r.append(gradio_wheel_url)

        api = huggingface_hub.HfApi()
        huggingface_hub.create_repo(
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
    return f"https://huggingface.co/spaces/{space_id}"

demos = os.listdir(GRADIO_DEMO_DIR)
demos = [demo for demo in demos if demo != "all_demos" and os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo)) and  os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "run.py"))]

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", type=str, help="aws link to gradio wheel")
    args = parser.parse_args()
    gradio_wheel_url = args.url + f"gradio-{gradio_version}-py3-none-any.whl"
    if AUTH_TOKEN is not None:
        hello_world_version = str(huggingface_hub.space_info("gradio/hello_world").cardData["sdk_version"])
        for demo in demos:
            if hello_world_version != gradio_version:
                upload_demo_to_space(demo_name=demo, space_id="gradio/" + demo, hf_token=AUTH_TOKEN, gradio_version=gradio_version)
            upload_demo_to_space(demo_name=demo, space_id="gradio/" + demo + "_main", hf_token=AUTH_TOKEN, gradio_version=gradio_version, gradio_wheel_url=gradio_wheel_url)