from __future__ import annotations

import inspect
import shutil
from pathlib import Path

import click

import gradio
from gradio.analytics import custom_component_analytics

from ..display import LivePanelDisplay, ask, confirm, print_box
from . import _create_utils, _pyproject
from .install_component import _get_npm, _install_command


def _create(
    name: str,
    directory: Path | None = None,
    package_name: str | None = None,
    template: str = "",
    install: bool = True,
    npm_install: str = "npm install",
    pip_path: str | None = None,
    overwrite: bool = False,
    configure_metadata: bool = True,
):
    custom_component_analytics(
        "create",
        template,
        None,
        None,
        None,
        npm_install=npm_install,
    )
    if not directory:
        directory = Path(name.lower())
    if not package_name:
        package_name = f"gradio_{name.lower()}"

    if directory.exists() and not overwrite:
        raise ValueError(
            f"The directory {directory.resolve()} already exists. "
            "Please set --overwrite flag or pass in the name "
            "of a directory that does not already exist via the --directory option."
        )
    elif directory.exists() and overwrite:
        _create_utils.delete_contents(directory)

    directory.mkdir(exist_ok=overwrite)

    if _create_utils._in_test_dir():
        npm_install = f"{shutil.which('pnpm')} i --ignore-scripts"
    else:
        npm_install = _get_npm(npm_install)

    with LivePanelDisplay() as live:
        live.update(
            f"🏗  Creating component {name} in directory {directory}",
            add_sleep=0.2,
        )
        if template:
            live.update(f"📠 Starting from template {template}")
        else:
            live.update("📄 Creating a new component from scratch.")

        component = _create_utils._get_component_code(template)

        _create_utils._create_backend(name, component, directory, package_name)
        live.update("🐍 Created backend code", add_sleep=0.2)
        p = Path(inspect.getfile(gradio)).parent
        component_source = p / "_frontend_code" / gradio.__version__ / component.js_dir
        if not component_source.exists():
            live.update(
                "⏬ Downloading frontend code from Hugging Face Hub. Set HF_HUB_DISABLE_PROGRESS_BARS to disable progress bars.",
                add_sleep=0.2,
            )
        _create_utils._create_frontend(
            name.lower(), component, directory=directory, package_name=package_name
        )
        live.update("🎨 Created frontend code", add_sleep=0.2)

        if install:
            _install_command(directory, live, npm_install, pip_path)

        description = "A gradio custom component"
        keywords = []

        if configure_metadata:
            print_box(
                "It is recommended to answer the following 4 questions to finish configuring your custom component's metadata."
                "\nYou can also answer them later by editing the pyproject.toml file in your component directory."
            )

            answer_qs = confirm("\nDo you want to answer them now?")

            if answer_qs:
                project = _pyproject.load(directory / "pyproject.toml")["project"]
                changes: dict[str, str | list[str]] = {}

                description = ask(
                    "\n📝 Please enter a one sentence description for your component"
                )
                if description:
                    changes["description"] = description

                license_ = (
                    ask(
                        "\n📑 Please enter a software license for your component. Leave blank for 'apache-2.0'"
                    )
                    or "apache-2.0"
                )
                print(f"📑 Using license {license_}")
                changes["license"] = license_

                requires_python = (
                    ask(
                        "\n🐍 Please enter the allowed python versions for your component. Leave blank for '>=3.11'"
                    )
                    or ">=3.11"
                )
                print(f"🐍 Using requires-python of {requires_python}")
                changes["requires-python"] = requires_python

                print(
                    "\n🏷 Please add some keywords to help others discover your component."
                )
                while True:
                    keyword = ask("🏷 Leave blank to stop adding keywords")
                    if keyword:
                        keywords.append(keyword)
                    else:
                        break
                changes["keywords"] = project.get("keywords", []) + keywords
                _pyproject.set_project_values(directory / "pyproject.toml", changes)

        (directory / "demo" / "requirements.txt").write_text(package_name)
        readme_path = Path(__file__).parent / "files" / "README.md"

        readme_contents = readme_path.read_text()
        tags = f", {', '.join(keywords)}" if keywords else ""
        template = f", {template}"
        readme_contents = (
            readme_contents.replace("<<title>>", package_name)
            .replace("<<short-description>>", description)
            .replace("<<tags>>", tags)
            .replace("<<template>>", template)
        )
        (directory / "README.md").write_text(readme_contents)

        print("\nComponent creation complete!")


create_command = click.Command(
    name="create",
    callback=_create,
    help="Create a new component. NAME is the name of the component, preferably in camel case, i.e. MyTextBox.",
    params=[
        click.Argument(["name"]),
        click.Option(
            ["--directory"],
            type=click.Path(path_type=Path),
            help="Directory to create the component in. Default is None. If None, will be created in <component-name> directory in the current directory.",
        ),
        click.Option(
            ["--package-name"],
            help="Name of the package. Default is gradio_{name.lower()}",
        ),
        click.Option(
            ["--template"],
            default="",
            help="Component to use as a template. Should use exact name of python class.",
        ),
        click.Option(
            ["--install/--no-install"],
            default=True,
            show_default=True,
            help="Whether to install the component in your current environment as a development install. Recommended for development.",
        ),
        click.Option(
            ["--npm-install"],
            default="npm install",
            show_default=True,
            help="NPM install command to use.",
        ),
        click.Option(
            ["--pip-path"],
            help="Path to pip executable. If None, will use the default path found by `which pip3`. If pip3 is not found, `which pip` will be tried. If both fail an error will be raised.",
        ),
        click.Option(
            ["--overwrite/--no-overwrite"],
            default=False,
            show_default=True,
            help="Whether to overwrite the existing component if it exists.",
        ),
        click.Option(
            ["--configure-metadata/--no-configure-metadata"],
            default=True,
            show_default=True,
            help="Whether to interactively configure project metadata based on user input",
        ),
    ],
)
