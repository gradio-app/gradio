import re
import yaml
import pathlib
import argparse

root_dir = (pathlib.Path(__file__).parent / "..").resolve()


def check_changeset(filename: str) -> None:
    full_path = root_dir / 'changesets' / filename
    changeset = open(full_path).read()

    yaml_regex = re.search(
        "(?:^|[\r\n])---[\n\r]+([\\S\\s]*?)[\n\r]+---([\n\r]|$)", changeset
    )
    if not yaml_regex:
        raise ValueError(f"The changeset file {full_path} is missing metadata")
    try:
        metadata = next(yaml.safe_load_all(changeset[: yaml_regex.span()[-1]]))
    except StopIteration:
        raise ValueError(f"The changeset file {full_path} is not formatted correctly!")

    missing = [field for field in ["bump", "type"] if field not in metadata]
    if missing:
        raise ValueError(
            f"The changeset file {full_path} is missing the following keys from the metadata: {', '.join(missing)}."
        )
    allowed_bumps = ["major", "minor", "patch"]
    allowed_types = ["fix", "new-feature", "breaking", "doc"]
    if metadata["bump"] not in allowed_bumps:
        raise ValueError(
            f"The 'bump' field for {full_path} must be one of {', '.join(allowed_bumps)}. Received {metadata['type']}.")
    if metadata["type"] not in allowed_types:
        raise ValueError(
            f"The 'type' field for {full_path} must be one of {', '.join(allowed_types)}. Received {metadata['type']}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Check a PR's changeset file")
    parser.add_argument("--pr", type=str, help="Name of PR to check")
    args = parser.parse_args()
    check_changeset(f"pr_{args.pr}.md")
