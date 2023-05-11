import argparse
import pathlib
import textwrap

current_dir = (pathlib.Path(__file__).parent / "..").resolve()

TEMPLATE = """# Upcoming Release 

## New Features:
No changes to highlight.

## Bug Fixes:
No changes to highlight.

## Other Changes:
No changes to highlight.

## Breaking Changes:
No changes to highlight.

"""


def format_release_notes(latest_version: str):
    upcoming = current_dir / "CHANGELOG.md"
    with open(upcoming, "r") as latest:
        lines = latest.readlines()
        assert "# Upcoming Release" in lines[0]
    with open(upcoming, "w") as latest:
        if latest_version.startswith("v"):
            lines[0] = latest_version.replace("v", "# Version ") + "\n"
        else:
            lines[0] = "# Version " + latest_version + "\n"
        lines = textwrap.dedent(TEMPLATE).splitlines(keepends=True) + lines
        latest.writelines(lines)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a demo to a space")
    parser.add_argument("latest_version", type=str, help="Name of demo to upload")
    args = parser.parse_args()
    format_release_notes(args.latest_version)
