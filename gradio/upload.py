import os
import random
import huggingface_hub
import json


def get_existing_configuration(readme_file):
    with open(readme_file, "r") as f:
        readme = f.read()
    if not readme.strip().startswith("---"):
        return None
    readme = readme.strip()
    if "---" not in readme[3:]:
        return None
    readme = readme.split("---")[1].strip()
    config = {}
    for line in readme.split("\n"):
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        config[key.strip()] = value.strip()
    return config


def add_configuration_to_readme(repo_directory, readme_file):
    dir_name = os.path.basename(repo_directory)
    app_name = input(f"Enter Spaces app name [{dir_name}]: ") or dir_name

    app_file = None
    for file in os.listdir(repo_directory):
        file_path = os.path.join(repo_directory, file)
        if (not os.path.isfile(file_path)) or (
            not file.endswith(".py") and not file.endswith(".ipynb")
        ):
            continue

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            if "import gradio" in content:
                app_file = file
                break

    app_file = (
        input(f"Enter Gradio app file {f'[{app_file}]' if app_file else ''}: ")
        or app_file
    )
    if not app_file or not os.path.exists(app_file):
        print("Failed to find Gradio app file.")
        return
    notebook_file = None
    if app_file.endswith(".ipynb"):
        notebook_file = app_file
        app_file = "_" + notebook_file.replace(".ipynb", ".py")

    EMOJI_SET = "🤯🤖🧠🐶👑💥🐮🎁🐙🦋"
    default_emoji = random.choice(EMOJI_SET)
    emoji = input(f"Enter Spaces Card emoji [{default_emoji}]: ") or default_emoji

    COLOR_SET = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"]
    default_color = random.choice(COLOR_SET)
    color = input(f"Enter Spaces Card color [{default_color}]: ") or default_color

    readme_header = f"""---
title: {app_name}
app_file: {app_file}
emoji: {emoji}
colorFrom: {color}
colorTo: {color}
sdk: gradio
{f'notebook_file: {notebook_file}' if notebook_file else ''}
---
"""
    with open(readme_file, "r") as f:
        readme = f.read()
    with open(readme_file, "w") as f:
        f.write(readme_header + readme)


def notebook_to_script(notebook_path, script_path):
    print(f"Converting {notebook_path} to {script_path}.")
    dependencies = []
    with open(notebook_path, "r", encoding="utf-8") as f:
        notebook = json.load(f)
    import_subprocess = False
    script_content = []

    for cell in notebook["cells"]:
        if cell["cell_type"] == "code":
            for line in cell["source"]:
                spaces = ""
                if line.startswith(" ") or line.startswith("\t"):
                    spaces = line[: len(line) - len(line.lstrip())]
                    line = line.strip()
                if line.startswith("!pip install") or line.startswith("%pip install"):
                    dependencies.extend(line[13:].strip().split(" "))
                elif line.startswith("%"):
                    continue
                elif line.startswith("!"):
                    command = line[1:].rstrip()
                    subprocess_call = f"subprocess.run('{command}', shell=True, check=True, text=True)"
                    script_content.append(spaces + subprocess_call)
                    import_subprocess = True
                else:
                    script_content.append(spaces + line)

            script_content.append("\n")

    if import_subprocess:
        script_content.insert(0, "import subprocess\n")

    script = "".join(script_content)
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script)
    return dependencies


def upload_to_spaces():
    if os.getenv("SYSTEM") == "spaces":  # in case a notebook has an upload call
        return

    hf_api = huggingface_hub.HfApi()
    whoami = None
    login = False
    try:
        whoami = hf_api.whoami()
        if whoami["auth"]["accessToken"]["role"] != "write":
            login = True
    except:
        login = True
    if login:
        print("Need 'write' access token to create a Spaces repo.")
        huggingface_hub.login(add_to_git_credential=False)
        whoami = hf_api.whoami()
    repo_directory = os.getcwd()
    readme_file = os.path.join(repo_directory, "README.md")
    if not os.path.exists(readme_file):
        with open(readme_file, "w") as f:
            f.write("")
    configuration = get_existing_configuration(readme_file)
    if not configuration:
        print(f"Creating new Spaces Repo in {repo_directory}")
        add_configuration_to_readme(repo_directory, readme_file)
        configuration = get_existing_configuration(readme_file)
    requirements_file = os.path.join(repo_directory, "requirements.txt")
    dependencies = []
    if configuration.get("notebook_file"):
        dependencies = notebook_to_script(
            configuration["notebook_file"], configuration["app_file"]
        )
    if (
        not os.path.exists(requirements_file)
        and input("Create requirements.txt file? [y/n]: ").lower() == "y"
    ):
        with open(requirements_file, "w") as f:
            f.write("\n".join(dependencies))
        input(
            "Created requirements.txt file. Please add any dependencies to this file. Press enter to continue. "
        )
    name = whoami["name"]
    space_id = f"{name}/{configuration['title']}"

    huggingface_hub.create_repo(
        space_id,
        space_sdk="gradio",
        repo_type="space",
        exist_ok=True,
    )
    hf_api.upload_folder(
        repo_id=space_id,
        repo_type="space",
        folder_path=repo_directory,
    )
    print(f"Space available at https://huggingface.co/spaces/{space_id}")
