import shutil
import pathlib
import argparse

current_dir = (pathlib.Path(__file__).parent / "..").resolve()


def format_release_notes(latest_version: str):
    shutil.copy(current_dir / "website" / "releases" / "UPCOMING.md",
                current_dir / "website" / "releases" / f"{latest_version}.md")
    with open(current_dir / "website" / "releases" / f"{latest_version}.md", "r") as latest:
        lines = latest.readlines()
    with open(current_dir / "website" / "releases" / f"{latest_version}.md", "w") as latest:
        lines[0] = latest_version.replace("v", "# Version ") + "\n"
        latest.writelines(lines)
    shutil.copy(current_dir / "website" / "releases" / "TEMPLATE.md",
                current_dir / "website" / "releases" / "UPCOMING.md")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument("latest_version", type=str, help="Name of demo to upload")
    args = parser.parse_args()
    format_release_notes(args.latest_version)

