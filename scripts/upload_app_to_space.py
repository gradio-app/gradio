import argparse
import pathlib
import shutil
import tempfile
import textwrap
from typing import Optional

import huggingface_hub


def upload_app_to_space(space_id: str, hf_token: str):
    """Upload a demo in the demo directory to a huggingface space.
    Args:
        demo_name: The name of the demo to upload.
        space_id: The id of the space to upload the demo to.
        hf_token: HF api token. Need to have permission to write to space_id for this to work.
        gradio_version: If not None, will set the gradio version in the created space to the given version.
    """

    with tempfile.TemporaryDirectory() as tmpdir:
        app_path = pathlib.Path(
            pathlib.Path().absolute(), f"ui/packages/_cdn_test/dist"
        )
        shutil.copytree(app_path, tmpdir, dirs_exist_ok=True)

        readme = pathlib.Path(tmpdir, "README.md")
        readme_content = f"""
                            ---
                            title: {space_id.split("/")[-1]} 
                            emoji: ⚡
                            colorFrom: pink
                            colorTo: pink
                            sdk: static
                            pinned: false
                            ---
                            """
        readme.open("w").write(textwrap.dedent(readme_content))

        api = huggingface_hub.HfApi()
        huggingface_hub.create_repo(
            space_id,
            space_sdk="static",
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload an app to a space")
    parser.add_argument(
        "space_id", type=str, help="Name of the space to upload the demo to"
    )
    parser.add_argument("hf_token", type=str, help="HF API token")

    args = parser.parse_args()
    new_space = upload_app_to_space(
        args.space_id,
        args.hf_token,
    )
    print(new_space)
