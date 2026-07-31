"""Maps Python and Gradio component annotation types to workflow port type strings.

Used by both _workflow_from_bind (startup) and list_bound_fns (runtime panel)
so that annotated function parameters produce consistent port types in both paths.

Import via:
    from gradio.workflow_port_types import PY_TO_PORT
"""

from __future__ import annotations


def _build() -> dict[type, str]:
    mapping: dict[type, str] = {
        int: "number",
        float: "number",
        bool: "boolean",
        str: "text",
    }

    # Gradio component classes — imported directly to avoid circular imports
    # through gradio.__init__. Each import is guarded in case a component is
    # removed or renamed in a future Gradio version.
    _component_map: list[tuple[str, str, str]] = [
        ("gradio.components.image", "Image", "image"),
        ("gradio.components.audio", "Audio", "audio"),
        ("gradio.components.video", "Video", "video"),
        ("gradio.components.html", "HTML", "html"),
        ("gradio.components.file", "File", "file"),
        ("gradio.components.gallery", "Gallery", "gallery"),
        ("gradio.components.model3d", "Model3D", "model3d"),
        ("gradio.components.json_component", "JSON", "json"),
        ("gradio.components.dataframe", "Dataframe", "json"),
        ("gradio.components.number", "Number", "number"),
        ("gradio.components.checkbox", "Checkbox", "boolean"),
        ("gradio.components.textbox", "Textbox", "text"),
        ("gradio.components.image_editor", "ImageEditor", "image"),
    ]
    for module_path, class_name, port_type in _component_map:
        try:
            import importlib

            mod = importlib.import_module(module_path)
            cls = getattr(mod, class_name, None)
            if cls is not None:
                mapping[cls] = port_type
        except ImportError:
            pass

    # Common third-party types
    try:
        from PIL.Image import Image as _PILImage

        mapping[_PILImage] = "image"
    except ImportError:
        pass
    try:
        import numpy as np

        mapping[np.ndarray] = "image"
    except ImportError:
        pass

    return mapping


PY_TO_PORT: dict[type, str] = _build()
