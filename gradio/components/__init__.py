from gradio.components.annotated_image import AnnotatedImage
from gradio.components.audio import Audio
from gradio.components.bar_plot import BarPlot
from gradio.components.base import (
    Component,
    Form,
    FormComponent,
    StreamingInput,
    StreamingOutput,
    _Keywords,
    component,
    get_component_instance,
)
from gradio.components.button import Button
from gradio.components.carousel import Carousel
from gradio.components.chatbot import Chatbot
from gradio.components.checkbox import Checkbox
from gradio.components.checkboxgroup import CheckboxGroup
from gradio.components.clear_button import ClearButton
from gradio.components.code import Code
from gradio.components.color_picker import ColorPicker
from gradio.components.dataframe import Dataframe
from gradio.components.dataset import Dataset
from gradio.components.dropdown import Dropdown
from gradio.components.duplicate_button import DuplicateButton
from gradio.components.file import File
from gradio.components.gallery import Gallery
from gradio.components.highlighted_text import HighlightedText
from gradio.components.html import HTML
from gradio.components.image import Image
from gradio.components.interpretation import Interpretation
from gradio.components.json_component import JSON
from gradio.components.label import Label
from gradio.components.line_plot import LinePlot
from gradio.components.login_button import LoginButton
from gradio.components.logout_button import LogoutButton
from gradio.components.markdown import Markdown
from gradio.components.model3d import Model3D
from gradio.components.number import Number
from gradio.components.plot import Plot
from gradio.components.radio import Radio
from gradio.components.scatter_plot import ScatterPlot
from gradio.components.slider import Slider
from gradio.components.state import State, Variable
from gradio.components.status_tracker import StatusTracker
from gradio.components.textbox import Textbox
from gradio.components.upload_button import UploadButton
from gradio.components.video import Video

Text = Textbox
DataFrame = Dataframe
Highlightedtext = HighlightedText
Annotatedimage = AnnotatedImage
Highlight = HighlightedText
Checkboxgroup = CheckboxGroup
Json = JSON


def generate_stubs():
    import importlib
    import inspect
    from pathlib import Path

    from jinja2 import Template

    from gradio.components.base import Component

    # todo support multiple classes per component
    for file in Path(__file__).parent.rglob("*.py"):
        if "__init__.py" in str(file):
            continue

        pyi_path = file.with_suffix(".pyi")

        pyi_template = '''
{{ contents }}

    {% for event in events %}
    def {{ event }}(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        status_tracker: None = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        _js: str | None = None,) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            status_tracker: Deprecated and has no effect.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds. Queue must be enabled.
        """
        ...
    {% endfor %}
    '''

        template = Template(pyi_template)
        module = importlib.import_module(f"gradio.components.{file.stem}")
        contents = ""
        for att in dir(module):
            att = getattr(module, att)
            if inspect.isclass(att) and issubclass(att, Component) and att != Component:
                if att.__name__ in ["Component", "FormComponent"]:
                    continue
                    # Write the rendered .pyi content to a file

                if hasattr(att, "EVENTS"):
                    events = [
                        e if isinstance(e, str) else e.event_name for e in att.EVENTS
                    ]
                    rendered_pyi = template.render(
                        events=events, contents=inspect.getsource(att)
                    )
                    contents += rendered_pyi
        if contents:
            pyi_path.write_text(contents)


__all__ = [
    "Audio",
    "BarPlot",
    "Button",
    "Carousel",
    "Chatbot",
    "ClearButton",
    "Component",
    "component",
    "get_component_instance",
    "_Keywords",
    "Checkbox",
    "CheckboxGroup",
    "Code",
    "ColorPicker",
    "Dataframe",
    "DataFrame",
    "Dataset",
    "DuplicateButton",
    "Form",
    "FormComponent",
    "Gallery",
    "HTML",
    "Image",
    "Interpretation",
    "JSON",
    "Json",
    "Label",
    "LinePlot",
    "LoginButton",
    "LogoutButton",
    "Markdown",
    "Textbox",
    "Dropdown",
    "Model3D",
    "File",
    "HighlightedText",
    "AnnotatedImage",
    "CheckboxGroup",
    "Text",
    "Highlightedtext",
    "Annotatedimage",
    "Highlight",
    "Checkboxgroup",
    "Number",
    "Plot",
    "Radio",
    "ScatterPlot",
    "Slider",
    "State",
    "Variable",
    "StatusTracker",
    "UploadButton",
    "Video",
    "StreamingInput",
    "StreamingOutput",
]
