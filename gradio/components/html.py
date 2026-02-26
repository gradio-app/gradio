"""gr.HTML() component."""

from __future__ import annotations

import inspect
import re
import textwrap
from collections.abc import Callable, Sequence
from typing import TYPE_CHECKING, Any, Literal, cast

from gradio_client.documentation import document

from gradio.blocks import BlockContext
from gradio.components.base import Component, server
from gradio.components.button import Button
from gradio.events import all_events
from gradio.i18n import I18nData
from gradio.utils import set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
class HTML(BlockContext, Component):
    """
    Creates a component with arbitrary HTML. Can include CSS and JavaScript to create highly customized and interactive components.
    Example:
        ```python
        import gradio as gr

        with gr.Blocks() as demo:
            basic_html = gr.HTML("<h2>This is a basic HTML component</h2>")

            button_set = gr.HTML(["Option 1", "Option 2", "Option 3"],
                           html_template="{{#each value}}<button class='option-btn'>{{this}}</button>{{/each}}",
                           css_template="button { margin: 5px; padding: 10px; }",
                           js_on_load="element.querySelectorAll('.option-btn').forEach(btn => { btn.addEventListener('click', () => { trigger('click', {option: btn.innerText}); }); });")
            clicked_option = gr.Textbox(label="Clicked Option")
            def on_button_click(evt: gr.EventData):
                return evt.option
            button_set.click(on_button_click, outputs=clicked_option)

        demo.launch()
        ```
    Demos: super_html
    Guides: custom-HTML-components, custom-CSS-and-JS
    """

    EVENTS = all_events

    def __init__(
        self,
        value: Any | Callable | None = None,
        *,
        label: str | I18nData | None = None,
        html_template: str = "${value}",
        css_template: str = "",
        js_on_load: str
        | None = "element.addEventListener('click', function() { trigger('click') });",
        apply_default_css: bool = True,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool = False,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        min_height: int | None = None,
        max_height: int | None = None,
        container: bool = False,
        padding: bool = False,
        autoscroll: bool = False,
        buttons: list[Button] | None = None,
        server_functions: list[Callable] | None = None,
        **props: Any,
    ):
        """
        Parameters:
            value: The HTML content in the ${value} tag in the html_template. For example, if html_template="<p>${value}</p>" and value="Hello, world!", the component will render as `"<p>Hello, world!</p>"`.
            label: The label for this component. Is used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            html_template: A string representing the HTML template for this component as a JS template string and Handlebars template. The `${value}` tag will be replaced with the `value` parameter, and all other tags will be filled in with the values from `props`. This element can have children when used in a `with gr.HTML(...):` context, and the children will be rendered to replace `@children` substring, which cannot be nested inside any HTML tags.
            css_template: A string representing the CSS template for this component as a JS template string and Handlebars template. The CSS will be automatically scoped to this component, and rules outside a block will target the component's root element. The `${value}` tag will be replaced with the `value` parameter, and all other tags will be filled in with the values from `props`.
            js_on_load: A string representing the JavaScript code that will be executed when the component is loaded. The `element` variable refers to the HTML element of this component, and can be used to access children such as `element.querySelector()`. The `trigger` function can be used to trigger events, such as `trigger('click')`. The value and other props can be edited through `props`, e.g. `props.value = "new value"` which will re-render the HTML template. If `server_functions` is provided, a `server` object is also available in `js_on_load`, where each function is accessible as an async method, e.g. `server.list_files(path).then(files => ...)` or `const files = await server.list_files(path)`. The `upload` async function can be used to upload a JavaScript `File` object to the Gradio server, returning a dictionary with `path` (the server-side file path) and `url` (the public URL to access the file), e.g. `const { path, url } = await upload(file)`.
            apply_default_css: If True, default Gradio CSS styles will be applied to the HTML component.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: If True, the label will be displayed. If False, the label will be hidden.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            min_height: The minimum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If HTML content exceeds the height, the component will expand to fit the content.
            max_height: The maximum height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. If content exceeds the height, the component will scroll.
            container: If True, the HTML component will be displayed in a container. Default is False.
            padding: If True, the HTML component will have a certain padding (set by the `--block-padding` CSS variable) in all directions. Default is False.
            autoscroll: If True, will automatically scroll to the bottom of the component when the content changes, unless the user has scrolled up. If False, will not scroll to the bottom when the content changes.
            buttons: A list of gr.Button() instances to show in the top right corner of the component. Custom buttons will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button.
            server_functions: A list of Python functions that can be called from `js_on_load` via the `server` object. For example, if you pass `server_functions=[my_func]`, you can call `server.my_func(arg1, arg2)` in your `js_on_load` code. Each function becomes an async method that sends the call to the Python backend and returns the result.
            props: Additional keyword arguments to pass into the HTML and CSS templates for rendering.
        """
        self.html_template = html_template
        self.css_template = css_template
        self.js_on_load = js_on_load
        self.apply_default_css = apply_default_css
        self.min_height = min_height
        self.max_height = max_height
        self.padding = padding
        self.autoscroll = autoscroll
        self.props = props
        self.component_class_name = self.__class__.__name__
        BlockContext.__init__(
            self,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
        )
        Component.__init__(
            self,
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
            container=container,
        )
        self.buttons = set_default_buttons(buttons, None)
        if server_functions:
            for fn in server_functions:
                decorated = server(fn)
                fn_name = getattr(fn, "__name__", str(fn))
                setattr(self, fn_name, decorated)
                self.server_fns.append(decorated)

    def example_payload(self) -> Any:
        return "<p>Hello</p>"

    def example_value(self) -> Any:
        return "<p>Hello</p>"

    def preprocess(self, payload: str | None) -> str | None:
        """
        Parameters:
            payload: string corresponding to the HTML
        Returns:
            (Rarely used) passes the HTML as a `str`.
        """
        return payload

    def postprocess(self, value: str | None) -> str | None:
        """
        Parameters:
            value: Expects a `str` consisting of valid HTML.
        Returns:
            Returns the HTML string.
        """
        return value

    def api_info(self) -> dict[str, Any]:
        return {"type": "string"}

    @property
    def skip_api(self):
        return False

    def get_config(self) -> dict[str, Any]:  # type: ignore[override]
        if type(self) is not HTML:
            config = {
                **super().get_config(),
                **super().get_config(HTML),
            }
        else:
            config = super().get_config()
        # For custom HTML components, we use the component_class_name
        # to identify the component in the frontend when reporting errors.
        config["component_class_name"] = self.component_class_name
        return config

    def get_block_name(self):
        return "html"

    def _to_publish_format(
        self,
        name: str | None = None,
        head: str | None = None,
        description: str = "",
        author: str = "",
        tags: list[str] | None = None,
        repo_url: str | None = None,
    ) -> dict[str, Any]:
        """Convert this HTML component to the format expected by the HTML Components Gallery
        (https://www.gradio.app/custom-components/html-gallery).

        Parameters:
            name: Display name for the component. Defaults to the class name (for subclasses) or label.
            description: Short description of what the component does.
            author: Author name.
            tags: List of tags for search/filtering.
            repo_url: URL to the source repo (GitHub or HuggingFace Spaces).
        Returns:
            A dictionary matching the HTMLComponentEntry format for the gallery.
        """
        if name is None:
            if type(self) is not HTML:
                name = re.sub(r"(?<!^)(?=[A-Z])", " ", type(self).__name__)
            elif self.label:
                name = str(self.label)
            else:
                name = "Untitled Component"

        comp_id = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

        if type(self) is not HTML:
            try:
                python_code = textwrap.dedent(inspect.getsource(type(self)))
            except (OSError, TypeError):
                python_code = ""
        else:
            python_code = self._generate_constructor_code()

        default_props: dict[str, Any] = {}
        default_props["value"] = self.value if self.value is not None else ""
        if self.label is not None:
            default_props["label"] = str(self.label)
        default_props.update(self.props)

        result = {
            "id": comp_id,
            "name": name,
            "description": description,
            "author": author,
            "tags": tags if tags is not None else [],
            "html_template": self.html_template,
            "css_template": self.css_template,
            "js_on_load": self.js_on_load or "",
            "default_props": default_props,
            "python_code": python_code,
            "head": head or "",
        }
        if repo_url:
            result["repo_url"] = repo_url
        return result

    def push_to_hub(
        self,
        name: str | None = None,
        head: str | None = None,
        description: str = "",
        author: str = "",
        tags: list[str] | None = None,
        repo_url: str | None = None,
        token: str | None = None,
    ) -> str:
        """Push this HTML component to the HTML Components Gallery as a pull request.

        Creates a JSON file in the `components/` directory of the dataset repo
        and opens a pull request for review.

        Parameters:
            name: Display name for the component. Defaults to the class name (for subclasses) or label.
            head: Raw HTML to inject into `<head>` (e.g. external scripts). Only needed if your component expects a `<head>` script to be added by the parent Gradio application.
            description: Short description of what the component does.
            author: Author name (e.g. your HuggingFace username).
            tags: List of tags for search/filtering.
            category: One of "input", "display", or "form".
            repo_url: URL to the source repo (GitHub or HuggingFace Spaces).
            token: HuggingFace token. If None, uses the cached token from `huggingface-cli login`.
        Returns:
            The URL of the created pull request.
        """
        import json

        from huggingface_hub import CommitOperationAdd, HfApi, hf_hub_download

        data = self._to_publish_format(
            name=name,
            head=head,
            description=description,
            author=author,
            tags=tags,
            repo_url=repo_url,
        )
        comp_id = data["id"]
        json_bytes = json.dumps(data, indent=2).encode("utf-8")

        # Build manifest entry (lightweight metadata only)
        manifest_keys = [
            "id",
            "name",
            "description",
            "author",
            "tags",
            "repo_url",
        ]
        manifest_entry = {k: data[k] for k in manifest_keys if k in data}

        api = HfApi(token=token)

        # Fetch current manifest and append new entry
        try:
            manifest_path = hf_hub_download(
                repo_id="gradio/custom-html-gallery",
                repo_type="dataset",
                filename="manifest.json",
                token=token,
            )
            with open(manifest_path) as f:
                manifest = json.load(f)
        except Exception:
            manifest = []

        # Replace existing entry with same id, or append
        manifest = [e for e in manifest if e.get("id") != comp_id]
        manifest.append(manifest_entry)
        manifest_bytes = json.dumps(manifest, indent=2).encode("utf-8")

        commit = api.create_commit(
            repo_id="gradio/custom-html-gallery",
            repo_type="dataset",
            operations=[
                CommitOperationAdd(
                    path_in_repo=f"components/{comp_id}.json",
                    path_or_fileobj=json_bytes,
                ),
                CommitOperationAdd(
                    path_in_repo="manifest.json",
                    path_or_fileobj=manifest_bytes,
                ),
            ],
            commit_message=f"Add component: {data['name']}",
            commit_description=f"**{data['name']}**\n\n{data['description']}\n\nAuthor: @{data['author']}",
            create_pr=True,
        )
        print(f"Pull request created: {commit.pr_url or ''}")
        return cast(str, commit.pr_url)

    def _generate_constructor_code(self) -> str:
        """Generate a Python constructor call string for a plain gr.HTML() instance."""
        lines = ["gr.HTML("]
        if self.value is not None:
            lines.append(f"    value={self.value!r},")
        if self.label is not None:
            lines.append(f"    label={str(self.label)!r},")
        lines.append(f'    html_template="""\n{self.html_template}\n    """,')
        if self.css_template:
            lines.append(f'    css_template="""\n{self.css_template}\n    """,')
        if self.js_on_load:
            lines.append(f'    js_on_load="""\n{self.js_on_load}\n    """,')
        for k, v in self.props.items():
            lines.append(f"    {k}={v!r},")
        lines.append(")")
        return "\n".join(lines)
