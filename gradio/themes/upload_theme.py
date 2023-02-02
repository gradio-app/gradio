from __future__ import annotations

import json

import tempfile
import textwrap
import re

import huggingface_hub
from huggingface_hub import CommitOperationAdd
from gradio.themes.readme_content import README_CONTENT
from gradio.themes import Theme
import argparse

def main():
    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument("theme", type=str, help="Theme json file")
    parser.add_argument(
        "author", type=str, help="HF username"
    )
    parser.add_argument(
        "repo_name", type=str, help="HF repo name to store the theme"
    )
    parser.add_argument("version", type=str, help="Semver version")
    parser.add_argument("hf_token", type=str, help="HF Token")
    parser.add_argument(
        "--theme-name",
        type=str,
        help="Name of theme.",
    )
    parser.add_argument(
        "--description",
        type=str,
        help="Description of theme",
    )
    args = parser.parse_args()
    new_space = upload_theme(
        args.theme, args.author, args.repo_name,
        args.version, args.hf_token, args.theme_name, args.description
    )


def upload_theme(
    theme: str,
    author: str,
    repo_name: str,
    version: str,
    hf_token: str,
    theme_name: str | None = None,
    description: str | None = None,
):
    from gradio import __version__
    from gradio.themes import app

    huggingface_hub.create_repo(
        f"{author}/{repo_name}",
        repo_type="space",
        space_sdk="gradio",
        token=hf_token,
        exist_ok=True
    )

    theme_obj = Theme.load(theme)

    theme_name = theme_name or repo_name

    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as css_file:
        contents = theme_obj.to_dict()
        contents['version'] = version
        json.dump(contents, css_file)
    with tempfile.NamedTemporaryFile(mode="w", delete=False) as readme_file:
        readme_content = README_CONTENT.format(
            theme_name=theme_name,
            description=description or "Add a description of this theme here!",
            author=author,
            gradio_version=__version__
        )
        readme_file.write(textwrap.dedent(readme_content))
    with tempfile.NamedTemporaryFile(mode="w", delete=False) as app_file:
        contents = open(app.__file__).read()
        contents = re.sub("theme=gr.themes.Default\(\)", f"theme='{author}/{repo_name}@{version}'", contents)
        app_file.write(contents)
    with tempfile.NamedTemporaryFile(mode="w", delete=False) as req_file:
        req_file.write("https://gradio-builds.s3.amazonaws.com/theme-share/attempt-2/gradio-3.16.2-py3-none-any.whl")

    api = huggingface_hub.HfApi()
    operations = [
        CommitOperationAdd(path_in_repo=f"themes/theme_schema@{theme_obj.SCHEMA_VERSION}_version@{version}.json", path_or_fileobj=css_file.name),
        CommitOperationAdd(
            path_in_repo="README.md", path_or_fileobj=readme_file.name
        ),
        CommitOperationAdd(
            path_in_repo="app.py", path_or_fileobj=app_file.name),
        CommitOperationAdd(
            path_in_repo="requirements.txt", path_or_fileobj=req_file.name
        )
    ]

    api.create_commit(
        repo_id=f"{author}/{repo_name}",
        commit_message="Updating theme",
        repo_type="space",
        operations=operations,
        token=hf_token,
    )
    url = f"https://huggingface.co/spaces/{author}/{repo_name}"
    print(f"See your theme here! {url}")
    return url
