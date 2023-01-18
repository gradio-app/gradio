from __future__ import annotations

import tempfile
import textwrap
from pathlib import Path

import huggingface_hub
import requests
from huggingface_hub import CommitOperationAdd

from gradio.theming.readme_content import README_CONTENT


class Theme:
    def upload_to_hub(
        self,
        author: str,
        repo_name: str,
        hf_token: str,
        theme_name: str | None = None,
        preview: str | None = None,
        description: str | None = None,
    ):

        huggingface_hub.create_repo(
            repo_id=f"{author}/{repo_name}",
            token=hf_token,
            exist_ok=True,
            repo_type="dataset",
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
            )
            readme_file.write(textwrap.dedent(readme_content))

        api = huggingface_hub.HfApi()
        operations = [
            CommitOperationAdd(path_in_repo="theme.css", path_or_fileobj=css_file.name),
            CommitOperationAdd(
                path_in_repo="README.md", path_or_fileobj=readme_file.name
            ),
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
            repo_type="dataset",
            operations=operations,
            token=hf_token,
        )
        url = f"https://huggingface.co/datasets/{author}/{repo_name}"
        print(f"See your theme here! {url}")
        return url

    @classmethod
    def from_hub(cls, repo_name: str):
        url = huggingface_hub.hf_hub_url(
            repo_id=repo_name, repo_type="dataset", filename="theme.css"
        )
        download = requests.get(url)
        if download.ok:
            return download.text


def get_theme_css(theme: Theme):
    css = ":root {"
    dark_css = ".dark {"
    theme_attr = [attr for attr in dir(theme) if attr not in dir(Theme)]
    for attr in theme_attr:
        val = getattr(theme, attr)
        attr = attr.replace("_", "-")
        if attr.endswith("-dark"):
            attr = attr[:-5]
            dark_css += f"--{attr}: {val}; "
        else:
            css += f"--{attr}: {val}; "
    css += "}"
    dark_css += "}"
    return css + "\n" + dark_css
