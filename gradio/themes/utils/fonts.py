from __future__ import annotations

import importlib.resources
import json
import textwrap
from collections.abc import Iterable
from pathlib import Path

STATIC_FONTS_DIR = Path(
    importlib.resources.files("gradio")
    .joinpath("templates/frontend/static/fonts")
    .as_posix()
)

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


def font_dir_name(name: str) -> str:
    return name.replace(" ", "")


def font_file_path(name: str, weight: int) -> Path:
    file_name = font_dir_name(name)
    file_weight = WEIGHT_TO_FILENAME.get(weight, str(weight))
    return STATIC_FONTS_DIR / file_name / f"{file_name}-{file_weight}.woff2"


def local_font_available(name: str, weights: Iterable[int]) -> bool:
    return all(font_file_path(name, weight).exists() for weight in weights)


class FontEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Font):
            return {
                "__gradio_font__": True,
                "name": obj.name,
                "class": "google"
                if isinstance(obj, GoogleFont)
                else "local"
                if isinstance(obj, LocalFont)
                else "font",
                "weights": obj.weights
                if isinstance(obj, (GoogleFont, LocalFont))
                else None,
            }
        return json.JSONEncoder.default(self, obj)


def as_font(dct):
    if "__gradio_font__" in dct:
        name = dct["name"]
        if dct["class"] == "google":
            return (
                GoogleFont(name, weights=dct["weights"])
                if "weights" in dct
                else GoogleFont(name)
            )
        if dct["class"] == "local":
            return (
                LocalFont(name, weights=dct["weights"])
                if "weights" in dct
                else LocalFont(name)
            )
        return Font(name)
    return dct


class Font:
    def __init__(self, name: str):
        self.name = name

    def __str__(self) -> str:
        return (
            self.name
            if self.name in ["sans-serif", "serif", "monospace", "cursive", "fantasy"]
            else f"'{self.name}'"
        )

    def stylesheet(self) -> dict:
        return {"url": None, "css": None}

    def __eq__(self, other: Font) -> bool:
        return self.name == other.name and self.stylesheet() == other.stylesheet()

    def __repr__(self) -> str:
        klass = type(self)
        class_repr = klass.__module__ + "." + klass.__qualname__
        attrs = ", ".join([k + "=" + repr(v) for k, v in self.__dict__.items()])
        return f"<{class_repr} ({attrs})>"


class GoogleFont(Font):
    def __init__(self, name: str, weights: Iterable[int] = (400, 600)):
        self.name = name
        self.weights = tuple(weights)

    def stylesheet(self) -> dict:
        if local_font_available(self.name, self.weights):
            return LocalFont(self.name, weights=self.weights).stylesheet()
        url = f"https://fonts.googleapis.com/css2?family={self.name.replace(' ', '+')}:wght@{';'.join(str(weight) for weight in self.weights)}&display=swap"
        return {"url": url, "css": None}


class LocalFont(Font):
    def __init__(self, name: str, weights: Iterable[int] = (400, 600)):
        super().__init__(name)
        self.weights = tuple(weights)

    def stylesheet(self) -> dict:
        css_template = textwrap.dedent("""
            @font-face {{
                font-family: '{name}';
                src: url('static/fonts/{dir_name}/{file_name}-{file_weight}.woff2') format('woff2');
                font-weight: {css_weight};
                font-style: normal;
            }}
            """)
        css_rules = []
        for weight in self.weights:
            file_weight = WEIGHT_TO_FILENAME.get(weight, str(weight))
            css_rules.append(
                css_template.format(
                    name=self.name,
                    dir_name=font_dir_name(self.name),
                    file_name=font_dir_name(self.name),
                    file_weight=file_weight,
                    css_weight=weight,
                )
            )
        return {"url": None, "css": "\n".join(css_rules)}
