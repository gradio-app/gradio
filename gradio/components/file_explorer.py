"""gr.FileExplorer() component"""

from __future__ import annotations

import fnmatch
import os
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component, server
from gradio.data_classes import DeveloperPath, GradioRootModel, UserProvidedPath
from gradio.i18n import I18nData
from gradio.utils import safe_join

if TYPE_CHECKING:
    from gradio.components import Timer


class FileExplorerData(GradioRootModel):
    # The outer list is the list of files selected, and the inner list
    # is the path to the file as a list, split by the os.sep.
    root: list[list[str]]


@document()
class FileExplorer(Component):
    """
    Creates a file explorer component that allows users to browse files on the machine hosting the Gradio app. As an input component,
    it also allows users to select files to be used as input to a function, while as an output component, it displays selected files.
    """

    EVENTS = ["change"]
    data_model = FileExplorerData

    def __init__(
        self,
        glob: str = "**/*",
        *,
        value: str | list[str] | Callable | None = None,
        file_count: Literal["single", "multiple"] = "multiple",
        root_dir: str | Path = ".",
        ignore_glob: str | None = None,
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        height: int | str | None = None,
        max_height: int | str | None = 500,
        min_height: int | str | None = None,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
    ):
        """
        Parameters:
            glob: The glob-style pattern used to select which files to display, e.g. "*" to match all files, "*.png" to match all .png files, "**/*.txt" to match any .txt file in any subdirectory, etc. The default value matches all files and folders recursively. See the Python glob documentation at https://docs.python.org/3/library/glob.html for more information.
            value: The file (or list of files, depending on the `file_count` parameter) to show as "selected" when the component is first loaded. If a callable is provided, it will be called when the app loads to set the initial value of the component. If not provided, no files are shown as selected.
            file_count: Whether to allow single or multiple files to be selected. If "single", the component will return a single absolute file path as a string. If "multiple", the component will return a list of absolute file paths as a list of strings.
            root_dir: Path to root directory to select files from. If not provided, defaults to current working directory.
            ignore_glob: The glob-style, case-sensitive pattern that will be used to exclude files from the list. For example, "*.py" will exclude all .py files from the list. See the Python glob documentation at https://docs.python.org/3/library/glob.html for more information.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            height: The maximum height of the file component, specified in pixels if a number is passed, or in CSS units if a string is passed. If more files are uploaded than can fit in the height, a scrollbar will appear.
            interactive: if True, will allow users to select file(s); if False, will only display files. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
        """
        self.root_dir = DeveloperPath(os.path.abspath(root_dir))
        self.glob = glob
        self.ignore_glob = ignore_glob
        valid_file_count = ["single", "multiple"]
        if file_count not in valid_file_count:
            raise ValueError(
                f"Invalid value for parameter `file_count`: {file_count}. Please choose from one of: {valid_file_count}"
            )
        self.file_count = file_count
        self.height = height
        self.max_height = max_height
        self.min_height = min_height

        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
        )

    def example_payload(self) -> Any:
        return [["gradio", "app.py"]]

    def example_value(self) -> Any:
        return os.sep.join(["gradio", "app.py"])

    def preprocess(self, payload: FileExplorerData | None) -> list[str] | str | None:
        """
        Parameters:
            payload: List of selected files as a FileExplorerData object.
        Returns:
            Passes the selected file or directory as a `str` path (relative to `root`) or `list[str}` depending on `file_count`
        """
        if payload is None:
            return None

        if self.file_count == "single":
            if len(payload.root) > 1:
                raise ValueError(
                    f"Expected only one file, but {len(payload.root)} were selected."
                )
            elif len(payload.root) == 0:
                return None
            else:
                return os.path.normpath(os.path.join(self.root_dir, *payload.root[0]))
        files = []
        for file in payload.root:
            file_ = os.path.normpath(os.path.join(self.root_dir, *file))
            files.append(file_)
        return files

    def _strip_root(self, path: str) -> str:
        if path.startswith(self.root_dir):
            return path[len(self.root_dir) + 1 :]
        return path

    def postprocess(self, value: str | list[str] | None) -> FileExplorerData | None:
        """
        Parameters:
            value: Expects function to return a `str` path to a file, or `list[str]` consisting of paths to files.
        Returns:
            A FileExplorerData object containing the selected files as a list of strings.
        """
        if value is None:
            return None

        files = [value] if isinstance(value, str) else value
        root = []
        for file in files:
            root.append(self._strip_root(file).split(os.path.sep))

        return FileExplorerData(root=root)

    @server
    def ls(self, subdirectory: list[str] | None = None) -> list[dict[str, str]] | None:
        """
        Returns:
            a list of dictionaries, where each dictionary represents a file or subdirectory in the given subdirectory
        """
        if subdirectory is None:
            subdirectory = []

        full_subdir_path = self._safe_join(subdirectory)

        try:
            subdir_items = sorted(os.listdir(full_subdir_path))
        except FileNotFoundError:
            return []

        files, folders = [], []
        for item in subdir_items:
            full_path = os.path.join(full_subdir_path, item)
            is_file = not os.path.isdir(full_path)
            valid_by_glob = fnmatch.fnmatch(full_path, self.glob)
            if is_file and not valid_by_glob:
                continue
            if self.ignore_glob and fnmatch.fnmatch(full_path, self.ignore_glob):
                continue
            target = files if is_file else folders
            target.append(
                {
                    "name": item,
                    "type": "file" if is_file else "folder",
                    "valid": valid_by_glob,
                }
            )

        return folders + files

    def _safe_join(self, folders: list[str]) -> str:
        if not folders or len(folders) == 0:
            return self.root_dir
        combined_path = UserProvidedPath(os.path.join(*folders))
        if os.name == "nt":
            combined_path = combined_path.replace("\\", "/")
        x = safe_join(self.root_dir, combined_path)
        return x
