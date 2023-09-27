"""gr.HostFile() component"""

from __future__ import annotations

import os
from typing import Callable, Literal

from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import JSONSerializable

from gradio.components.base import IOComponent, server
from gradio.events import (
    Changeable,
    EventListenerMethod,
    Selectable,
)

set_documentation_group("component")


@document()
class HostFile(Changeable, Selectable, IOComponent, JSONSerializable):
    """
    Creates a file component that allows uploading generic file (when used as an input) and or displaying generic files (output).
    Preprocessing: passes the uploaded file as a {tempfile._TemporaryFileWrapper} or {List[tempfile._TemporaryFileWrapper]} depending on `file_count` (or a {bytes}/{List{bytes}} depending on `type`)
    Postprocessing: expects function to return a {str} path to a file, or {List[str]} consisting of paths to files.
    Examples-format: a {str} path to a local file that populates the component.
    Demos: zip_to_json, zip_files
    """

    def __init__(
        self,
        root: str = ".",
        value: str | list[str] | Callable | None = None,
        *,
        type: Literal["file", "folder", "any"] = "file",
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
        **kwargs,
    ):
        """
        Parameters:
            root: Path to root directory to select files from. If not provided, defaults to current working directory.
            value: Default path to select, given as str file path. If callable, the function will be called whenever the app loads to set the initial value of the component.
            type: Type of value to be returned by component. "file" returns a temporary file object with the same base name as the uploaded file, whose full path can be retrieved by file_obj.name, "binary" returns an bytes object.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            height: The maximum height of the file component, in pixels. If more files are uploaded than can fit in the height, a scrollbar will appear.
            interactive: if True, will allow users to upload a file; if False, can only be used to display files. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
        """
        self._root = os.path.abspath(root)
        valid_types = ["file", "folder", "any"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.height = height
        self.select: EventListenerMethod
        """
        Event listener for when the user selects file from list.
        Uses event data gradio.SelectData to carry `value` referring to name of selected file, and `index` to refer to index.
        See EventData documentation on how to use this event data.
        """
        IOComponent.__init__(
            self,
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
            value=value,
            **kwargs,
        )

    def preprocess(self, x: list[str] | None) -> str | None:
        """
        Parameters:
            x: File path selected as a list of strings for each directory level relative to the root.
        Returns:
            File path selected, as an absolute path.
        """
        if x is None:
            return None
        return self._safe_join(x)

    def postprocess(self, y: str | None) -> list[str] | None:
        """
        Parameters:
            y: file path
        Returns:
            list representing filepath, where each string is a directory level relative to the root.
        """
        if y is None:
            return None
        return y.split(os.path.sep)

    @server
    def ls(self, y: list[str] | None) -> tuple[list[str], list[str]] | None:
        """
        Parameters:
            y: file path as a list of strings for each directory level relative to the root.
        Returns:
            tuple of list of files in directory, then list of folders in directory
        """
        if y is None:
            return None
        absolute_path = self._safe_join(y)
        files = []
        folders = []
        for f in os.listdir(absolute_path):
            if os.path.isfile(os.path.join(absolute_path, f)):
                files.append(f)
            else:
                folders.append(f)
        return folders, files

    def _safe_join(self, folders):
        combined_path = os.path.join(self._root, *folders)
        absolute_path = os.path.abspath(combined_path)
        if os.path.commonprefix([self._root, absolute_path]) != os.path.abspath(
            self._root
        ):
            raise ValueError("Attempted to navigate outside of root directory")
        return absolute_path
