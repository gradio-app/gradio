from __future__ import annotations

import argparse
import os
import random
import re
import sys

import huggingface_hub

import gradio as gr

repo_directory = os.getcwd()
readme_file = os.path.join(repo_directory, "README.md")


def add_configuration_to_readme(
    title: str | None, app_file: str | None, emoji: str | None, color: str | None
) -> dict:
    configuration = {}

    dir_name = os.path.basename(repo_directory)
    if title is None:
        title = input(f"Enter Spaces app title [{dir_name}]: ") or dir_name
    formatted_title = format_title(title)
    if formatted_title != title:
        print(f"Formatted to {formatted_title}. ")
    configuration["title"] = formatted_title

    if app_file is None:
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

    if emoji is None:
        emoji_set = "🤯🤖🧠🐶👑💥🐮🎁🐙🦋"
        default_emoji = random.choice(emoji_set)
        emoji = input(f"Enter Spaces Card emoji [{default_emoji}]: ") or default_emoji
    configuration["emoji"] = emoji

    if color is None:
        color_set = [
            "red",
            "yellow",
            "green",
            "blue",
            "indigo",
            "purple",
            "pink",
            "gray",
        ]
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
    parser = argparse.ArgumentParser(description="Deploy to Spaces")
    parser.add_argument("deploy")
    parser.add_argument("--title", type=str, help="Spaces app title")
    parser.add_argument("--app-file", type=str, help="File containing the Gradio app")
    parser.add_argument("--emoji", type=str, help="Enoji used for Spaces card")
    parser.add_argument("--color", type=str, help="Color used for Spaces card")

    args = parser.parse_args()

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
        configuration = add_configuration_to_readme(
            args.title, args.app_file, args.emoji, args.color
        )

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
