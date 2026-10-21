"""Named presets describe a simulation policy, not validated device equivalence."""

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class Profile:
    id: str
    name: str
    rate: float
    buffer_budget_gb: float | None
    bandwidth_gbs: float | None
    source: str
    note: str


PROFILES = (
    Profile("host", "Actual host", 1.0, None, None, "", "Unrestricted execution."),
    Profile(
        "m3",
        "MacBook Pro M3 (16 GB)",
        0.65,
        10.0,
        100.0,
        "https://support.apple.com/en-ie/117735",
        "Published bandwidth: 100 GB/s. 65% GPU-time budget and 10 GiB allocation budget are experimental policy, not measured M3 equivalence.",
    ),
    Profile(
        "iphone18pro",
        "iPhone 18 Pro",
        0.35,
        4.0,
        None,
        "https://www.apple.com/iphone-18-pro/specs/",
        "35% GPU-time budget and 4 GiB allocation budget are experimental policy. Absolute bandwidth and app memory allowance are not verified; this does not validate iOS compatibility.",
    ),
)


def resolve(name: str) -> Profile:
    key = name.lower().replace(" ", "").replace("-", "")
    aliases = {"macbookprom3": "m3", "actualhost": "host", "none": "host"}
    key = aliases.get(key, key)
    for profile in PROFILES:
        if key in (profile.id, profile.name.lower().replace(" ", "")):
            return profile
    raise ValueError(
        f"Unknown hardware {name!r}. Choose: " + ", ".join(p.name for p in PROFILES)
    )


def choices() -> list[dict]:
    return [asdict(p) for p in PROFILES]
