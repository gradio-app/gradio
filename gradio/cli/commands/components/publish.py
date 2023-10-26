import random
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from huggingface_hub import HfApi
from rich import print
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from typer import Argument, Option
from typing_extensions import Annotated

colors = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"]

PYPI_REGISTER_URL = "https://pypi.org/account/register/"

README_CONTENTS = """
---
tags: [gradio-custom-component]
title: {package_name} V{version}
colorFrom: {color_from}
colorTo: {color_to}
sdk: docker
pinned: false
license: apache-2.0
---
"""

DOCKERFILE = """
FROM python:3.9

WORKDIR /code

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1 \
	GRADIO_ALLOW_FLAGGING=never \
	GRADIO_NUM_PORTS=1 \
	GRADIO_SERVER_NAME=0.0.0.0 \
    GRADIO_SERVER_PORT=7860 \
	SYSTEM=spaces

CMD ["python", "app.py"]
"""


def _publish(
    wheel_file: Annotated[Path, Argument(help="Path to the wheel directory.")],
    upload_pypi: Annotated[bool, Option(help="Whether to upload to PyPI.")] = True,
    pypi_username: Annotated[str, Option(help="The username for PyPI.")] = "",
    pypi_password: Annotated[str, Option(help="The password for PyPI.")] = "",
    upload_demo: Annotated[
        bool, Option(help="Whether to upload demo to HuggingFace.")
    ] = True,
    demo_dir: Annotated[
        Optional[Path], Option(help="Path to the demo directory.")
    ] = None,
    hf_token: Annotated[
        Optional[str],
        Option(
            help="HuggingFace token for uploading demo. Can be omitted if already logged in via huggingface cli."
        ),
    ] = None,
):
    console = Console()
    wheel_file = wheel_file.resolve()
    if not wheel_file.suffix == ".whl":
        raise ValueError(
            "Please provide a wheel file. It must end with .whl. Run `gradio cc build` to create a wheel file."
        )
    if not wheel_file.exists():
        raise ValueError(
            f"{wheel_file} does not exist. Run `gradio cc build` to create a wheel file."
        )

    if upload_pypi and (not pypi_username or not pypi_password):
        panel = Panel(
            "You have opted to upload to [blue]https://pypi.org/[/] but no pypi credentials have been provided.\n"
            f"If you do not have an account, register account here: [blue]{PYPI_REGISTER_URL}[/]"
        )
        print(panel)
        pypi_username = Prompt.ask(":laptop_computer: Enter your pypi username")
        pypi_password = Prompt.ask(
            ":closed_lock_with_key: Enter your pypi password", password=True
        )
    if upload_pypi:
        from twine.commands.upload import upload as twine_upload
        from twine.settings import Settings

        twine_settings = Settings(username=pypi_username, password=pypi_password)
        try:
            twine_upload(twine_settings, [str(wheel_file)])
        except Exception:
            console.print_exception()
    if upload_demo and not demo_dir:
        panel = Panel(
            "You have opted to upload to [blue]https://huggingface.co/spaces[/] but no demo directory has been provided.\n"
            "Please provide the path to the [magenta]demo directory[/] for your custom component.\n"
            "This directory should contain [magenta]all the files[/] it needs to run successfully.\n"
            "Please make sure the gradio app is in an [magenta]app.py[/] file.\n"
            "If you need additional python requirements, add a [magenta]requirements.txt[/] file to this directory."
        )
        print(panel)
        demo_dir = Path(
            Prompt.ask(":hugging_face: Please enter demo directory")
        ).resolve()
    if upload_demo:
        assert demo_dir
        if not (demo_dir / "app.py").exists():
            raise FileNotFoundError("app.py not found in demo directory.")
        additional_reqs = [
            "https://gradio-builds.s3.amazonaws.com/4.0/attempt-03/gradio-4.0.0-py3-none-any.whl",
            "https://gradio-builds.s3.amazonaws.com/4.0/attempt-03/gradio_client-0.7.0b0-py3-none-any.whl",
            wheel_file.name,
        ]
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
            reqs_txt = Path(tempdir) / "requirements.txt"
            reqs_txt.write_text("\n".join(reqs))
            readme = Path(tempdir) / "README.md"
            readme.write_text(
                README_CONTENTS.format(
                    package_name=package_name,
                    version=version,
                    color_from=color_from,
                    color_to=color_to,
                )
            )
            dockerfile = Path(tempdir) / "Dockerfile"
            dockerfile.write_text(DOCKERFILE)

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
            print(f"Demo uploaded to {new_space}!")
