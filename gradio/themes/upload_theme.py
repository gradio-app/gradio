from __future__ import annotations

from gradio.themes import ThemeClass
import argparse


def main():
    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument("theme", type=str, help="Theme json file")
    parser.add_argument(
        "repo_name", type=str, help="HF repo name to store the theme"
    )
    parser.add_argument("version", type=str, help="Semver version")
    parser.add_argument("hf_token", type=str, help="HF Token")
    parser.add_argument(
        "--theme-name",
        type=str,
        help="Name of theme.",
    )
    parser.add_argument(
        "--description",
        type=str,
        help="Description of theme",
    )
    args = parser.parse_args()
    upload_theme(
        args.theme, args.repo_name,
        args.version, args.hf_token, args.theme_name, args.description
    )


def upload_theme(
    theme: str,
    repo_name: str,
    version: str,
    hf_token: str,
    theme_name: str | None = None,
    description: str | None = None,
):
    theme = ThemeClass.load(theme)

    return theme.to_hub(repo_name, version, hf_token, theme_name, description)
