from __future__ import annotations

from functools import wraps

from gradio import components


class TemplateMeta:
    def __init_subclass__(cls):
        cls.is_template = True  # type: ignore
        defaults = getattr(cls, "_template_defaults", {})
        original_init = cls.__init__

        # Wrap the original init function, adding the kwargs
        # from `_template_defaults` the user didn't supply.
        @wraps(original_init)
        def template_init(*args, **kwargs):
            for key, value in defaults.items():
                if key not in kwargs:
                    kwargs[key] = value
            original_init(*args, **kwargs)

        # Assign qualname and name to make this function
        # clearly identifiable in the stack trace.
        template_init.__qualname__ = (
            template_init.__name__
        ) = f"{cls.__name__}.__template_init__"
        cls.__init__ = template_init


class TextArea(TemplateMeta, components.Textbox):
    _template_defaults = {
        "lines": 7,
    }


class Webcam(TemplateMeta, components.Image):
    _template_defaults = {
        "interactive": True,
        "source": "webcam",
    }


class Sketchpad(TemplateMeta, components.Image):
    _template_defaults = {
        "image_mode": "L",
        "interactive": True,
        "invert_colors": True,
        "shape": (28, 28),
        "source": "canvas",
    }


class Paint(TemplateMeta, components.Image):
    _template_defaults = {
        "interactive": True,
        "source": "canvas",
        "tool": "color-sketch",
    }


class ImageMask(TemplateMeta, components.Image):
    _template_defaults = {
        "interactive": True,
        "source": "upload",
        "tool": "sketch",
    }


class ImagePaint(TemplateMeta, components.Image):
    _template_defaults = {
        "interactive": True,
        "source": "upload",
        "tool": "color-sketch",
    }


class Pil(TemplateMeta, components.Image):
    _template_defaults = {
        "source": "upload",
        "type": "pil",
    }


class PlayableVideo(TemplateMeta, components.Video):
    _template_defaults = {
        "format": "mp4",
        "source": "upload",
    }


class Microphone(TemplateMeta, components.Audio):
    _template_defaults = {
        "source": "microphone",
        "type": "numpy",
    }


class Files(TemplateMeta, components.File):
    _template_defaults = {
        "file_count": "multiple",
    }


class Numpy(TemplateMeta, components.Dataframe):
    _template_defaults = {
        "type": "numpy",
    }


class Matrix(TemplateMeta, components.Dataframe):
    _template_defaults = {
        "type": "array",
    }


class List(TemplateMeta, components.Dataframe):
    _template_defaults = {
        "col_count": 1,
        "type": "array",
    }


Mic = Microphone
