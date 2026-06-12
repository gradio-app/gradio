#!/usr/bin/env python3
"""Download static assets required for offline Gradio usage."""

from __future__ import annotations

import re
import shutil
import ssl
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "gradio" / "templates" / "frontend" / "static"
FONTS_DIR = STATIC / "fonts"

WEIGHT_TO_FILENAME = {
    100: "Thin",
    200: "ExtraLight",
    300: "Light",
    400: "Regular",
    500: "Medium",
    600: "SemiBold",
    700: "Bold",
    800: "ExtraBold",
    900: "Black",
}

THEME_FONTS: dict[str, list[int]] = {
    "Source Sans Pro": [400, 600],
    "IBM Plex Sans": [400, 600],
    "IBM Plex Mono": [400, 500, 600],
    "Montserrat": [400, 700],
    "Quicksand": [400, 700],
    "Inconsolata": [400, 700],
    "Lexend": [400, 600],
    "Space Mono": [400],
    "Source Sans 3": [400, 600],
    "Source Code Pro": [400, 600],
    "Chakra Petch": [400, 600],
    "Share Tech Mono": [400],
    "Lora": [400, 600],
    "Ubuntu": [400],
    "Roboto Mono": [400, 600],
    "Press Start 2P": [400],
}

# Baseline Bokeh version to bundle. The version that gradio's Plot component
# actually requests at runtime is `bokeh.__version__` of the installed package,
# so `bokeh_versions()` always adds that too -- otherwise the frontend 404s on
# /static/bokeh/{installed_version}/ and falls back to the CDN (which defeats
# offline support).
BOKEH_VERSIONS = ["3.8.1"]
BOKEH_FILES = [
    "bokeh-{version}.min.js",
    "bokeh-widgets-{version}.min.js",
    "bokeh-tables-{version}.min.js",
    "bokeh-gl-{version}.min.js",
    "bokeh-api-{version}.min.js",
]

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def _ssl_context() -> ssl.SSLContext:
    # python.org Python on macOS ships without a usable system CA bundle, so the
    # default context can't verify TLS. Prefer certifi's bundle when available
    # (it's a transitive Gradio dependency). This still performs full
    # certificate verification -- it does not disable it.
    try:
        import certifi
    except ImportError:
        return ssl.create_default_context()
    return ssl.create_default_context(cafile=certifi.where())


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60, context=_ssl_context()) as response:
        return response.read()


LEGACY_FONT_DIRS = {
    "Source Sans Pro": "SourceSansPro",
}


def migrate_legacy_font_dirs() -> None:
    for legacy, modern in LEGACY_FONT_DIRS.items():
        legacy_dir = FONTS_DIR / legacy
        modern_dir = FONTS_DIR / modern
        if not legacy_dir.exists():
            continue
        modern_dir.mkdir(parents=True, exist_ok=True)
        for font_file in legacy_dir.glob("*.woff2"):
            dest = modern_dir / font_file.name
            if not dest.exists():
                shutil.copy2(font_file, dest)
        shutil.rmtree(legacy_dir)


def download_fonts() -> None:
    migrate_legacy_font_dirs()
    for family, weights in THEME_FONTS.items():
        dir_name = family.replace(" ", "")
        family_dir = FONTS_DIR / dir_name
        family_dir.mkdir(parents=True, exist_ok=True)
        # Skip the network round-trip entirely when every weight is already on
        # disk, so cached/air-gapped rebuilds don't need to reach Google Fonts.
        if all(
            (family_dir / f"{dir_name}-{WEIGHT_TO_FILENAME.get(w, str(w))}.woff2").exists()
            for w in weights
        ):
            continue
        weight_spec = ";".join(str(w) for w in weights)
        css_url = (
            f"https://fonts.googleapis.com/css2?family="
            f"{family.replace(' ', '+')}:wght@{weight_spec}&display=swap"
        )
        css_text = fetch(css_url).decode("utf-8")
        blocks = re.findall(
            r"font-weight:\s*(\d+);.*?src:\s*url\((https://[^)]+)\)\s*format\('woff2'\)",
            css_text,
            re.DOTALL,
        )
        for weight_str, woff2_url in blocks:
            weight = int(weight_str)
            if weight not in weights:
                continue
            file_weight = WEIGHT_TO_FILENAME.get(weight, str(weight))
            dest = family_dir / f"{dir_name}-{file_weight}.woff2"
            if dest.exists():
                continue
            dest.write_bytes(fetch(woff2_url))
            print(f"  font: {dest.relative_to(ROOT)}")


def download_iframe_resizer() -> None:
    dest_dir = STATIC / "js"
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / "iframeResizer.contentWindow.min.js"
    node_modules = (
        ROOT
        / "node_modules"
        / "@iframe-resizer"
        / "child"
        / "umd"
        / "iframeResizer.contentWindow.min.js"
    )
    if node_modules.exists():
        shutil.copy2(node_modules, dest)
        print(f"  iframe-resizer: {dest.relative_to(ROOT)}")
        return
    url = (
        "https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/4.3.1/"
        "iframeResizer.contentWindow.min.js"
    )
    dest.write_bytes(fetch(url))
    print(f"  iframe-resizer: {dest.relative_to(ROOT)}")


def bokeh_versions() -> list[str]:
    versions = list(BOKEH_VERSIONS)
    try:
        import bokeh  # type: ignore

        if bokeh.__version__ not in versions:
            versions.append(bokeh.__version__)
    except ImportError:
        pass
    return versions


def download_bokeh() -> None:
    for version in bokeh_versions():
        version_dir = STATIC / "bokeh" / version
        version_dir.mkdir(parents=True, exist_ok=True)
        for pattern in BOKEH_FILES:
            filename = pattern.format(version=version)
            dest = version_dir / filename
            if dest.exists():
                continue
            if filename == f"bokeh-{version}.min.js":
                base = "https://cdn.bokeh.org/bokeh/release"
            else:
                base = "https://cdn.pydata.org/bokeh/release"
            url = f"{base}/{filename}"
            dest.write_bytes(fetch(url))
            print(f"  bokeh: {dest.relative_to(ROOT)}")


def download_ffmpeg() -> None:
    dest_dir = STATIC / "ffmpeg"
    dest_dir.mkdir(parents=True, exist_ok=True)
    core_dir = ROOT / "node_modules" / "@ffmpeg" / "core" / "dist" / "esm"
    files = ["ffmpeg-core.js", "ffmpeg-core.wasm"]
    for name in files:
        src = core_dir / name
        dest = dest_dir / name
        if src.exists():
            shutil.copy2(src, dest)
            print(f"  ffmpeg: {dest.relative_to(ROOT)}")
        elif not dest.exists():
            base = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm"
            dest.write_bytes(fetch(f"{base}/{name}"))
            print(f"  ffmpeg: {dest.relative_to(ROOT)}")


def main() -> None:
    print("Downloading offline assets...")
    print("fonts:")
    download_fonts()
    print("iframe-resizer:")
    download_iframe_resizer()
    print("bokeh:")
    download_bokeh()
    print("ffmpeg:")
    download_ffmpeg()
    print("Done.")


if __name__ == "__main__":
    main()
