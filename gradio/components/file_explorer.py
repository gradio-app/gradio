"""gr.FileExplorer() component"""

from __future__ import annotations

import fnmatch
import os
import warnings
from pathlib import Path
from typing import Any, Callable, List, Literal

from gradio_client.documentation import document

from gradio.components.base import Component, server
from gradio.data_classes import GradioRootModel


class FileExplorerData(GradioRootModel):
    root: List[List[str]]


@document()
class FileExplorer(Component):
    """
    Creates a file explorer component that allows users to browse files on the machine hosting the Gradio app. As an input component,
    it also allows users to select files to be used as input to a function, while as an output component, it displays selected files.

    Demos: file_explorer
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
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        height: int | float | None = None,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        root: None = None,
    ):
        """
        Parameters:
            glob: The glob-style pattern used to select which files to display, e.g. "*" to match all files, "*.png" to match all .png files, "**/*.txt" to match any .txt file in any subdirectory, etc. The default value matches all files and folders recursively. See the Python glob documentation at https://docs.python.org/3/library/glob.html for more information.
            value: The file (or list of files, depending on the `file_count` parameter) to show as "selected" when the component is first loaded. If a callable is provided, it will be called when the app loads to set the initial value of the component. If not provided, no files are shown as selected.
            file_count: Whether to allow single or multiple files to be selected. If "single", the component will return a single absolute file path as a string. If "multiple", the component will return a list of absolute file paths as a list of strings.
            root_dir: Path to root directory to select files from. If not provided, defaults to current working directory.
            ignore_glob: The glob-style, case-sensitive pattern that will be used to exclude files from the list. For example, "*.py" will exclude all .py files from the list. See the Python glob documentation at https://docs.python.org/3/library/glob.html for more information.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise.sed (e.g. to cancel it) via this component's .load_event attribute.
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
        """
        if root is not None:
            warnings.warn(
                "The `root` parameter has been deprecated. Please use `root_dir` instead."
            )
            root_dir = root
            self._constructor_args[0]["root_dir"] = root
        self.root_dir = os.path.abspath(root_dir)
        self.glob = glob
        self.ignore_glob = ignore_glob
        valid_file_count = ["single", "multiple"]
        if file_count not in valid_file_count:
            raise ValueError(
                f"Invalid value for parameter `file_count`: {file_count}. Please choose from one of: {valid_file_count}"
            )
        self.file_count = file_count
        self.height = height

        super().__init__(
            label=label,
            every=every,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            value=value,
        )

    def example_payload(self) -> Any:
        return [["Users", "gradio", "app.py"]]

    def example_value(self) -> Any:
        return ["Users", "gradio", "app.py"]

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
                return self._safe_join(payload.root[0])
        files = []
        for file in payload.root:
            file_ = self._safe_join(file)
            files.append(file_)
        return files

    def _strip_root(self, path):
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
    def ls(self, subdirectory: list | None = None) -> list[dict[str, str]] | None:
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

    def _safe_join(self, folders):
        combined_path = os.path.join(self.root_dir, *folders)
        absolute_path = os.path.abspath(combined_path)
        if os.path.commonprefix([self.root_dir, absolute_path]) != os.path.abspath(
            self.root_dir
        ):
            raise ValueError("Attempted to navigate outside of root directory")
        return absolute_path
