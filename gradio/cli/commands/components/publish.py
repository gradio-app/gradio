from __future__ import annotations

import re
import shutil
import tempfile
from pathlib import Path
from typing import Annotated, Optional

import semantic_version
from huggingface_hub import HfApi
from rich import print
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from tomlkit import parse
from typer import Argument, Option

from gradio.analytics import custom_component_analytics

colors = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"]

PYPI_REGISTER_URL = "https://pypi.org/account/register/"


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


def _get_max_version(distribution_files: list[Path]) -> Optional[str]:
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
        Path,
        Option(help="Path to the source directory of the custom component."),
    ] = Path("."),
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
    ] = False,
    repo_id: Annotated[
        Optional[str],
        Option(
            help="The repository id to upload the demo to. If not provided, a space will be created with the same name as the package in the HuggingFace account corresponding to the hf_token."
        ),
    ] = None,
):
    custom_component_analytics(
        "publish",
        None,
        upload_demo=upload_demo,
        upload_pypi=upload_pypi,
        upload_source=upload_source,
    )
    console = Console()
    dist_dir = dist_dir.resolve()

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
            from twine.exceptions import InvalidDistribution  # type: ignore
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
            try:
                twine_upload(twine_settings, twine_files)
            except InvalidDistribution as e:
                raise ValueError(
                    "Invalid distribution when uploading to pypi. "
                    "Try upgrading 'pkginfo' with python -m pip install pkginfo --upgrade"
                ) from e
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
                "Please make sure the gradio app is in an [magenta]space.py[/] file.\n\n"
                "If you need additional python requirements, add a [magenta]requirements.txt[/] file to this directory."
            )
            print(panel)
            demo_dir_ = Prompt.ask(
                f":roller_coaster: Please enter the path to the demo directory. Leave blank to use: {(Path('.') / 'demo')}"
            )
            demo_dir_ = demo_dir_ or str(Path(".") / "demo")
            demo_dir = Path(demo_dir_).resolve()

    if upload_demo and not upload_source:
        panel = Panel(
            "It is recommended that you share your [magenta]source code[/] so that others can learn from and improve your component."
        )
        print(panel)
        upload_source = Confirm.ask(":books: Would you like to share your source code?")
        if upload_source:
            source_dir_ = (
                Prompt.ask(
                    f":file_folder: Please enter the path to the source directory. Leave blank to use: {source_dir}"
                )
                or source_dir
            )
            source_dir = Path(source_dir_).resolve()
    if upload_demo:
        pyproject_toml_path = source_dir / "pyproject.toml"

        try:
            pyproject_toml = parse(pyproject_toml_path.read_text())
            package_name = pyproject_toml["project"]["name"]  # type: ignore
        except Exception:
            (package_name, _) = wheel_file.name.split("-")[:2]

        if not demo_dir:
            raise ValueError("demo_dir must be set")

        package_name, _ = wheel_file.name.split("-")[:2]
        with tempfile.TemporaryDirectory() as tempdir:
            shutil.copytree(
                str(demo_dir),
                str(tempdir),
                dirs_exist_ok=True,
            )
            shutil.copyfile(
                str(source_dir / ".gitignore"),
                str(Path(tempdir) / ".gitignore"),
            )
            if upload_source:
                shutil.copytree(
                    str(source_dir),
                    str(Path(tempdir) / "src"),
                    dirs_exist_ok=True,
                    ignore=_ignore,
                )

            shutil.copyfile(
                str(source_dir / "README.md"), str(Path(tempdir) / "README.md")
            )

            api = HfApi(token=hf_token)
            repo_url = api.create_repo(
                repo_id=repo_id or package_name,
                repo_type="space",
                exist_ok=True,
                space_sdk="gradio",
            )
            repo_id = repo_url.repo_id
            api.upload_folder(
                repo_id=repo_id,
                folder_path=tempdir,
                repo_type="space",
            )
            if prefer_local:
                api.upload_file(
                    repo_id=repo_id,
                    path_or_fileobj=str(wheel_file),
                    path_in_repo=wheel_file.name,
                    repo_type="space",
                )
            print("\n")
            # Do a factory reboot so that the new dependencies get installed
            api.restart_space(repo_id=repo_id, factory_reboot=True, token=hf_token)
            print(f"Demo uploaded to https://huggingface.co/spaces/{repo_id} !")


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
