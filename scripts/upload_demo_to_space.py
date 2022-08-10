from huggingface_hub import create_repo, HfApi
import pathlib
import tempfile
import shutil
import argparse
from typing import Optional
import textwrap


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
        demo_path = pathlib.Path(pathlib.Path().absolute(), f"demo/{demo_name}")
        shutil.copytree(demo_path, tmpdir, dirs_exist_ok=True)
        app_file = pathlib.Path(tmpdir, "run.py")
        # Rename the app file to be app.py
        app_file.rename(app_file.with_stem("app"))
        if gradio_version:
            readme = pathlib.Path(tmpdir, "README.md")
            readme_content = f"""
                                ---
                                title: {space_id.split("/")[-1]} 
                                emoji: 💩
                                colorFrom: indigo
                                colorTo: indigo
                                sdk: gradio
                                sdk_version: {gradio_version}
                                app_file: app.py
                                pinned: false
                                ---
                                """
            readme.open("w").write(textwrap.dedent(readme_content))

        api = HfApi()
        create_repo(
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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument("demo_name", type=str, help="Name of demo to upload")
    parser.add_argument(
        "space_id", type=str, help="Name of the space to upload the demo to"
    )
    parser.add_argument("hf_token", type=str, help="HF API token")
    parser.add_argument(
        "--gradio-version",
        type=str,
        help="If not None, will set the gradio version in the created space to the given version.",
    )
    args = parser.parse_args()
    new_space = upload_demo_to_space(
        args.demo_name, args.space_id, args.hf_token, args.gradio_version
    )
    print(new_space)
