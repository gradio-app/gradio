import argparse
import pathlib
import shutil
import sys
import tempfile
import textwrap
from typing import Optional

from huggingface_hub import CommitOperationAdd, HfApi


def upload_demo_to_space(
    demo_name: str, space_id: str, hf_token: str, gradio_version: Optional[str]
):
    """
    Upload a demo from the demo directory to a Hugging Face Space in chunks of 50 files per commit.

    Args:
        demo_name: The name of the demo to upload.
        space_id: The ID of the space to upload the demo to (e.g., username/space_name).
        hf_token: Hugging Face API token with write permissions to the space.
        gradio_version: If provided, sets the Gradio version in the created space.

    Returns:
        str: URL of the uploaded Hugging Face Space.
    """

    print(f"Uploading demo '{demo_name}' to space '{space_id}'...")

    def split_into_chunks(lst: list, n: int) -> list[list]:
        for i in range(0, len(lst), n):
            yield lst[i : i + n]

    api = HfApi()

    print("Creating repository...")

    # Create the repository if it doesn't exist
    space_url = api.create_repo(
        repo_id=space_id,
        space_sdk="gradio",
        repo_type="space",
        token=hf_token,
        exist_ok=True,
    )

    space_id = space_url.repo_id

    with tempfile.TemporaryDirectory() as tmpdir:
        demo_path = pathlib.Path.cwd() / "demo" / demo_name
        if not demo_path.exists():
            raise FileNotFoundError(f"Demo path '{demo_path}' does not exist.")

        shutil.copytree(demo_path, tmpdir, dirs_exist_ok=True)

        # update README.md with Gradio version if provided
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
            app_file: run.py
            pinned: false
            ---
            """
            readme.write_text(textwrap.dedent(readme_content))

        print("Uploading files to Hugging Face Space...")

        # Create the repository if it doesn't exist
        api.create_repo(
            repo_id=space_id,
            space_sdk="gradio",
            repo_type="space",
            token=hf_token,
            exist_ok=True,
        )

        print("Uploading files...")

        all_files = sorted([p for p in pathlib.Path(tmpdir).rglob("*") if p.is_file()])
        relative_files = [p.relative_to(tmpdir) for p in all_files]

        # Create CommitOperationAdd objects for all files
        operations = [
            CommitOperationAdd(
                path_in_repo=str(rel_path).replace("\\", "/"),
                path_or_fileobj=str(pathlib.Path(tmpdir) / rel_path),
            )
            for rel_path in relative_files
        ]

        # Split operations into chunks of 50
        operation_chunks = list(split_into_chunks(operations, 50))

        for idx, chunk in enumerate(operation_chunks, start=1):
            commit_message = f"Commit {idx}: Add {len(chunk)} file(s)"
            try:
                api.create_commit(
                    repo_id=space_id,
                    operations=chunk,
                    commit_message=commit_message,
                    token=hf_token,
                    repo_type="space",
                )
                print(f"Successfully committed chunk {idx} with {len(chunk)} file(s).")
            except Exception as e:
                print(f"Failed to commit chunk {idx}: {e}")
                raise e

    return f"https://huggingface.co/spaces/{space_id}"


if __name__ == "__main__":
    print("Starting upload...")
    parser = argparse.ArgumentParser(
        description="Upload a demo to a Hugging Face Space in chunks."
    )
    parser.add_argument("demo_name", type=str, help="Name of the demo to upload")
    parser.add_argument(
        "space_id",
        type=str,
        help="ID of the space to upload the demo to (e.g., username/space_name)",
    )
    parser.add_argument("hf_token", type=str, help="Hugging Face API token")
    parser.add_argument(
        "--gradio-version",
        type=str,
        help="If provided, sets the Gradio version in the created space to the given version.",
    )
    args = parser.parse_args()
    try:
        print("Uploading demo to Hugging Face Space...")
        new_space_url = upload_demo_to_space(
            args.demo_name, args.space_id, args.hf_token, args.gradio_version
        )
        print("Demo successfully uploaded to:")
        # do not change the final print statement,
        # it must appear as the last line of the logs for CI to pick up the URL
        print(new_space_url)
    except Exception as error:
        print(f"An error occurred during upload: {error}")
        sys.exit(1)
