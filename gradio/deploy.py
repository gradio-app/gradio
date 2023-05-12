import json
import os
import random
import re

import huggingface_hub


def add_configuration_to_readme(repo_directory, readme_file):
    configuration = {}

    dir_name = os.path.basename(repo_directory)
    title = input(f"Enter Spaces app title [{dir_name}]: ") or dir_name
    formatted_title = format_title(title)
    if formatted_title != title:
        print(f"Formatted to {formatted_title}. ")
    configuration["title"] = formatted_title

    app_file = None
    for file in os.listdir(repo_directory):
        file_path = os.path.join(repo_directory, file)
        if (not os.path.isfile(file_path)) or (
            not file.endswith(".py") and not file.endswith(".ipynb")
        ):
            continue

        with open(file_path, encoding="utf-8", errors="ignore") as f:
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
    if app_file.endswith(".ipynb"):
        configuration["notebook_file"] = app_file
        app_file = "_" + configuration["notebook_file"].replace(".ipynb", ".py")
    configuration["app_file"] = app_file

    emoji_set = "🤯🤖🧠🐶👑💥🐮🎁🐙🦋"
    default_emoji = random.choice(emoji_set)
    configuration["emoji"] = (
        input(f"Enter Spaces Card emoji [{default_emoji}]: ") or default_emoji
    )

    color_set = ["red", "yellow", "green", "blue", "indigo", "purple", "pink", "gray"]
    default_color = random.choice(color_set)
    color = input(f"Enter Spaces Card color [{default_color}]: ") or default_color
    configuration["colorFrom"] = color
    configuration["colorTo"] = color
    configuration["sdk"] = "gradio"
    huggingface_hub.metadata_save(readme_file, configuration)

    configuration["hardware"] = (
        input(
            f"Enter Spaces hardware ({', '.join(hardware.value for hardware in huggingface_hub.SpaceHardware)}) [cpu-basic]: "
        )
        or "cpu-basic"
    )
    secrets = {}
    if input("Any Spaces secrets (y/n) [n]: ") == "y":
        while True:
            secret_name = input("Enter secret name (leave blank to end): ")
            if not secret_name:
                break
            secret_value = input(f"Enter secret value for {secret_name}: ")
            secrets[secret_name] = secret_value
    configuration["secrets"] = secrets

    requirements_file = os.path.join(repo_directory, "requirements.txt")
    if (
        not os.path.exists(requirements_file)
        and input("Create requirements.txt file? (y/n) [n]: ").lower() == "y"
    ):
        input(
            "Created requirements.txt file. Please add any dependencies to this file now. Press enter to continue. "
        )

    return configuration


def format_title(title):
    title = title.replace(" ", "_")
    title = re.sub("[^a-zA-Z0-9\-._]", "", title)
    title = re.sub("-+", "-", title)
    while title.startswith("."):
        title = title[1:]
    return title


def notebook_to_script(notebook_path, script_path):
    print(f"Converting {notebook_path} to {script_path}.")
    with open(notebook_path, encoding="utf-8") as f:
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


def deploy():
    if (
        os.getenv("SYSTEM") == "spaces"
    ):  # in case a repo with this function is uploaded to spaces
        return

    hf_api = huggingface_hub.HfApi()
    whoami = None
    login = False
    try:
        whoami = hf_api.whoami()
        if whoami["auth"]["accessToken"]["role"] != "write":
            login = True
    except OSError:
        login = True
    if login:
        print("Need 'write' access token to create a Spaces repo.")
        huggingface_hub.login(add_to_git_credential=False)
        whoami = hf_api.whoami()

    repo_directory = os.getcwd()
    readme_file = os.path.join(repo_directory, "README.md")
    configuration = None
    if os.path.exists(readme_file):
        try:
            configuration = huggingface_hub.metadata_load(readme_file)
        except ValueError:
            pass

    if configuration is None:
        print(
            f"Creating new Spaces Repo in '{repo_directory}'. Collecting metadata, press Enter to accept default value."
        )
        configuration = add_configuration_to_readme(repo_directory, readme_file)
    if configuration.get("notebook_file"):
        notebook_to_script(configuration["notebook_file"], configuration["app_file"])

    space_id = huggingface_hub.create_repo(
        configuration["title"],
        space_sdk="gradio",
        repo_type="space",
        exist_ok=True,
        space_hardware=configuration.get("hardware"),
    ).repo_id
    hf_api.upload_folder(
        repo_id=space_id,
        repo_type="space",
        folder_path=repo_directory,
    )
    if configuration.get("secrets"):
        for secret_name, secret_value in configuration["secrets"].items():
            huggingface_hub.add_space_secret(space_id, secret_name, secret_value)
    print(f"Space available at https://huggingface.co/spaces/{space_id}")
