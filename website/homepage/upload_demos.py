import pathlib
import shutil
import tempfile
import textwrap
from typing import Optional
import huggingface_hub
import os
import json

AUTH_TOKEN = os.getenv("AUTH_TOKEN")
VERSION_TXT = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "gradio", "version.txt"))
DIR = os.path.dirname(__file__)
GRADIO_DEMO_DIR = os.path.abspath(os.path.join(os.getcwd(), "..", "..", "demo"))
with open(VERSION_TXT) as f:
    gradio_version=f.read()
gradio_version = gradio_version.strip()

# Reasoning:
# 1. all_demos includes all demos and is for testing PRs
# 2. reset_components includes media files that are only present in all_demos (only for PRs)
# 3. custom_path doesn't have .launch since the point is to show how to launch with uvicorn
# 4. The same reason as 2 for kitchen_sink_random
DEMOS_TO_SKIP = {"all_demos", "reset_components", "custom_path", "kitchen_sink_random"}


def upload_demo_to_space(
    demo_name: str, space_id: str, hf_token: str, gradio_version: Optional[str]
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
        if gradio_version:
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

demos = [demo for demo in demos if demo not in DEMOS_TO_SKIP and os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo)) and  os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "run.py"))]

if __name__ == "__main__":
    if AUTH_TOKEN is not None:
        if str(huggingface_hub.space_info("gradio/hello_world").cardData["sdk_version"]) != gradio_version:
            for demo in demos:
                upload_demo_to_space(demo_name=demo, space_id="gradio/" + demo, hf_token=AUTH_TOKEN, gradio_version=gradio_version)