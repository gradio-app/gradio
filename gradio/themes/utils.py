from __future__ import annotations
import json

import tempfile
import textwrap
from pathlib import Path
import re

import huggingface_hub
import requests
from huggingface_hub import CommitOperationAdd


class Theme:
    SCHEMA_VERSION = '0.0.1'

    def _color(self, color: str, number: int = 500):
        return f"var(--color-{color}-{number})"

    def _use(self, property):
        assert property in self.__dict__ and not property.endswith("_dark")
        return f"var(--{property.replace('_', '-')})"

    def _get_theme_css(self):
        css = ":host, :root {\n"
        dark_css = ".dark {\n"
        theme_attr = [
            attr for attr in dir(self) if attr not in dir(Theme) and not attr.startswith("_")
        ]
        for attr in theme_attr:
            val = getattr(self, attr)
            if val is None:
                continue
            attr = attr.replace("_", "-")
            if attr.endswith("-dark"):
                attr = attr[:-5]
                dark_css += f"  --{attr}: {val}; \n"
            else:
                css += f"  --{attr}: {val}; \n"
        css += "}"
        dark_css += "}"
        return css + "\n" + dark_css
    
    def to_dict(self,):
        """Hacky implementation for now."""
        schema = {"schema_version": self.SCHEMA_VERSION,
                 "theme": {}}
        for prop in dir(self):
            if not prop.startswith("_") and isinstance(getattr(self, prop), str):
                schema['theme'][prop] = getattr(self, prop)
        return schema
    
    @classmethod
    def load(cls, path: str):
        theme = json.load(open(path))
        return cls.from_dict(theme)
    
    @classmethod
    def from_dict(cls, theme):
        base = cls()
        for prop, value in theme['theme'].items():
            setattr(base, prop, value)
        return base
    
    def dump(self, path: str, filename: str):
        as_dict = self.to_dict()
        json.dump(as_dict, open(Path(path) / Path(filename), "w"))
    
    @classmethod
    def from_hub(cls, repo_name: str):
        name, version = repo_name.split("@")
        url = huggingface_hub.hf_hub_url(
            repo_id=name, repo_type="space", filename=f"themes/theme_schema@{cls.SCHEMA_VERSION}_version@{version}.json"
        )
        download = requests.get(url)
        if download.ok:
            return cls.from_dict(download.json())
        else:
            raise ValueError(f"Can't load {repo_name}!")
