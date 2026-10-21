"""Build the optional native governor locally; no changes to system settings."""

import hashlib
import os
import platform
import subprocess
import tempfile
from pathlib import Path


def build() -> Path:
    if platform.system() != "Darwin" or platform.machine() != "arm64":
        raise RuntimeError(
            "Metal hardware preview currently requires an Apple Silicon Mac."
        )
    source = Path(__file__).parent / "native" / "governor.m"
    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:16]
    directory = Path.home() / ".cache" / "gradio" / "hardware"
    directory.mkdir(parents=True, exist_ok=True)
    destination = directory / f"governor-{digest}.dylib"
    if destination.exists():
        return destination
    with tempfile.TemporaryDirectory(dir=directory) as temporary:
        output = Path(temporary) / "governor.dylib"
        result = subprocess.run(
            [
                "xcrun",
                "clang",
                "-shared",
                "-fPIC",
                "-fobjc-arc",
                "-fblocks",
                "-framework",
                "Foundation",
                "-framework",
                "Metal",
                str(source),
                "-o",
                str(output),
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode:
            raise RuntimeError(
                "Could not compile Metal governor. Install Xcode Command Line Tools.\n"
                + result.stderr
            )
        os.replace(output, destination)
    return destination


def calibrate() -> dict:
    """Measure this host with a small native Metal copy workload (no ML framework)."""
    import json

    build()  # Validate platform/compiler first.
    source = Path(__file__).parent / "native" / "probe.m"
    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:16]
    destination = Path.home() / ".cache" / "gradio" / "hardware" / f"probe-{digest}"
    if not destination.exists():
        with tempfile.TemporaryDirectory(dir=destination.parent) as temporary:
            output = Path(temporary) / "probe"
            subprocess.run(
                [
                    "xcrun",
                    "clang",
                    "-fobjc-arc",
                    "-framework",
                    "Foundation",
                    "-framework",
                    "Metal",
                    str(source),
                    "-o",
                    str(output),
                ],
                check=True,
                capture_output=True,
                timeout=60,
            )
            os.replace(output, destination)
    result = subprocess.run(
        [str(destination)], check=True, capture_output=True, text=True, timeout=30
    )
    return json.loads(result.stdout)
