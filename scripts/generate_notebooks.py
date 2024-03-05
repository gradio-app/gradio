import json
import os
import random
import subprocess
from pathlib import Path

import nbformat as nbf

GRADIO_DEMO_DIR = Path.cwd() / "demo"
DEMOS_TO_SKIP = {"all_demos", "reset_components", "custom_path", "kitchen_sink_random"}

demos = os.listdir(GRADIO_DEMO_DIR)
demos = [
    demo
    for demo in demos
    if demo not in DEMOS_TO_SKIP
    and os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo))
    and os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "run.py"))
]


def git_tracked(demo, file):
    osstdout = subprocess.Popen(
        f"cd demo/{demo} && git ls-files --error-unmatch {file}",
        shell=True,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        close_fds=True,
    )
    osstdout.wait()
    return not osstdout.returncode


for demo in demos:
    nb = nbf.v4.new_notebook()
    text = f"# Gradio Demo: {demo}"

    if os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "DESCRIPTION.md")):
        with open(
            os.path.join(GRADIO_DEMO_DIR, demo, "DESCRIPTION.md"), encoding="utf8"
        ) as f:
            description = f.read()
        text += f"""\n### {description}
        """

    files = os.listdir(os.path.join(GRADIO_DEMO_DIR, demo))
    skip = [
        "run.py",
        "run.ipynb",
        "setup.sh",
        ".gitignore",
        "requirements.txt",
        "DESCRIPTION.md",
        "screenshot.png",
        "screenshot.gif",
    ]
    files = [file for file in files if file not in skip if git_tracked(demo, file)]
    files.sort()
    if files:
        get_files = "# Downloading files from the demo repo\nimport os"
        for file in files:
            if os.path.isdir(os.path.join(GRADIO_DEMO_DIR, demo, file)):
                sub_files = os.listdir(os.path.join(GRADIO_DEMO_DIR, demo, file))
                sub_files = [
                    sub
                    for sub in sub_files
                    if sub not in skip
                    if git_tracked(demo, f"{file}/{sub}")
                ]
                sub_files.sort()
                if sub_files:
                    get_files += f"\nos.mkdir('{file}')"
                for sub_file in sub_files:
                    get_files += f"\n!wget -q -O {file}/{sub_file} https://github.com/gradio-app/gradio/raw/main/demo/{demo}/{file}/{sub_file}"
            else:
                get_files += f"\n!wget -q https://github.com/gradio-app/gradio/raw/main/demo/{demo}/{file}"

    requirements = ""
    if os.path.exists(os.path.join(GRADIO_DEMO_DIR, demo, "requirements.txt")):
        with open(
            os.path.join(GRADIO_DEMO_DIR, demo, "requirements.txt"),
            encoding="utf8",
        ) as f:
            requirements = f.read().split("\n")
        requirements = " ".join(requirements)

    installs = f"!pip install -q gradio {requirements}"

    with open(os.path.join(GRADIO_DEMO_DIR, demo, "run.py"), encoding="utf8") as f:
        code = f.read()
        code = code.replace("os.path.dirname(__file__)", "os.path.abspath('')")

    if files:
        nb["cells"] = [
            nbf.v4.new_markdown_cell(text),
            nbf.v4.new_code_cell(installs),
            nbf.v4.new_code_cell(get_files),
            nbf.v4.new_code_cell(code),
        ]
    else:
        nb["cells"] = [
            nbf.v4.new_markdown_cell(text),
            nbf.v4.new_code_cell(installs),
            nbf.v4.new_code_cell(code),
        ]

    output_notebook = os.path.join(GRADIO_DEMO_DIR, demo, "run.ipynb")

    with open(output_notebook, "w", encoding="utf8") as f:
        nbf.write(nb, f)

    with open(output_notebook, encoding="utf8") as f:
        content = f.read()

    content = json.loads(content)
    for i, cell in enumerate(content["cells"]):
        random.seed(i)
        cell["id"] = str(random.getrandbits(128))

    with open(output_notebook, "w", encoding="utf8") as f:
        f.write(json.dumps(content))
