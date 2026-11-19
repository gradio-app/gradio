"""Access to `gradio_components`, the separate package that holds Gradio's UI
components. Core Gradio (the server, the queue and `gr.Server`) works without it."""

from __future__ import annotations

import importlib
import importlib.abc
import importlib.util
import sys
from types import ModuleType

PACKAGE = "gradio_components"

# Submodules of `gradio.components` that are part of core Gradio.
CORE_COMPONENT_MODULES = frozenset({"base", "api_component", "state"})

# Modules that used to be in `gradio` and are now in `gradio_components`. They stay
# importable under their old names.
_MOVED_MODULES = frozenset(
    {
        "gradio.templates",
        "gradio._simple_templates",
        "gradio.image_utils",
        "gradio.pipelines_utils",
    }
)


class ComponentsNotInstalledError(ImportError):
    """Raised when something that needs `gradio_components` is used without it."""


def is_installed() -> bool:
    if PACKAGE in sys.modules:
        return True
    try:
        return importlib.util.find_spec(PACKAGE) is not None
    except (ImportError, ValueError):
        return False


def is_being_imported() -> bool:
    """Whether `import gradio_components` is running right now, which is the case if
    it was imported before `gradio` and imported `gradio` in turn."""
    spec = getattr(sys.modules.get(PACKAGE), "__spec__", None)
    return bool(getattr(spec, "_initializing", False))


def not_installed_error(feature: str) -> ComponentsNotInstalledError:
    return ComponentsNotInstalledError(
        f"Starting with Gradio 7, {feature} needs the `gradio_components` package, "
        "which is no longer installed with `pip install gradio`. Install it with:\n\n"
        '    pip install "gradio[components]"\n\n'
        "Core Gradio (`gr.Server`, the queue and the API) works without it."
    )


def require(feature: str) -> ModuleType:
    """Returns the `gradio_components` module, or raises an error that names `feature`
    and says how to install the package."""
    if not is_installed():
        raise not_installed_error(feature)
    return importlib.import_module(PACKAGE)


def loaded_class(module: str, name: str) -> type | None:
    """The class `name` of `gradio_components.<module>` if that module has been
    imported, and otherwise None. An instance of a class can only exist once its
    module has been imported, so this is enough for an `isinstance` check, and it
    never imports `gradio_components` itself."""
    loaded = sys.modules.get(f"{PACKAGE}.{module}")
    return getattr(loaded, name, None)


def _new_name(fullname: str) -> str | None:
    """Where the module that used to be `fullname` lives now, if it moved."""
    if fullname.startswith("gradio.components."):
        rest = fullname[len("gradio.components.") :]
        if rest.split(".")[0] in CORE_COMPONENT_MODULES:
            return None
        return f"{PACKAGE}.{rest}"
    for moved in _MOVED_MODULES:
        if fullname == moved or fullname.startswith(moved + "."):
            return f"{PACKAGE}.{fullname[len('gradio.') :]}"
    return None


class _MovedModuleFinder(importlib.abc.MetaPathFinder, importlib.abc.Loader):
    """Makes `import gradio.components.textbox` return the same module object as
    `import gradio_components.textbox`, so code written for Gradio 6 keeps working
    and no module is ever loaded twice."""

    def find_spec(self, fullname, path=None, target=None):  # noqa: ARG002
        if _new_name(fullname) is None:
            return None
        return importlib.util.spec_from_loader(fullname, self)

    def create_module(self, spec):
        new_name = _new_name(spec.name)
        if new_name is None:
            raise ImportError(spec.name)
        if not is_installed():
            raise not_installed_error(f"`{spec.name}`")
        module = importlib.import_module(new_name)
        # The import system is about to set the module's `__spec__` to this alias.
        # Keep the real one, to put back in `exec_module`.
        spec.loader_state = module.__spec__
        return module

    def exec_module(self, module):
        real_spec = getattr(module.__spec__, "loader_state", None)
        if real_spec is not None:
            module.__spec__ = real_spec


if not any(isinstance(finder, _MovedModuleFinder) for finder in sys.meta_path):
    # First, because the frontend build in gradio/templates/ would otherwise be found
    # as a namespace package named `gradio.templates`.
    sys.meta_path.insert(0, _MovedModuleFinder())
