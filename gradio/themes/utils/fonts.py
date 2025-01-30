from __future__ import annotations

import json
import textwrap
from collections.abc import Iterable


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
        # Let the base class default method raise the TypeError
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
        self.weights = weights

    def stylesheet(self) -> dict:
        url = f"https://fonts.googleapis.com/css2?family={self.name.replace(' ', '+')}:wght@{';'.join(str(weight) for weight in self.weights)}&display=swap"
        return {"url": url, "css": None}


class LocalFont(Font):
    def __init__(self, name: str, weights: Iterable[int] = (400, 700)):
        super().__init__(name)
        self.weights = weights

    def stylesheet(self) -> dict:
        css_template = textwrap.dedent("""
            @font-face {{
                font-family: '{name}';
                src: url('static/fonts/{file_name}/{file_name}-{weight}.woff2') format('woff2');
                font-weight: {weight};
                font-style: normal;
            }}
            """)
        css_rules = []
        for weight in self.weights:
            weight_name = (
                "Regular" if weight == 400 else "Bold" if weight == 700 else str(weight)
            )
            css_rules.append(
                css_template.format(
                    name=self.name,
                    file_name=self.name.replace(" ", ""),
                    weight=weight_name,
                )
            )
        return {"url": None, "css": "\n".join(css_rules)}
