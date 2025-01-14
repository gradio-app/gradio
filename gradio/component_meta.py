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
    from typing import Callable, Literal, Sequence, Any, TYPE_CHECKING
    from gradio.blocks import Block
    if TYPE_CHECKING:
        from gradio.components import Timer

    {% for event in events %}
    def {{ event.event_name }}(self,
        fn: Callable[..., Any] | None = None,
        inputs: Block | Sequence[Block] | set[Block] | None = None,
        outputs: Block | Sequence[Block] | None = None,
        api_name: str | None | Literal[False] = None,
        scroll_to_output: bool = False,
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        queue: bool | None = None,
        batch: bool = False,
        max_batch_size: int = 4,
        preprocess: bool = True,
        postprocess: bool = True,
        cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
        every: Timer | float | None = None,
        trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
        js: str | None = None,
        concurrency_limit: int | None | Literal["default"] = "default",
        concurrency_id: str | None = None,
        show_api: bool = True,
    {% for arg in event.event_specific_args %}
        {{ arg.name }}: {{ arg.type }},
    {% endfor %}
        ) -> Dependency:
        """
        Parameters:
            fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
            inputs: list of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
            outputs: list of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
            api_name: defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, will use the functions name as the endpoint route. If set to a string, the endpoint will be exposed in the api docs with the given name.
            scroll_to_output: if True, will scroll to output component on completion
            show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
            queue: if True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
            batch: if True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
            max_batch_size: maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
            preprocess: if False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
            postprocess: if False, will not run postprocessing of component data before returning 'fn' output to the browser.
            cancels: a list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
            every: continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            trigger_mode: if "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
            js: optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
            concurrency_limit: if set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
            concurrency_id: if set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
            show_api: whether to show this event in the "view API" page of the Gradio app, or in the ".view_api()" method of the Gradio clients. Unlike setting api_name to False, setting show_api to False will still allow downstream apps as well as the Clients to use this event. If fn is None, show_api will automatically be set to False.
        {% for arg in event.event_specific_args %}
            {{ arg.name }}: {{ arg.doc }},
        {% endfor %}
        """
        ...
    {% endfor %}
'''


def create_pyi(class_code: str, events: list[EventListener | str]):
    template = Template(INTERFACE_TEMPLATE)
    event_template = [
        e
        if isinstance(e, EventListener)
        else EventListener(event_name=e, event_specific_args=[])
        for e in events
    ]
    return template.render(events=event_template, contents=class_code)


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

    source_code = source_file.read_text(encoding="utf-8")

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


def get_local_contexts():
    from gradio.context import LocalContext

    return (
        LocalContext.in_event_listener.get(),
        LocalContext.renderable.get() is not None,
    )


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
        in_event_listener, is_render = get_local_contexts()
        if in_event_listener and initialized_before and not is_render:
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
