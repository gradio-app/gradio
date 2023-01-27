from __future__ import annotations

import tempfile
import textwrap
from pathlib import Path
import re

import huggingface_hub
import requests
from huggingface_hub import CommitOperationAdd

from gradio.themes.readme_content import README_CONTENT


class Theme:
    def _color(self, color: str, number: int = 500):
        return f"var(--color-{color}-{number})"

    def _use(self, property):
        assert property in self.__dict__ and not property.endswith("_dark")
        return f"var(--{property.replace('_', '-')})"

    def _get_theme_css(self):
        css = ":host, :root {\n"
        dark_css = ".dark {\n"
        theme_attr = [
            attr for attr in dir(self) if attr not in dir(Theme) or attr.startswith("_")
        ]
        for attr in theme_attr:
            val = getattr(self, attr)
            if val is None:
                continue
            attr = attr.replace("_", "-")
            if attr.endswith("-dark"):
                attr = attr[:-5]
                dark_css += f"  --{attr}: {val}; \n"
            else:
                css += f"  --{attr}: {val}; \n"
        css += "}"
        dark_css += "}"
        return css + "\n" + dark_css

    def upload_to_hub(
        self,
        author: str,
        repo_name: str,
        hf_token: str,
        theme_name: str | None = None,
        preview: str | None = None,
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
        if preview:
            preview = Path(preview)
            preview_str = f"![]({preview.name})"
            preview_exists = preview.exists()
        else:
            preview_str = "Add an image preview of your theme here!"
            preview_exists = False

        theme_name = theme_name or repo_name

        with tempfile.NamedTemporaryFile(mode="w", delete=False) as css_file:
            css_file.write(get_theme_css(self))
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as readme_file:
            readme_content = README_CONTENT.format(
                theme_name=theme_name,
                description=description or "Add a description of this theme here!",
                author=author,
                preview_str=preview_str,
                gradio_version=__version__
            )
            readme_file.write(textwrap.dedent(readme_content))
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as app_file:
            contents = open(app.__file__).read()
            contents = re.sub("theme=gr.themes.Default\(\)", f"theme='{author}/{repo_name}'", contents)
            app_file.write(contents)
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as req_file:
            req_file.write("https://gradio-builds.s3.amazonaws.com/7356a1c5f54ec9c5df17613b467f620b43711d45/gradio-3.16.2-py3-none-any.whl")

        api = huggingface_hub.HfApi()
        operations = [
            CommitOperationAdd(path_in_repo="theme.css", path_or_fileobj=css_file.name),
            CommitOperationAdd(
                path_in_repo="README.md", path_or_fileobj=readme_file.name
            ),
            CommitOperationAdd(
                path_in_repo="app.py", path_or_fileobj=app_file.name),
            CommitOperationAdd(
                path_in_repo="requirements.txt", path_or_fileobj=req_file.name
            )
        ]
        if preview_exists:
            operations.append(
                CommitOperationAdd(
                    path_in_repo=preview.name, path_or_fileobj=str(preview)
                )
            )
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

    @classmethod
    def from_hub(cls, repo_name: str):
        url = huggingface_hub.hf_hub_url(
            repo_id=repo_name, repo_type="space", filename="theme.css"
        )
        download = requests.get(url)
        if download.ok:
            return download.text
