import shutil
import textwrap
from pathlib import Path

import pytest

from gradio.cli.commands.components._create_utils import OVERRIDES
from gradio.cli.commands.components.build import _build
from gradio.cli.commands.components.create import _create
from gradio.cli.commands.components.install_component import _get_executable_path
from gradio.cli.commands.components.publish import _get_version_from_file
from gradio.cli.commands.components.show import _show


@pytest.mark.parametrize(
    "template",
    [
        "Row",
        "Column",
        "Tabs",
        "Group",
        "Accordion",
        "AnnotatedImage",
        "HighlightedText",
        "BarPlot",
        "ClearButton",
        "ColorPicker",
        "DuplicateButton",
        "LinePlot",
        "LogoutButton",
        "LoginButton",
        "ScatterPlot",
        "UploadButton",
        "JSON",
        "FileExplorer",
        "Model3D",
    ],
)
def test_template_override_component(template, tmp_path):
    _create(
        "MyComponent",
        tmp_path,
        template=template,
        overwrite=True,
        install=False,
        configure_metadata=False,
    )
    app = (tmp_path / "demo" / "app.py").read_text()
    answer = textwrap.dedent(
        f"""
import gradio as gr
from gradio_mycomponent import MyComponent

{OVERRIDES[template].demo_code.format(name="MyComponent")}

if __name__ == "__main__":
    demo.launch()
"""
    )
    assert app.strip() == answer.strip()
    assert (tmp_path / "backend" / "gradio_mycomponent" / "mycomponent.py").exists()
    source_code = (
        tmp_path / "backend" / "gradio_mycomponent" / "mycomponent.py"
    ).read_text()
    assert "@document()" not in source_code


def test_get_executable_path():
    assert _get_executable_path(
        "pip", None, "--pip-path", check_3=True
    ) == shutil.which("pip3")
    assert _get_executable_path("pip", None, "--pip-path") == shutil.which("pip")
    assert _get_executable_path(
        "pip", shutil.which("pip"), "--pip-path"
    ) == shutil.which("pip")
    assert _get_executable_path(
        "gradio", None, "--pip-path", check_3=True
    ) == shutil.which("gradio")
    with pytest.raises(
        ValueError,
        match=r"Could not find foo. Please ensure it is installed and in your PATH or pass the --foo-path parameter.",
    ):
        _get_executable_path("foo", None, "--foo-path")
    with pytest.raises(
        ValueError,
        match=r"The provided foo path \(/foo/bar/fum\) does not exist or is not a file.",
    ):
        _get_executable_path("foo", "/foo/bar/fum", "--foo-path")


def test_raise_error_component_template_does_not_exist(tmp_path):
    with pytest.raises(
        ValueError,
        match="Cannot find NonExistentComponent in gradio.components, gradio.layouts, or gradio._simple_templates",
    ):
        _create(
            "MyComponent",
            tmp_path,
            template="NonExistentComponent",
            overwrite=True,
            install=False,
            configure_metadata=False,
        )


def test_do_not_replace_class_name_in_import_statement(tmp_path):
    _create(
        "MyImage",
        template="Image",
        directory=tmp_path,
        overwrite=True,
        install=False,
        configure_metadata=False,
    )
    code = (tmp_path / "backend" / "gradio_myimage" / "myimage.py").read_text()
    assert "import PIL.Image" in code
    assert "class MyImage" in code
    assert "PIL.Image.Image" in code


def test_raises_if_directory_exists(tmp_path):
    with pytest.raises(
        Exception
    ):  # Keeping it a general exception since the specific exception seems to differ between operating systems
        _create("MyComponent", tmp_path, configure_metadata=False)


def test_show(capsys):
    _show()
    stdout, _ = capsys.readouterr()
    assert "Form Component" in stdout
    assert "Beginner Friendly" in stdout
    assert "Layout" in stdout
    assert "Dataframe" not in stdout
    assert "Dataset" not in stdout


@pytest.mark.xfail
@pytest.mark.parametrize("template", ["Image"])
def test_build(template, virtualenv):
    # Copy pnpm-lock.yaml to not cause unintended changes tracked by git
    pnpm_lock = Path(__file__).parent / ".." / "pnpm-lock.yaml"
    pnpm_copy = Path(__file__).parent / ".." / "pnpm-lock-copy.yaml"
    shutil.copy(str(pnpm_lock), str(pnpm_copy))

    # Using the js/preview/test directory will use the workspace code
    dir_ = (
        Path(__file__).parent / ".." / "js" / "preview" / "test" / "testtextbox"
    ).resolve()
    shutil.rmtree(str(dir_), ignore_errors=True)

    try:
        # Local installs of gradio and gradio-client
        gradio_dir = Path(__file__).parent / ".."
        client = Path(__file__).parent / ".." / "client" / "python"
        virtualenv.run("pip install build")
        virtualenv.run(f"pip install -e {str(gradio_dir)}")
        virtualenv.run(f"pip install -e {str(client)}")

        virtualenv.run(
            f"{shutil.which('gradio')} cc create TestTextbox --template {template} --no-configure-metadata --directory {str(dir_)}",
        )
        assert (dir_ / "frontend" / "node_modules").exists()

        # need to reinstall local client because installing the custom component
        # will pull latest stable version from pypi
        virtualenv.run(f"pip install -e {str(client)}")
        virtualenv.run(f"{shutil.which('gradio')} cc build {str(dir_)}")

        template_dir: Path = dir_ / "backend" / "gradio_testtextbox" / "templates"
        assert template_dir.exists() and template_dir.is_dir()
        assert list(template_dir.glob("**/index.js"))
        assert (dir_ / "dist").exists() and list((dir_ / "dist").glob("*.whl"))
    finally:
        shutil.move(str(pnpm_copy), str(pnpm_lock))
        shutil.rmtree(str(dir_), ignore_errors=True)


def test_build_fails_if_component_not_installed(tmp_path):
    _create(
        "MyComponent",
        tmp_path,
        template="SimpleTextbox",
        overwrite=True,
        install=False,
        configure_metadata=False,
    )
    with pytest.raises(
        ValueError,
        match=r"Your custom component package \(gradio_mycomponent\) is not installed!",
    ):
        _build(tmp_path)


def test_fallback_template_app(tmp_path):
    _create(
        "SimpleComponent2",
        directory=tmp_path,
        overwrite=True,
        install=False,
        configure_metadata=False,
    )
    app = (tmp_path / "demo" / "app.py").read_text()
    answer = textwrap.dedent(
        """

import gradio as gr
from gradio_simplecomponent2 import SimpleComponent2


with gr.Blocks() as demo:
    gr.Markdown("# Change the value (keep it JSON) and the front-end will update automatically.")
    SimpleComponent2(value={"message": "Hello from Gradio!"}, label="Static")


if __name__ == "__main__":
    demo.launch()

"""
    )
    assert app.strip() == answer.strip()


def test_get_version_from_wheel():
    assert (
        _get_version_from_file(Path("gradio_textwithattachments-0.0.3-py3-none.whl"))
        == "0.0.3"
    )
    assert (
        _get_version_from_file(Path("gradio_textwithattachments-1.0.3b12-py3-none.whl"))
        == "1.0.3b12"
    )
