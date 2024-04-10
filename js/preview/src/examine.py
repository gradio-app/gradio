import argparse
import importlib
import inspect
import os
from pathlib import Path
import sys

from tomlkit import dumps, parse

from gradio.blocks import BlockContext
from gradio.components import Component

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Description of your program")
    parser.add_argument("-m", "--mode", help="Build mode or dev mode")
    args = parser.parse_args()

    try:
        with open("../pyproject.toml") as f:
            pyproject_source = f.read()

        pyproject_toml = parse(pyproject_source)
        keywords = pyproject_toml["project"]["keywords"]
        custom_component = ("gradio-custom-component" in  keywords or
                            "gradio custom component" in keywords)
        if not custom_component:
            sys.exit(0)

        module_name = pyproject_toml["project"]["name"]
        module = importlib.import_module(module_name)

        artifacts: list[str] = pyproject_toml["tool"]["hatch"]["build"]["artifacts"]

        def get_relative_path(path):
            return (
                os.path.abspath(Path(__file__).parent / path)
                .replace(os.path.abspath(os.getcwd()), "")
                .lstrip("/")
            )

        for name in dir(module):
            value = getattr(module, name)
            if name.startswith("__"):
                continue

            if inspect.isclass(value) and (
                issubclass(value, BlockContext) or issubclass(value, Component)
            ):
                file_location = Path(inspect.getfile(value)).parent

                found = [
                    x
                    for x in artifacts
                    if get_relative_path(Path("..") / x)
                    == get_relative_path(file_location / value.TEMPLATE_DIR)
                ]
                if len(found) == 0:
                    artifacts.append(
                        os.path.abspath(file_location / value.TEMPLATE_DIR)
                        .replace(os.path.abspath(Path("..")), "")
                        .lstrip("/")
                    )

                print(
                    f"{name}~|~|~|~{os.path.abspath(file_location  / value.TEMPLATE_DIR)}~|~|~|~{os.path.abspath(file_location / value.FRONTEND_DIR)}~|~|~|~{value.get_component_class_id()}"
                )
                continue

        if args.mode == "build":
            pyproject_toml["tool"]["hatch"]["build"]["artifacts"] = artifacts

            with open("../pyproject.toml", "w") as f:
                f.write(dumps(pyproject_toml))
    except Exception as e:
        _, _, exc_tb = sys.exc_info()
        print(f"|EXCEPTION|:{str(e)}, examine.py line {exc_tb.tb_lineno}")