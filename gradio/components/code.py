"""gr.Code() component"""

from __future__ import annotations

from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal

from gradio_client.documentation import document

from gradio.components.base import Component
from gradio.events import Events

if TYPE_CHECKING:
    from gradio.components import Timer


@document("languages")
class Code(Component):
    """
    Creates a code editor for viewing code (as an output component), or for entering and editing code (as an input component).
    """

    languages = [
        "python",
        "c",
        "cpp",
        "markdown",
        "latex",
        "json",
        "html",
        "css",
        "javascript",
        "jinja2",
        "typescript",
        "yaml",
        "dockerfile",
        "shell",
        "r",
        "sql",
        "sql-msSQL",
        "sql-mySQL",
        "sql-mariaDB",
        "sql-sqlite",
        "sql-cassandra",
        "sql-plSQL",
        "sql-hive",
        "sql-pgSQL",
        "sql-gql",
        "sql-gpSQL",
        "sql-sparkSQL",
        "sql-esper",
        None,
    ]

    EVENTS = [
        Events.change,
        Events.input,
        Events.focus,
        Events.blur,
    ]

    def __init__(
        self,
        value: str | Callable | None = None,
        language: Literal[
            "python",
            "c",
            "cpp",
            "markdown",
            "latex",
            "json",
            "html",
            "css",
            "javascript",
            "jinja2",
            "typescript",
            "yaml",
            "dockerfile",
            "shell",
            "r",
            "sql",
            "sql-msSQL",
            "sql-mySQL",
            "sql-mariaDB",
            "sql-sqlite",
            "sql-cassandra",
            "sql-plSQL",
            "sql-hive",
            "sql-pgSQL",
            "sql-gql",
            "sql-gpSQL",
            "sql-sparkSQL",
            "sql-esper",
        ]
        | None = None,
        *,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        lines: int = 5,
        max_lines: int | None = None,
        label: str | None = None,
        interactive: bool | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | None = None,
        wrap_lines: bool = False,
        show_line_numbers: bool = True,
        autocomplete: bool = False,
    ):
        """
        Parameters:
            value: Default value to show in the code editor. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            language: The language to display the code as. Supported languages listed in `gr.Code.languages`.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            interactive: Whether user should be able to enter code or only view it.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: if assigned, will be used to assume identity across a re-render. Components that have the same key across a re-render will have their value preserved.
            lines: Minimum number of visible lines to show in the code editor.
            max_lines: Maximum number of visible lines to show in the code editor. Defaults to None and will fill the height of the container.
            wrap_lines: If True, will wrap lines to the width of the container when overflow occurs. Defaults to False.
            show_line_numbers:  If True, displays line numbers, and if False, hides line numbers.
            autocomplete: If True, will show autocomplete suggestions for supported languages. Defaults to False.
        """
        if language not in Code.languages:
            raise ValueError(f"Language {language} not supported.")

        self.language = language
        self.lines = lines
        self.max_lines = max(lines, max_lines) if max_lines is not None else None
        self.wrap_lines = wrap_lines
        self.show_line_numbers = show_line_numbers
        self.autocomplete = autocomplete
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            interactive=interactive,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            value=value,
        )

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: string corresponding to the code
        Returns:
            Passes the code entered as a `str`.
        """
        return payload

    def postprocess(self, value: str | None) -> None | str:
        """
        Parameters:
            value: Expects a `str` of code.
        Returns:
            Returns the code as a `str` stripped of leading and trailing whitespace.
        """
        if value is None:
            return None
        if isinstance(value, tuple):
            raise ValueError(
                "Code component does not support returning files as tuples anymore. "
                "Please read the file contents and return as str instead."
            )
        return value.strip()

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

    def example_payload(self) -> Any:
        return "print('Hello World')"

    def example_value(self) -> Any:
        return "print('Hello World')"

    def process_example(self, value: str | None) -> str | None:
        return super().process_example(value)
