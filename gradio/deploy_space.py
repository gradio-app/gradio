from __future__ import annotations

import json
import os
import sys
import random
import re
import gradio as gr

import huggingface_hub


def add_configuration_to_readme(repo_directory, readme_file) -> dict:
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
        if not os.path.isfile(file_path) or not file.endswith(".py"):
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
        raise FileNotFoundError("Failed to find Gradio app file.")
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
    configuration[
        "python_version"
    ] = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    configuration["sdk_version"] = gr.__version__
    huggingface_hub.metadata_save(readme_file, configuration)

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
        while True:
            requirement = input("Enter a dependency (leave blank to end): ")
            if not requirement:
                break
            with open(requirements_file, "a") as f:
                f.write(requirement + "\n")

    return configuration


def format_title(title: str):
    title = title.replace(" ", "_")
    title = re.sub(r"[^a-zA-Z0-9\-._]", "", title)
    title = re.sub("-+", "-", title)
    while title.startswith("."):
        title = title[1:]
    return title


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
    configuration: None | dict = None
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
        
    space_id = huggingface_hub.create_repo(
        configuration["title"],
        space_sdk="gradio",
        repo_type="space",
        exist_ok=True,
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
