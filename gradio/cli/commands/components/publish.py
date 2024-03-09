from __future__ import annotations

import random
import re
import shutil
import tempfile
from pathlib import Path
from typing import List, Optional

import httpx
import semantic_version
from huggingface_hub import HfApi
from rich import print
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from tomlkit import parse
from typer import Argument, Option
from typing_extensions import Annotated

colors = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"]

PYPI_REGISTER_URL = "https://pypi.org/account/register/"

README_CONTENTS = """
---
tags: [gradio-custom-component{template}]
title: {package_name} V{version}
colorFrom: {color_from}
colorTo: {color_to}
sdk: docker
pinned: false
license: apache-2.0
---
"""


def make_dockerfile(demo):
    return f"""
FROM python:3.9

WORKDIR /code

COPY --link --chown=1000 . .

RUN mkdir -p /tmp/cache/
RUN chmod a+rwx -R /tmp/cache/
ENV TRANSFORMERS_CACHE=/tmp/cache/

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1 \
	GRADIO_ALLOW_FLAGGING=never \
	GRADIO_NUM_PORTS=1 \
	GRADIO_SERVER_NAME=0.0.0.0 \
    GRADIO_SERVER_PORT=7860 \
	SYSTEM=spaces

CMD ["python", "{demo}"]
"""


def _ignore(_src, names):
    ignored = []
    for n in names:
        if "__pycache__" in n or n.startswith("dist") or n.startswith("node_modules"):
            ignored.append(n)
    return ignored


def _get_version_from_file(dist_file: Path) -> Optional[str]:
    match = re.search(r"-(\d+\.\d+\.\d+[a-zA-Z]*\d*)-", dist_file.name)
    if match:
        return match.group(1)


def _get_max_version(distribution_files: List[Path]) -> Optional[str]:
    versions = []
    for p in distribution_files:
        version = _get_version_from_file(p)
        # If anything goes wrong, just return None so we upload all files
        # better safe than sorry
        if version:
            try:
                versions.append(semantic_version.Version(version))
            except ValueError:
                return None
    return str(max(versions)) if versions else None


def _publish(
    dist_dir: Annotated[
        Path,
        Argument(help=f"Path to the wheel directory. Default is {Path('.') / 'dist'}"),
    ] = Path(".") / "dist",
    upload_pypi: Annotated[bool, Option(help="Whether to upload to PyPI.")] = True,
    pypi_username: Annotated[str, Option(help="The username for PyPI.")] = "",
    pypi_password: Annotated[str, Option(help="The password for PyPI.")] = "",
    upload_demo: Annotated[
        bool, Option(help="Whether to upload demo to HuggingFace.")
    ] = True,
    demo_dir: Annotated[
        Optional[Path], Option(help="Path to the demo directory.")
    ] = None,
    source_dir: Annotated[
        Optional[Path],
        Option(help="Path to the source directory of the custom component."),
    ] = None,
    hf_token: Annotated[
        Optional[str],
        Option(
            help="HuggingFace token for uploading demo. Can be omitted if already logged in via huggingface cli."
        ),
    ] = None,
    prefer_local: Annotated[
        bool,
        Option(
            help="Install the package from the local wheel in the demo space, even if it exists on PyPi."
        ),
    ] = False,
    upload_source: Annotated[
        bool,
        Option(
            help="Whether to upload the source code of the custom component, to share with the community."
        ),
    ] = True,
):
    console = Console()
    dist_dir = dist_dir.resolve()
    name = None
    description = None
    if not dist_dir.exists():
        raise ValueError(
            f"{dist_dir} does not exist. Run `gradio cc build` to create a wheel and source distribution."
        )
    if not dist_dir.is_dir():
        raise ValueError(f"{dist_dir} is not a directory")
    distribution_files = [
        p.resolve() for p in Path(dist_dir).glob("*") if p.suffix in {".whl", ".gz"}
    ]
    wheel_file = max(
        (p for p in distribution_files if p.suffix == ".whl"),
        key=lambda s: semantic_version.Version(str(s.name).split("-")[1]),
    )
    if not wheel_file:
        raise ValueError(
            "A wheel file was not found in the distribution directory. "
            "Run `gradio cc build` to create a wheel file."
        )
    config_file = None
    if upload_pypi and (not pypi_username or not pypi_password):
        panel = Panel(
            "It is recommended to upload your component to pypi so that [bold][magenta]anyone[/][/] "
            "can install it with [bold][magenta]pip install[/][/].\n\n"
            f"A PyPi account is needed. If you do not have an account, register account here: [blue]{PYPI_REGISTER_URL}[/]",
        )
        print(panel)
        upload_pypi = Confirm.ask(":snake: Upload to pypi?")
        if upload_pypi and (Path.home() / ".pypirc").exists():
            print(":closed_lock_with_key: Found .pypirc file in home directory.")
            config_file = str(Path.home() / ".pypirc")
        elif upload_pypi:
            print(
                ":light_bulb: If you have Two Factor Authentication enabled, the username is __token__ and your password is your API key."
            )
            pypi_username = Prompt.ask(":laptop_computer: Enter your pypi username")
            pypi_password = Prompt.ask(
                ":closed_lock_with_key: Enter your pypi password", password=True
            )
    if upload_pypi:
        try:
            from twine.commands.upload import upload as twine_upload  # type: ignore
            from twine.settings import Settings  # type: ignore
        except (ImportError, ModuleNotFoundError) as e:
            raise ValueError(
                "The twine library must be installed to publish to pypi."
                "Install it with pip, pip install twine."
            ) from e
        if pypi_username and pypi_password:
            twine_settings = Settings(username=pypi_username, password=pypi_password)
        elif config_file:
            twine_settings = Settings(config_file=config_file)
        else:
            raise ValueError(
                "No pypi username or password provided and no ~/.pypirc file found."
            )
        try:
            # do our best to only upload the latest versions
            max_version = _get_max_version(distribution_files)
            twine_files = [
                str(p)
                for p in distribution_files
                if (not max_version or max_version in p.name)
            ]
            print(f"Uploading files: {','.join(twine_files)}")
            twine_upload(twine_settings, twine_files)
        except Exception:
            console.print_exception()
    if upload_demo and not demo_dir:
        panel = Panel(
            "It is recommended you upload a demo of your component to [blue]https://huggingface.co/spaces[/] "
            "so that anyone can try it from their browser."
        )
        print(panel)
        upload_demo = Confirm.ask(":hugging_face: Upload demo?")
        if upload_demo:
            panel = Panel(
                "Please provide the path to the [magenta]demo directory[/] for your custom component.\n\n"
                "This directory should contain [magenta]all the files[/] it needs to run successfully.\n\n"
                "Please make sure the gradio app is in an [magenta]app.py[/] file.\n\n"
                "If you need additional python requirements, add a [magenta]requirements.txt[/] file to this directory."
            )
            print(panel)
            demo_dir_ = Prompt.ask(
                f":roller_coaster: Please enter the path to the demo directory. Leave blank to use: {(Path('.') / 'demo')}"
            )
            demo_dir_ = demo_dir_ or str(Path(".") / "demo")
            demo_dir = Path(demo_dir_).resolve()

    if upload_source and not source_dir:
        panel = Panel(
            "It is recommended that you share your [magenta]source code[/] so that others can learn from and improve your component."
        )
        print(panel)
        upload_source = Confirm.ask(":books: Would you like to share your source code?")
        if upload_source:
            source_dir_ = Prompt.ask(
                ":page_with_curl: Enter the path to the source code [magenta]directory[/]. Leave blank to use current directory"
            )
            source_dir_ = source_dir_ or str(Path("."))
            source_dir = Path(source_dir_).resolve()
    if upload_demo:
        pyproject_toml_path = (
            (source_dir / "pyproject.toml")
            if source_dir
            else Path(".") / "pyproject.toml"
        )

        try:
            pyproject_toml = parse(pyproject_toml_path.read_text())
            package_name = pyproject_toml["project"]["name"]  # type: ignore
        except Exception:
            (package_name, version) = wheel_file.name.split("-")[:2]

        try:
            latest_release = httpx.get(
                f"https://pypi.org/pypi/{package_name}/json"
            ).json()["info"]["version"]
        except Exception:
            latest_release = None

        if not demo_dir:
            raise ValueError("demo_dir must be set")
        demo_path = resolve_demo(demo_dir)

        if prefer_local or not latest_release:
            additional_reqs = [wheel_file.name]
        else:
            additional_reqs = [f"{package_name}=={latest_release}"]
        if (demo_dir / "requirements.txt").exists():
            reqs = (demo_dir / "requirements.txt").read_text().splitlines()
            reqs += additional_reqs
        else:
            reqs = additional_reqs

        color_from, color_to = random.choice(colors), random.choice(colors)
        package_name, version = wheel_file.name.split("-")[:2]
        with tempfile.TemporaryDirectory() as tempdir:
            shutil.copytree(
                str(demo_dir),
                str(tempdir),
                dirs_exist_ok=True,
            )
            if source_dir:
                shutil.copytree(
                    str(source_dir),
                    str(Path(tempdir) / "src"),
                    dirs_exist_ok=True,
                    ignore=_ignore,
                )
            reqs_txt = Path(tempdir) / "requirements.txt"
            reqs_txt.write_text("\n".join(reqs))
            readme = Path(tempdir) / "README.md"
            template = ""
            if upload_source and source_dir:
                pyproject_toml = parse((source_dir / "pyproject.toml").read_text())
                keywords = pyproject_toml["project"].get("keywords", [])  # type: ignore
                keywords = [
                    k
                    for k in keywords
                    if k not in {"gradio-custom-component", "gradio custom component"}
                ]
                if keywords:
                    template = "," + ",".join(keywords)
                name = pyproject_toml["project"]["name"]  # type: ignore
                description = pyproject_toml["project"]["description"]  # type: ignore

            readme_text = README_CONTENTS.format(
                package_name=package_name,
                version=version,
                color_from=color_from,
                color_to=color_to,
                template=template,
            )

            if name and description:
                readme_text += f"\n\n# Name: {name}"
                readme_text += f"\n\nDescription: {description}"
                readme_text += f"\n\nInstall with: pip install {package_name}"

            readme.write_text(readme_text)
            dockerfile = Path(tempdir) / "Dockerfile"
            dockerfile.write_text(make_dockerfile(demo_path.name))

            api = HfApi()
            new_space = api.create_repo(
                repo_id=f"{package_name}",
                repo_type="space",
                exist_ok=True,
                private=False,
                space_sdk="docker",
                token=hf_token,
            )
            api.upload_folder(
                repo_id=new_space.repo_id,
                folder_path=tempdir,
                token=hf_token,
                repo_type="space",
            )
            api.upload_file(
                repo_id=new_space.repo_id,
                path_or_fileobj=str(wheel_file),
                path_in_repo=wheel_file.name,
                token=hf_token,
                repo_type="space",
            )
            print("\n")
            print(f"Demo uploaded to {new_space} !")


def resolve_demo(demo_dir: Path) -> Path:
    _demo_dir = demo_dir.resolve()
    if (_demo_dir / "space.py").exists():
        return _demo_dir / "space.py"
    elif (_demo_dir / "app.py").exists():
        return _demo_dir / "app.py"
    else:
        raise FileNotFoundError(
            f'Could not find "space.py" or "app.py" in "{demo_dir}".'
        )
