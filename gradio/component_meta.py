from __future__ import annotations

import ast
import inspect
from abc import ABCMeta
from functools import wraps
from pathlib import Path

from jinja2 import Template

from gradio.events import EventListener
from gradio.exceptions import ComponentDefinitionError
from gradio.utils import no_raise_exception

INTERFACE_TEMPLATE = '''
{{ contents }}

    {% for event in events %}
    def {{ event }}(self,
        fn: Callable | None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        outputs: Component | Sequence[Component] | None = None,
        api_name: str | None | Literal[False] = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        show_api: bool = True) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            scroll_to_output: If True, will scroll to output component on completion
            show_progress: If True, will show progress animation while pending
            queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: Run this event 'every' number of seconds while the client connection is open. Interpreted in seconds.
            trigger_mode: If "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: If set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: If set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            show_api: whether to show this event in the "view API" page of the Gradio app, or in the ".view_api()" method of the Gradio clients. Unlike setting api_name to False, setting show_api to False will still allow downstream apps to use this event. If fn is None, show_api will automatically be set to False.
        """
        ...
    {% endfor %}
'''


def create_pyi(class_code: str, events: list[EventListener | str]):
    template = Template(INTERFACE_TEMPLATE)
    events = [e if isinstance(e, str) else e.event_name for e in events]
    return template.render(events=events, contents=class_code)


def extract_class_source_code(
    code: str, class_name: str
) -> tuple[str, int] | tuple[None, None]:
    class_start_line = code.find(f"class {class_name}")
    if class_start_line == -1:
        return None, None

    class_ast = ast.parse(code)
    for node in ast.walk(class_ast):
        if isinstance(node, ast.ClassDef) and node.name == class_name:
            segment = ast.get_source_segment(code, node)
            if not segment:
                raise ValueError("segment not found")
            return segment, node.lineno
    return None, None


def create_or_modify_pyi(
    component_class: type, class_name: str, events: list[str | EventListener]
):
    source_file = Path(inspect.getfile(component_class))

    source_code = source_file.read_text()

    current_impl, lineno = extract_class_source_code(source_code, class_name)

    if not (current_impl and lineno):
        raise ValueError("Couldn't find class source code")

    new_interface = create_pyi(current_impl, events)

    pyi_file = source_file.with_suffix(".pyi")
    if not pyi_file.exists():
        last_empty_line_before_class = -1
        lines = source_code.splitlines()
        for i, line in enumerate(lines):
            if line in ["", " "]:
                last_empty_line_before_class = i
            if i >= lineno:
                break
        lines = (
            lines[:last_empty_line_before_class]
            + ["from gradio.events import Dependency"]
            + lines[last_empty_line_before_class:]
        )
        with no_raise_exception():
            pyi_file.write_text("\n".join(lines))
    current_interface, _ = extract_class_source_code(pyi_file.read_text(), class_name)
    if not current_interface:
        with no_raise_exception():
            with open(str(pyi_file), mode="a") as f:
                f.write(new_interface)
    else:
        contents = pyi_file.read_text()
        contents = contents.replace(current_interface, new_interface.strip())
        current_contents = pyi_file.read_text()
        if current_contents != contents:
            with no_raise_exception():
                pyi_file.write_text(contents)


def in_event_listener():
    from gradio.context import LocalContext

    return LocalContext.in_event_listener.get()


def updateable(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        fn_args = inspect.getfullargspec(fn).args
        self = args[0]

        # We need to ensure __init__ is always called at least once
        # so that the component has all the variables in self defined
        # test_blocks.py::test_async_iterator_update_with_new_component
        # checks this
        initialized_before = hasattr(self, "_constructor_args")
        if not initialized_before:
            self._constructor_args = []
        for i, arg in enumerate(args):
            if i == 0 or i >= len(fn_args):  #  skip self, *args
                continue
            arg_name = fn_args[i]
            kwargs[arg_name] = arg
        self._constructor_args.append(kwargs)
        if in_event_listener() and initialized_before:
            return None
        else:
            return fn(self, **kwargs)

    return wrapper


class ComponentMeta(ABCMeta):
    def __new__(cls, name, bases, attrs):
        if "__init__" in attrs:
            attrs["__init__"] = updateable(attrs["__init__"])
        if "EVENTS" not in attrs:
            found = False
            for base in bases:
                if hasattr(base, "EVENTS"):
                    found = True
                    break
            if not found:
                raise ComponentDefinitionError(
                    f"{name} or its base classes must define an EVENTS list. "
                    "If no events are supported, set it to an empty list."
                )
        events = attrs.get("EVENTS", [])
        if not all(isinstance(e, (str, EventListener)) for e in events):
            raise ComponentDefinitionError(
                f"All events for {name} must either be an string or an instance "
                "of EventListener."
            )
        new_events = []
        for event in events:
            trigger = (
                event
                if isinstance(event, EventListener)
                else EventListener(event_name=event)
            ).copy()
            new_events.append(trigger)
            trigger.set_doc(component=name)
            attrs[event] = trigger.listener
        if "EVENTS" in attrs:
            attrs["EVENTS"] = new_events
        component_class = super().__new__(cls, name, bases, attrs)
        create_or_modify_pyi(component_class, name, events)
        return component_class
