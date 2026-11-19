from __future__ import annotations

import re
from dataclasses import dataclass, field

import huggingface_hub
from packaging.specifiers import SpecifierSet
from packaging.version import InvalidVersion, Version

_SEMVER = re.compile(r"\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?")
_CLAUSE = re.compile(r"(<=|>=|==|!=|~=|<|>|=|\^|~)?\s*([0-9*][0-9A-Za-z.*-]*)")


def parse_version(version: str) -> Version:
    """Parses a theme version, which must have the form `major.minor.patch`."""
    if not _SEMVER.fullmatch(version):
        raise ValueError(f"Invalid version string: {version!r}")
    try:
        return Version(version)
    except InvalidVersion as e:
        raise ValueError(f"Invalid version string: {version!r}") from e


def next_patch(version: Version) -> str:
    """The version that follows `version` when only the patch number is bumped."""
    if version.is_prerelease:
        return version.base_version
    return f"{version.major}.{version.minor}.{version.micro + 1}"


def _dotted(numbers: list[int]) -> str:
    return ".".join(str(n) for n in numbers + [0] * (3 - len(numbers)))


def _clause_to_specifier(clause: str) -> str:
    """Translates one clause of a version expression (e.g. `>=1.2`, `1.2.*`, `^1.2.3`)
    into the equivalent PEP 440 specifier, so that `packaging` can evaluate it."""
    match = _CLAUSE.fullmatch(clause.strip())
    if not match:
        raise ValueError(f"Invalid version expression: {clause!r}")
    operator, version = match.group(1) or "==", match.group(2)
    if operator == "=":
        operator = "=="

    release, _, suffix = version.partition("-")
    parts = release.split(".")
    if "*" in parts:
        if suffix or any(p != "*" for p in parts[parts.index("*") :]):
            raise ValueError(f"Invalid version expression: {clause!r}")
        parts = parts[: parts.index("*")]
    if len(parts) > 3 or not all(p.isdigit() for p in parts):
        raise ValueError(f"Invalid version expression: {clause!r}")
    numbers = [int(p) for p in parts]
    if not numbers:
        # A bare wildcard matches every version.
        if operator not in ("==", ">="):
            raise ValueError(f"Invalid version expression: {clause!r}")
        return ""
    partial = len(numbers) < 3
    full = _dotted(numbers)
    if suffix and not partial:
        full = f"{full}-{suffix}"
    # The smallest version that is above every version starting with `numbers`.
    above = _dotted([*numbers[:-1], numbers[-1] + 1])

    if operator == "^":
        # Compatible with the leftmost non-zero component.
        padded = numbers + [0] * (3 - len(numbers))
        index = next((i for i, n in enumerate(padded) if n), 2)
        return f">={full},<{_dotted([*padded[:index], padded[index] + 1])}"
    if operator == "~":
        # Patch-level changes if a minor version is given, otherwise minor-level.
        return f">={full},<{_dotted([*numbers[:1], numbers[1] + 1] if len(numbers) > 1 else [numbers[0] + 1])}"
    if operator == "~=":
        # Compatible release: the last component given may increase.
        return f">={full},<{_dotted([numbers[0], numbers[1] + 1] if len(numbers) == 3 else [numbers[0] + 1])}"
    if not partial:
        return f"{operator}{full}"
    # A partial version such as `1.2` stands for every `1.2.x` release.
    if operator in ("==", "!="):
        return f"{operator}{'.'.join(parts)}.*"
    if operator == ">":
        return f">={above}"
    if operator == "<=":
        return f"<{above}"
    return f"{operator}{full}"


def to_specifier_set(expression: str | None) -> SpecifierSet:
    clauses = (_clause_to_specifier(c) for c in (expression or "*").split(","))
    return SpecifierSet(",".join(c for c in clauses if c))


def matches(specifier: SpecifierSet, version: Version) -> bool:
    return specifier.contains(version, prereleases=True)


@dataclass
class ThemeAsset:
    filename: str
    version: Version = field(init=False)

    def __post_init__(self):
        self.version = parse_version(self.filename.split("@")[1].replace(".json", ""))


def get_theme_assets(space_info: huggingface_hub.hf_api.SpaceInfo) -> list[ThemeAsset]:
    # Commenting out as it seems that the `huggingface_hub` library is not parsing tags
    # if "gradio-theme" not in getattr(space_info, "tags", []):
    # raise ValueError(f"{space_info.id} is not a valid gradio-theme space!")

    return [
        ThemeAsset(filename.rfilename)
        for filename in space_info.siblings
        if filename.rfilename.startswith("themes/")
    ]


def get_matching_version(
    assets: list[ThemeAsset], expression: str | None
) -> ThemeAsset | None:
    # Return most recent version that matches
    specifier = to_specifier_set(expression)
    matching = [a for a in assets if matches(specifier, a.version)]
    return max(matching, key=lambda a: a.version, default=None)
