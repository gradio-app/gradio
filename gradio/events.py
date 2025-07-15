"""Contains all of the events that can be triggered in a gr.Blocks() app, with the exception
of the on-page-load event, which is defined in gr.Blocks().load()."""

from __future__ import annotations

import dataclasses
from collections.abc import Callable, Sequence, Set
from functools import partial, wraps
from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    Union,
    cast,
)

from gradio_client.documentation import document
from jinja2 import Template

from gradio.data_classes import FileData, FileDataDict

if TYPE_CHECKING:
    from gradio.blocks import Block, BlockContext, Component
    from gradio.components import Timer

from gradio_client.utils import python_type_to_json_schema

from gradio.context import get_blocks_context
from gradio.utils import get_cancelled_fn_indices, get_function_params, get_return_types


def set_cancel_events(
    triggers: Sequence[EventListenerMethod],
    cancels: None | dict[str, Any] | list[dict[str, Any]],
):
    if not cancels:
        return

    root_block = get_blocks_context()
    if root_block is None:
        raise AttributeError("Cannot cancel outside of a gradio.Blocks context.")

    if not isinstance(cancels, list):
        cancels = [cancels]

    regular_cancels: list[dict[str, Any]] = []
    timers_to_cancel: list[Component] = []
    for cancel in cancels:
        associated_timer = getattr(cancel, "associated_timer", None)
        if associated_timer:
            timers_to_cancel.append(associated_timer)
        else:
            regular_cancels.append(cancel)

    if timers_to_cancel:
        from gradio.components import Timer

        root_block.set_event_trigger(
            triggers,
            fn=lambda: (
                [Timer(active=False) for _ in timers_to_cancel]
                if len(timers_to_cancel) > 1
                else Timer(active=False)
            ),
            inputs=None,
            outputs=timers_to_cancel,
            show_api=False,
        )

    if regular_cancels:
        fn_indices_to_cancel = get_cancelled_fn_indices(regular_cancels)
        root_block.set_event_trigger(
            triggers,
            fn=None,
            inputs=None,
            outputs=None,
            queue=False,
            preprocess=False,
            show_api=False,
            cancels=fn_indices_to_cancel,
            is_cancel_function=True,
        )


@document()
class Dependency(dict):
    def __init__(
        self, trigger, key_vals, dep_index, fn, associated_timer: Timer | None = None
    ):
        """
        The Dependency object is usualy not created directly but is returned when an event listener is set up. It contains the configuration
        data for the event listener, and can be used to set up additional event listeners that depend on the completion of the current event
        listener using .then() and .success().

        Demos: chatbot_consecutive, blocks_chained_events
        """

        super().__init__(key_vals)
        self.fn = fn
        self.associated_timer = associated_timer
        self.then = partial(
            EventListener(
                "then",
                trigger_after=dep_index,
                trigger_only_on_success=False,
                has_trigger=False,
            ).listener,
            trigger,
        )
        """
        Triggered after directly preceding event is completed, regardless of success or failure.
        """
        self.success = partial(
            EventListener(
                "success",
                trigger_after=dep_index,
                trigger_only_on_success=True,
                has_trigger=False,
            ).listener,
            trigger,
        )
        """
        Triggered after directly preceding event is completed, if it was successful.
        """

    def __call__(self, *args, **kwargs):
        return self.fn(*args, **kwargs)


@document()
class EventData:
    """
    When gr.EventData or one of its subclasses is added as a type hint to an argument of a prediction function, a gr.EventData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener. The gr.EventData object itself contains a `.target` attribute that refers to the component
    that triggered the event, while subclasses of gr.EventData contains additional attributes that are different for each class.

    Example:
        import gradio as gr
        with gr.Blocks() as demo:
            table = gr.Dataframe([[1, 2, 3], [4, 5, 6]])
            gallery = gr.Gallery([("cat.jpg", "Cat"), ("dog.jpg", "Dog")])
            textbox = gr.Textbox("Hello World!")
            statement = gr.Textbox()
            def on_select(value, evt: gr.EventData):
                return f"The {evt.target} component was selected, and its value was {value}."
            table.select(on_select, table, statement)
            gallery.select(on_select, gallery, statement)
            textbox.select(on_select, textbox, statement)
        demo.launch()
    Demos: gallery_selections, tictactoe
    """

    def __init__(self, target: Block | None, _data: Any):
        """
        Parameters:
            target: The component object that triggered the event. Can be used to distinguish multiple components bound to the same listener.
        """
        self.target = target
        self._data = _data


@document()
class SelectData(EventData):
    """
    The gr.SelectData class is a subclass of gr.EventData that specifically carries information about the `.select()` event. When gr.SelectData
    is added as a type hint to an argument of an event listener method, a gr.SelectData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.

    Example:
        import gradio as gr
        with gr.Blocks() as demo:
            table = gr.Dataframe([[1, 2, 3], [4, 5, 6]])
            gallery = gr.Gallery([("cat.jpg", "Cat"), ("dog.jpg", "Dog")])
            textbox = gr.Textbox("Hello World!")
            statement = gr.Textbox()
            def on_select(evt: gr.SelectData):
                return f"You selected {evt.value} at {evt.index} from {evt.target}"
            table.select(on_select, table, statement)
            gallery.select(on_select, gallery, statement)
            textbox.select(on_select, textbox, statement)
        demo.launch()
    Demos: gallery_selections, tictactoe
    """

    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.index: Any = data["index"]
        """
        The index of the selected item. Is a tuple if the component is two dimensional or selection is a range.
        """
        self.value: Any = data["value"]
        """
        The value of the selected item.
        """
        self.row_value: Any = data.get("row_value")
        """
        The value of the entire row that the selected item belongs to, as a 1-D list. Only implemented for the `Dataframe` component, returns None for other components.
        """
        self.col_value: Any = data.get("col_value")
        """
        The value of the entire row that the selected item belongs to, as a 1-D list. Only implemented for the `Dataframe` component, returns None for other components.
        """
        self.selected: bool = data.get("selected", True)
        """
        True if the item was selected, False if deselected.
        """


@document()
class KeyUpData(EventData):
    """
    The gr.KeyUpData class is a subclass of gr.EventData that specifically carries information about the `.key_up()` event. When gr.KeyUpData
    is added as a type hint to an argument of an event listener method, a gr.KeyUpData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.

    Example:
        import gradio as gr
        def test(value, key_up_data: gr.KeyUpData):
            return {
                "component value": value,
                "input value": key_up_data.input_value,
                "key": key_up_data.key
            }
        with gr.Blocks() as demo:
            d = gr.Dropdown(["abc", "def"], allow_custom_value=True)
            t = gr.JSON()
            d.key_up(test, d, t)
        demo.launch()
    Demos: dropdown_key_up
    """

    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.key: str = data["key"]
        """
        The key that was pressed.
        """
        self.input_value: str = data["input_value"]
        """
        The displayed value in the input textbox after the key was pressed. This may be different than the `value`
        attribute of the component itself, as the `value` attribute of some components (e.g. Dropdown) are not updated
        until the user presses Enter.
        """


@document()
class DeletedFileData(EventData):
    """
    The gr.DeletedFileData class is a subclass of gr.EventData that specifically carries information about the `.delete()` event. When gr.DeletedFileData
    is added as a type hint to an argument of an event listener method, a gr.DeletedFileData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.
    Example:
        import gradio as gr
        def test(delete_data: gr.DeletedFileData):
            return delete_data.file.path
        with gr.Blocks() as demo:
            files = gr.File(file_count="multiple")
            deleted_file = gr.File()
            files.delete(test, None, deleted_file)
        demo.launch()
    Demos: file_component_events
    """

    def __init__(self, target: Block | None, data: FileDataDict):
        super().__init__(target, data)
        self.file: FileData = FileData(**data)  # type: ignore
        """
        The file that was deleted, as a FileData object.
        """


@document()
class LikeData(EventData):
    """
    The gr.LikeData class is a subclass of gr.EventData that specifically carries information about the `.like()` event. When gr.LikeData
    is added as a type hint to an argument of an event listener method, a gr.LikeData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.
    Example:
        import gradio as gr
        def test(value, like_data: gr.LikeData):
            return {
                "chatbot_value": value,
                "liked_message": like_data.value,
                "liked_index": like_data.index,
                "liked_or_disliked": like_data.liked
            }
        with gr.Blocks() as demo:
            c = gr.Chatbot([("abc", "def")])
            t = gr.JSON()
            c.like(test, c, t)
        demo.launch()
    Demos: chatbot_core_components_simple
    """

    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.index: int | tuple[int, int] = data["index"]
        """
        The index of the liked/disliked item. Is a tuple if the component is two dimensional.
        """
        self.value: Any = data["value"]
        """
        The value of the liked/disliked item.
        """
        self.liked: bool | str = data.get("liked", True)
        """
        True if the item was liked, False if disliked, or string value if any other feedback.
        """


@document()
class RetryData(EventData):
    """
    The gr.RetryData class is a subclass of gr.Event data that specifically carries information about the `.retry()` event. When gr.RetryData
    is added as a type hint to an argument of an event listener method, a gr.RetryData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.
    Example:
        import gradio as gr

        def retry(retry_data: gr.RetryData, history: list[gr.MessageDict]):
            history_up_to_retry = history[:retry_data.index]
            new_response = ""
            for token in api.chat_completion(history):
                new_response += token
                yield history + [new_response]

        with gr.Blocks() as demo:
            chatbot = gr.Chatbot()
            chatbot.retry(retry, chatbot, chatbot)
        demo.launch()
    """

    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.index: int | tuple[int, int] = data["index"]
        """
        The index of the user message that should be retried.
        """
        self.value: Any = data["value"]
        """
        The value of the user message that should be retried.
        """


@document()
class UndoData(EventData):
    """
    The gr.UndoData class is a subclass of gr.Event data that specifically carries information about the `.undo()` event. When gr.UndoData
    is added as a type hint to an argument of an event listener method, a gr.UndoData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.
    Example:
        import gradio as gr

        def undo(retry_data: gr.UndoData, history: list[gr.MessageDict]):
            history_up_to_retry = history[:retry_data.index]
            return history_up_to_retry

        with gr.Blocks() as demo:
            chatbot = gr.Chatbot()
            chatbot.undo(undo, chatbot, chatbot)
        demo.launch()
    """

    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.index: int | tuple[int, int] = data["index"]
        """
        The index of the user message that should be undone.
        """
        self.value: Any = data["value"]
        """
        The value of the user message that should be undone.
        """


@document()
class EditData(EventData):
    """
    The gr.EditData class is a subclass of gr.Event data that specifically carries information about the `.edit()` event. When gr.EditData
    is added as a type hint to an argument of an event listener method, a gr.EditData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.
    Example:
        import gradio as gr

        def edit(edit_data: gr.EditData, history: list[gr.MessageDict]):
            history_up_to_edit = history[:edit_data.index]
            history_up_to_edit[-1] = edit_data.value
            return history_up_to_edit

        with gr.Blocks() as demo:
            chatbot = gr.Chatbot()
            chatbot.undo(edit, chatbot, chatbot)
        demo.launch()
    """

    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.index: int | tuple[int, int] = data["index"]
        """
        The index of the message that was edited.
        """
        self.previous_value: Any = data["previous_value"]
        """
        The previous content of the message that was edited.
        """
        self.value: Any = data["value"]
        """
        The new content of the message that was edited.
        """


@document()
class DownloadData(EventData):
    """
    The gr.DownloadData class is a subclass of gr.EventData that specifically carries information about the `.download()` event. When gr.DownloadData
    is added as a type hint to an argument of an event listener method, a gr.DownloadData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.
    Example:
        import gradio as gr
        def on_download(download_data: gr.DownloadData):
            return f"Downloaded file: {download_data.file.path}"
        with gr.Blocks() as demo:
            files = gr.File()
            textbox = gr.Textbox()
            files.download(on_download, None, textbox)
        demo.launch()
    """

    def __init__(self, target: Block | None, data: FileDataDict):
        super().__init__(target, data)
        self.file: FileData = FileData(**data)  # type: ignore
        """
        The file that was downloaded, as a FileData object.
        """


@document()
class CopyData(EventData):
    """
    The gr.CopyData class is a subclass of gr.EventData that specifically carries information about the `.copy()` event. When gr.CopyData
    is added as a type hint to an argument of an event listener method, a gr.CopyData object will automatically be passed as the value of that argument.
    The attributes of this object contains information about the event that triggered the listener.
    Example:
        import gradio as gr
        def on_copy(copy_data: gr.CopyData):
            return f"Copied text: {copy_data.value}"
        with gr.Blocks() as demo:
            textbox = gr.Textbox("Hello World!")
            copied = gr.Textbox()
            textbox.copy(on_copy, None, copied)
        demo.launch()
    """

    def __init__(self, target: Block | None, data: Any):
        super().__init__(target, data)
        self.value: Any = data["value"]
        """
        The value that was copied.
        """


@dataclasses.dataclass
class EventListenerMethod:
    block: Block | None
    event_name: str


if TYPE_CHECKING:
    EventListenerCallable = Callable[
        [
            Union[Callable[..., Any], None],
            Union[Component, Sequence[Component], None],
            Union[Block, Sequence[Block], Sequence[Component], Component, None],
            Union[str, None, Literal[False]],
            bool,
            Literal["full", "minimal", "hidden"],
            Union[Component, Sequence[Component], None],
            Union[bool, None],
            bool,
            int,
            bool,
            bool,
            Union[dict[str, Any], list[dict[str, Any]], None],
            Union[float, None],
            Union[Literal["once", "multiple", "always_last"], None],
            Union[str, None],
            Union[int, None, Literal["default"]],
            Union[str, None],
            bool,
        ],
        Dependency,
    ]


class EventListener(str):
    def __new__(cls, event_name, *_args, **_kwargs):
        return super().__new__(cls, event_name)

    def __init__(
        self,
        event_name: str,
        has_trigger: bool = True,
        config_data: Callable[..., dict[str, Any]] = lambda: {},
        show_progress: Literal["full", "minimal", "hidden"] = "full",
        callback: Callable | None = None,
        trigger_after: int | None = None,
        trigger_only_on_success: bool = False,
        doc: str = "",
        connection: Literal["sse", "stream"] = "sse",
        event_specific_args: list[dict[str, str]] | None = None,
    ):
        super().__init__()
        self.has_trigger = has_trigger
        self.config_data = config_data
        self.event_name = event_name
        self.show_progress = show_progress
        self.trigger_after = trigger_after
        self.trigger_only_on_success = trigger_only_on_success
        self.callback = callback
        self.doc = doc
        self.connection = connection
        self.event_specific_args = event_specific_args or []
        self.listener = self._setup(
            event_name,
            has_trigger,
            show_progress,
            callback,
            trigger_after,
            trigger_only_on_success,
            self.event_specific_args,
            self.connection,
        )
        if doc and self.listener.__doc__:
            self.listener.__doc__ = doc + self.listener.__doc__

    def set_doc(self, component: str):
        if self.listener.__doc__:
            doc = Template(self.listener.__doc__).render(component=component)
            self.listener.__doc__ = doc

    def copy(self):
        return EventListener(
            self.event_name,
            self.has_trigger,
            self.config_data,
            self.show_progress,  # type: ignore
            self.callback,
            self.trigger_after,
            self.trigger_only_on_success,
            self.doc,
            self.connection,  # type: ignore
            self.event_specific_args,
        )

    @staticmethod
    def _setup(
        _event_name: str,
        _has_trigger: bool,
        _show_progress: Literal["full", "minimal", "hidden"],
        _callback: Callable | None,
        _trigger_after: int | None,
        _trigger_only_on_success: bool,
        _event_specific_args: list[dict[str, str]],
        _connection: Literal["sse", "stream"] = "sse",
    ):
        def event_trigger(
            block: Block | None,
            fn: Callable | None | Literal["decorator"] = "decorator",
            inputs: Component
            | BlockContext
            | Sequence[Component | BlockContext]
            | Set[Component | BlockContext]
            | None = None,
            outputs: Component
            | BlockContext
            | Sequence[Component | BlockContext]
            | Set[Component | BlockContext]
            | None = None,
            api_name: str | None | Literal[False] = None,
            api_description: str | None | Literal[False] = None,
            scroll_to_output: bool = False,
            show_progress: Literal["full", "minimal", "hidden"] = _show_progress,
            show_progress_on: Component | Sequence[Component] | None = None,
            queue: bool = True,
            batch: bool = False,
            max_batch_size: int = 4,
            preprocess: bool = True,
            postprocess: bool = True,
            cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
            trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
            js: str | Literal[True] | None = None,
            concurrency_limit: int | None | Literal["default"] = "default",
            concurrency_id: str | None = None,
            show_api: bool = True,
            time_limit: int | None = None,
            stream_every: float = 0.5,
            like_user_message: bool = False,
            key: int | str | tuple[int | str, ...] | None = None,
        ) -> Dependency:
            """
            Parameters:
                fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
                inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
                outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
                api_name: defines how the endpoint appears in the API docs. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given name. If None (default), the name of the function will be used as the API endpoint. If False, the endpoint will not be exposed in the API docs and downstream apps (including those that `gr.load` this app) will not be able to use this event.
                api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
                scroll_to_output: If True, will scroll to output component on completion
                show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all
                show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
                queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
                batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
                max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
                preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
                postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
                cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
                trigger_mode: If "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
                js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs' and 'outputs', return should be a list of values for output components.
                concurrency_limit: If set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
                concurrency_id: If set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
                show_api: whether to show this event in the "view API" page of the Gradio app, or in the ".view_api()" method of the Gradio clients. Unlike setting api_name to False, setting show_api to False will still allow downstream apps as well as the Clients to use this event. If fn is None, show_api will automatically be set to False.
                key: A unique key for this event listener to be used in @gr.render(). If set, this value identifies an event as identical across re-renders when the key is identical.
            """

            if fn == "decorator":

                def wrapper(func):
                    event_trigger(
                        block=block,
                        fn=func,
                        inputs=inputs,
                        outputs=outputs,
                        api_name=api_name,
                        scroll_to_output=scroll_to_output,
                        show_progress=show_progress,
                        show_progress_on=show_progress_on,
                        queue=queue,
                        batch=batch,
                        max_batch_size=max_batch_size,
                        preprocess=preprocess,
                        postprocess=postprocess,
                        cancels=cancels,
                        trigger_mode=trigger_mode,
                        js=js,
                        concurrency_limit=concurrency_limit,
                        concurrency_id=concurrency_id,
                        show_api=show_api,
                        key=key,
                    )

                    @wraps(func)
                    def inner(*args, **kwargs):
                        return func(*args, **kwargs)

                    return inner

                return Dependency(None, {}, None, wrapper)

            from gradio.components.base import StreamingInput

            if isinstance(block, StreamingInput) and "stream" in block.events:
                block.check_streamable()  # type: ignore
            if isinstance(show_progress, bool):
                show_progress = "full" if show_progress else "hidden"

            root_block = get_blocks_context()
            if root_block is None:
                raise AttributeError(
                    f"Cannot call {_event_name} outside of a gradio.Blocks context."
                )

            event_target = EventListenerMethod(
                block if _has_trigger else None, _event_name
            )

            dep, dep_index = root_block.set_event_trigger(
                [event_target],
                fn,
                inputs,
                outputs,
                preprocess=preprocess,
                postprocess=postprocess,
                scroll_to_output=scroll_to_output,
                show_progress=show_progress,
                show_progress_on=show_progress_on,
                api_name=api_name,
                api_description=api_description,
                js=js,
                concurrency_limit=concurrency_limit,
                concurrency_id=concurrency_id,
                queue=queue,
                batch=batch,
                max_batch_size=max_batch_size,
                trigger_after=_trigger_after,
                trigger_only_on_success=_trigger_only_on_success,
                trigger_mode=trigger_mode,
                show_api=show_api,
                connection=_connection,
                time_limit=time_limit,
                stream_every=stream_every,
                like_user_message=like_user_message,
                event_specific_args=[
                    d["name"]
                    for d in _event_specific_args
                    if d.get("component_prop", "true") != "false"
                ]
                if _event_specific_args
                else None,
                key=key,
            )
            set_cancel_events(
                [event_target],
                cancels,
            )
            if _callback:
                _callback(block)
            return Dependency(block, dep.get_config(), dep_index, fn)

        event_trigger.event_name = _event_name  # type: ignore
        event_trigger.has_trigger = _has_trigger  # type: ignore
        event_trigger.callback = _callback  # type: ignore
        event_trigger.connection = _connection  # type: ignore
        event_specific_args = (
            [
                d["name"]
                for d in _event_specific_args
                if d.get("component_prop", "true") != "false"
            ]
            if _event_specific_args
            else None
        )
        event_trigger.event_specific_args = event_specific_args  # type: ignore
        return event_trigger


@document()
def on(
    triggers: Sequence[EventListenerCallable] | EventListenerCallable | None = None,
    fn: Callable[..., Any] | None | Literal["decorator"] = "decorator",
    inputs: Component
    | BlockContext
    | Sequence[Component | BlockContext]
    | Set[Component | BlockContext]
    | None = None,
    outputs: Component
    | BlockContext
    | Sequence[Component | BlockContext]
    | Set[Component | BlockContext]
    | None = None,
    *,
    show_api: bool = True,
    api_name: str | None | Literal[False] = None,
    api_description: str | None | Literal[False] = None,
    scroll_to_output: bool = False,
    show_progress: Literal["full", "minimal", "hidden"] = "full",
    show_progress_on: Component | Sequence[Component] | None = None,
    queue: bool = True,
    batch: bool = False,
    max_batch_size: int = 4,
    preprocess: bool = True,
    postprocess: bool = True,
    cancels: dict[str, Any] | list[dict[str, Any]] | None = None,
    trigger_mode: Literal["once", "multiple", "always_last"] | None = None,
    js: str | Literal[True] | None = None,
    concurrency_limit: int | None | Literal["default"] = "default",
    concurrency_id: str | None = None,
    time_limit: int | None = None,
    stream_every: float = 0.5,
    key: int | str | tuple[int | str, ...] | None = None,
) -> Dependency:
    """
    Sets up an event listener that triggers a function when the specified event(s) occur. This is especially
    useful when the same function should be triggered by multiple events. Only a single API endpoint is generated
    for all events in the triggers list.

    Parameters:
        triggers: List of triggers to listen to, e.g. [btn.click, number.change]. If None, will run on app load and changes to any inputs.
        fn: the function to call when this event is triggered. Often a machine learning model's prediction function. Each parameter of the function corresponds to one input component, and the function should return a single value or a tuple of values, with each element in the tuple corresponding to one output component.
        inputs: List of gradio.components to use as inputs. If the function takes no inputs, this should be an empty list.
        outputs: List of gradio.components to use as outputs. If the function returns no outputs, this should be an empty list.
        api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, will use the functions name as the endpoint route. If set to a string, the endpoint will be exposed in the api docs with the given name.
        scroll_to_output: If True, will scroll to output component on completion
        show_progress: how to show the progress animation while event is running: "full" shows a spinner which covers the output component area as well as a runtime display in the upper right corner, "minimal" only shows the runtime display, "hidden" shows no progress animation at all,
        show_progress_on: Component or list of components to show the progress animation on. If None, will show the progress animation on all of the output components.
        queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
        batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
        max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
        preprocess: If False, will not run preprocessing of component data before running 'fn' (e.g. leaving it as a base64 string if this method is called with the `Image` component).
        postprocess: If False, will not run postprocessing of component data before returning 'fn' output to the browser.
        cancels: A list of other events to cancel when this listener is triggered. For example, setting cancels=[click_event] will cancel the click_event, where click_event is the return value of another components .click method. Functions that have not yet run (or generators that are iterating) will be cancelled, but functions that are currently running will be allowed to finish.
        trigger_mode: If "once" (default for all events except `.change()`) would not allow any submissions while an event is pending. If set to "multiple", unlimited submissions are allowed while pending, and "always_last" (default for `.change()` and `.key_up()` events) would allow a second submission after the pending event is complete.
        js: Optional frontend js method to run before running 'fn'. Input arguments for js method are values of 'inputs', return should be a list of values for output components.
        concurrency_limit: If set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
        concurrency_id: If set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
        show_api: whether to show this event in the "view API" page of the Gradio app, or in the ".view_api()" method of the Gradio clients. Unlike setting api_name to False, setting show_api to False will still allow downstream apps as well as the Clients to use this event. If fn is None, show_api will automatically be set to False.
        time_limit: The time limit for the function to run. Parameter only used for the `.stream()` event.
        stream_every: The latency (in seconds) at which stream chunks are sent to the backend. Defaults to 0.5 seconds. Parameter only used for the `.stream()` event.
    Example:
        import gradio as gr
        with gr.Blocks() as demo:
            with gr.Row():
                input = gr.Textbox()
                button = gr.Button("Submit")
            output = gr.Textbox()
            gr.on(
                triggers=[button.click, input.submit],
                fn=lambda x: x,
                inputs=[input],
                outputs=[output]
            )
        demo.launch()
    """
    from gradio.blocks import Block

    if not isinstance(triggers, Sequence) and triggers is not None:
        triggers = [triggers]
    triggers_typed = cast(Sequence[EventListener], triggers)

    if isinstance(inputs, Block):
        inputs = [inputs]

    if fn == "decorator":

        def wrapper(func):
            on(
                triggers,
                fn=func,
                inputs=inputs,
                outputs=outputs,
                api_name=api_name,
                scroll_to_output=scroll_to_output,
                show_progress=show_progress,
                show_progress_on=show_progress_on,
                queue=queue,
                batch=batch,
                max_batch_size=max_batch_size,
                preprocess=preprocess,
                postprocess=postprocess,
                cancels=cancels,
                js=js,
                concurrency_limit=concurrency_limit,
                concurrency_id=concurrency_id,
                show_api=show_api,
                trigger_mode=trigger_mode,
                time_limit=time_limit,
                stream_every=stream_every,
                key=key,
            )

            @wraps(func)
            def inner(*args, **kwargs):
                return func(*args, **kwargs)

            return inner

        return Dependency(None, {}, None, wrapper)

    root_block = get_blocks_context()
    if root_block is None:
        raise Exception("Cannot call on() outside of a gradio.Blocks context.")
    if triggers is None:
        methods = (
            [EventListenerMethod(input, "change") for input in inputs]
            if inputs is not None
            else []
        ) + [EventListenerMethod(root_block, "load")]  # type: ignore
    else:
        methods = [
            EventListenerMethod(t.__self__ if t.has_trigger else None, t.event_name)  # type: ignore
            for t in triggers_typed
        ]
    if triggers:
        for trigger in triggers:
            if trigger.callback:  # type: ignore
                trigger.callback(trigger.__self__)  # type: ignore
    dep, dep_index = root_block.set_event_trigger(
        methods,
        fn,
        inputs,
        outputs,
        preprocess=preprocess,
        postprocess=postprocess,
        scroll_to_output=scroll_to_output,
        show_progress=show_progress,
        show_progress_on=show_progress_on,
        api_name=api_name,
        api_description=api_description,
        js=js,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        queue=queue,
        batch=batch,
        max_batch_size=max_batch_size,
        show_api=show_api,
        trigger_mode=trigger_mode,
        connection="stream"
        if any(t.connection == "stream" for t in (triggers_typed or []))
        else "sse",
        event_specific_args=[
            a
            for t in (triggers_typed or [])
            for a in cast(list[str], t.event_specific_args or [])
        ],
        time_limit=time_limit,
        stream_every=stream_every,
        key=key,
    )
    set_cancel_events(methods, cancels)
    return Dependency(None, dep.get_config(), dep_index, fn)


@document()
def api(
    fn: Callable | Literal["decorator"] = "decorator",
    *,
    api_name: str | None | Literal[False] = None,
    api_description: str | None = None,
    queue: bool = True,
    batch: bool = False,
    max_batch_size: int = 4,
    concurrency_limit: int | None | Literal["default"] = "default",
    concurrency_id: str | None = None,
    show_api: bool = True,
    time_limit: int | None = None,
    stream_every: float = 0.5,
) -> Dependency:
    """
    Sets up an API or MCP endpoint for a generic function without needing define events listeners or components. Derives its typing from type hints in the provided function's signature rather than the components.

    Parameters:
        fn: the function to call when this event is triggered. Often a machine learning model's prediction function. The function should be fully typed, and the type hints will be used to derive the typing information for the API/MCP endpoint.
        api_name: Defines how the endpoint appears in the API docs. Can be a string, None, or False. If False, the endpoint will not be exposed in the api docs. If set to None, will use the functions name as the endpoint route. If set to a string, the endpoint will be exposed in the api docs with the given name.
        api_description: Description of the API endpoint. Can be a string, None, or False. If set to a string, the endpoint will be exposed in the API docs with the given description. If None, the function's docstring will be used as the API endpoint description. If False, then no description will be displayed in the API docs.
        queue: If True, will place the request on the queue, if the queue has been enabled. If False, will not put this event on the queue, even if the queue has been enabled. If None, will use the queue setting of the gradio app.
        batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. The lists should be of equal length (and be up to length `max_batch_size`). The function is then *required* to return a tuple of lists (even if there is only 1 output component), with each list in the tuple corresponding to one output component.
        max_batch_size: Maximum number of inputs to batch together if this is called from the queue (only relevant if batch=True)
        concurrency_limit: If set, this is the maximum number of this event that can be running simultaneously. Can be set to None to mean no concurrency_limit (any number of this event can be running simultaneously). Set to "default" to use the default concurrency limit (defined by the `default_concurrency_limit` parameter in `Blocks.queue()`, which itself is 1 by default).
        concurrency_id: If set, this is the id of the concurrency group. Events with the same concurrency_id will be limited by the lowest set concurrency_limit.
        show_api: whether to show this event in the "view API" page of the Gradio app, or in the ".view_api()" method of the Gradio clients. Unlike setting api_name to False, setting show_api to False will still allow downstream apps as well as the Clients to use this event. If fn is None, show_api will automatically be set to False.
        time_limit: The time limit for the function to run. Parameter only used for the `.stream()` event.
        stream_every: The latency (in seconds) at which stream chunks are sent to the backend. Defaults to 0.5 seconds. Parameter only used for the `.stream()` event.
    Example:
        import gradio as gr
        with gr.Blocks() as demo:
            with gr.Row():
                input = gr.Textbox()
                button = gr.Button("Submit")
            output = gr.Textbox()
            def fn(a: int, b: int, c: list[str]) -> tuple[int, str]:
                return a + b, c[a:b]
            gr.api(fn, api_name="add_and_slice")
        _, url, _ = demo.launch()

        from gradio_client import Client
        client = Client(url)
        result = client.predict(
                a=3,
                b=5,
                c=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                api_name="/add_and_slice"
        )
        print(result)
    """
    if fn == "decorator":

        def wrapper(func):
            api(
                fn=func,
                api_name=api_name,
                api_description=api_description,
                queue=queue,
                batch=batch,
                max_batch_size=max_batch_size,
                concurrency_limit=concurrency_limit,
                concurrency_id=concurrency_id,
                show_api=show_api,
                time_limit=time_limit,
                stream_every=stream_every,
            )

            @wraps(func)
            def inner(*args, **kwargs):
                return func(*args, **kwargs)

            return inner

        return Dependency(None, {}, None, wrapper)

    root_block = get_blocks_context()
    if root_block is None:
        raise Exception("Cannot call api() outside of a gradio.Blocks context.")

    from gradio.components.api_component import Api

    fn_params = get_function_params(fn)
    return_types = get_return_types(fn)

    def ordinal(n):
        return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"

    if any(param[3] is None for param in fn_params):
        raise ValueError(
            "API endpoints must have type hints. Please specify a type hint for all parameters."
        )
    inputs = [
        Api(
            default_value if has_default else None,
            python_type_to_json_schema(_type),
            ordinal(i + 1),
        )
        for i, (_, has_default, default_value, _type) in enumerate(fn_params)
    ]
    outputs = [
        Api(None, python_type_to_json_schema(type), ordinal(i + 1))
        for i, type in enumerate(return_types)
    ]

    dep, dep_index = root_block.set_event_trigger(
        [],
        fn,
        inputs,
        outputs,
        preprocess=False,
        postprocess=False,
        scroll_to_output=False,
        show_progress="hidden",
        api_name=api_name,
        api_description=api_description,
        js=None,
        concurrency_limit=concurrency_limit,
        concurrency_id=concurrency_id,
        queue=queue,
        batch=batch,
        max_batch_size=max_batch_size,
        show_api=show_api,
        trigger_mode=None,
        time_limit=time_limit,
        stream_every=stream_every,
    )
    return Dependency(None, dep.get_config(), dep_index, fn)


class Events:
    change = EventListener(
        "change",
        doc="Triggered when the value of the {{ component }} changes either because of user input (e.g. a user types in a textbox) OR because of a function update (e.g. an image receives a value from the output of an event trigger). See `.input()` for a listener that is only triggered by user input.",
    )
    input = EventListener(
        "input",
        doc="This listener is triggered when the user changes the value of the {{ component }}.",
    )
    click = EventListener("click", doc="Triggered when the {{ component }} is clicked.")
    double_click = EventListener(
        "double_click", doc="Triggered when the {{ component }} is double clicked."
    )
    submit = EventListener(
        "submit",
        doc="This listener is triggered when the user presses the Enter key while the {{ component }} is focused.",
    )
    stop = EventListener(
        "stop",
        doc="This listener is triggered when the user clicks on the stop button or icon.",
    )
    edit = EventListener(
        "edit",
        doc="This listener is triggered when the user edits the {{ component }} (e.g. image) using the built-in editor.",
        callback=lambda block: setattr(block, "editable", "user")
        if getattr(block, "editable", None) is None
        else None,
    )
    clear = EventListener(
        "clear",
        doc="This listener is triggered when the user clears the {{ component }} using the clear button for the component.",
    )
    play = EventListener(
        "play",
        doc="This listener is triggered when the user plays the media in the {{ component }}.",
    )
    pause = EventListener(
        "pause",
        doc="This listener is triggered when the media in the {{ component }} stops for any reason.",
    )
    stop = EventListener(
        "stop",
        doc="This listener is triggered when the user reaches the end of the media playing in the {{ component }}.",
    )
    end = EventListener(
        "end",
        doc="This listener is triggered when the user reaches the end of the media playing in the {{ component }}.",
    )
    start_recording = EventListener(
        "start_recording",
        doc="This listener is triggered when the user starts recording with the {{ component }}.",
    )
    pause_recording = EventListener(
        "pause_recording",
        doc="This listener is triggered when the user pauses recording with the {{ component }}.",
    )
    stop_recording = EventListener(
        "stop_recording",
        doc="This listener is triggered when the user stops recording with the {{ component }}.",
    )
    focus = EventListener(
        "focus", doc="This listener is triggered when the {{ component }} is focused."
    )
    blur = EventListener(
        "blur",
        doc="This listener is triggered when the {{ component }} is unfocused/blurred.",
    )
    upload = EventListener(
        "upload",
        doc="This listener is triggered when the user uploads a file into the {{ component }}.",
    )
    release = EventListener(
        "release",
        doc="This listener is triggered when the user releases the mouse on this {{ component }}.",
    )
    select = EventListener(
        "select",
        callback=lambda block: setattr(block, "_selectable", True),
        doc="Event listener for when the user selects or deselects the {{ component }}. Uses event data gradio.SelectData to carry `value` referring to the label of the {{ component }}, and `selected` to refer to state of the {{ component }}. See EventData documentation on how to use this event data",
    )
    stream = EventListener(
        "stream",
        config_data=lambda: {"streamable": False},
        callback=lambda block: setattr(block, "streaming", True),
        doc="This listener is triggered when the user streams the {{ component }}.",
        connection="stream",
        show_progress="minimal",
        event_specific_args=[
            {
                "name": "stream_every",
                "type": "float = 0.5",
                "doc": "The latency (in seconds) at which stream chunks are sent to the backend. Defaults to 0.5 seconds. Parameter only used for the `.stream()` event.",
            },
            {
                "name": "time_limit",
                "type": "float | None = None",
                "doc": "The time limit for the function to run. Parameter only used for the `.stream()` event.",
                "component_prop": "false",
            },
        ],
    )
    like = EventListener(
        "like",
        config_data=lambda: {"likeable": False},
        callback=lambda block: setattr(block, "likeable", True),
        event_specific_args=[
            {
                "name": "like_user_message",
                "type": "bool = False",
                "doc": "Whether to display the like buttons for user messages in the chatbot.",
            }
        ],
        doc="This listener is triggered when the user likes/dislikes from within the {{ component }}. This event has EventData of type gradio.LikeData that carries information, accessible through LikeData.index and LikeData.value. See EventData documentation on how to use this event data.",
    )
    example_select = EventListener(
        "example_select",
        doc="This listener is triggered when the user clicks on an example from within the {{ component }}. This event has SelectData of type gradio.SelectData that carries information, accessible through SelectData.index and SelectData.value. See SelectData documentation on how to use this event data.",
    )
    option_select = EventListener(
        "option_select",
        doc="This listener is triggered when the user clicks on an option from within the {{ component }}. This event has SelectData of type gradio.SelectData that carries information, accessible through SelectData.index and SelectData.value. See SelectData documentation on how to use this event data.",
    )
    load = EventListener(
        "load",
        doc="This listener is triggered when the {{ component }} initially loads in the browser.",
    )
    key_up = EventListener(
        "key_up",
        doc="This listener is triggered when the user presses a key while the {{ component }} is focused.",
    )
    apply = EventListener(
        "apply",
        doc="This listener is triggered when the user applies changes to the {{ component }} through an integrated UI action.",
    )
    delete = EventListener(
        "delete",
        doc="This listener is triggered when the user deletes and item from the {{ component }}. Uses event data gradio.DeletedFileData to carry `value` referring to the file that was deleted as an instance of FileData. See EventData documentation on how to use this event data",
    )
    tick = EventListener(
        "tick",
        doc="This listener is triggered at regular intervals defined by the {{ component }}.",
        show_progress="hidden",
    )
    undo = EventListener(
        "undo",
        doc="This listener is triggered when the user clicks the undo button in the chatbot message.",
        callback=lambda block: setattr(block, "_undoable", True),
        config_data=lambda: {"_undoable": False},
    )
    retry = EventListener(
        "retry",
        doc="This listener is triggered when the user clicks the retry button in the chatbot message.",
        callback=lambda block: setattr(block, "_retryable", True),
        config_data=lambda: {"_retryable": False},
    )
    expand = EventListener(
        "expand",
        doc="This listener is triggered when the {{ component }} is expanded.",
    )
    collapse = EventListener(
        "collapse",
        doc="This listener is triggered when the {{ component }} is collapsed.",
    )
    download = EventListener(
        "download",
        doc="This listener is triggered when the user downloads a file from the {{ component }}. Uses event data gradio.DownloadData to carry information about the downloaded file as a FileData object. See EventData documentation on how to use this event data",
    )
    copy = EventListener(
        "copy",
        doc="This listener is triggered when the user copies content from the {{ component }}. Uses event data gradio.CopyData to carry information about the copied content. See EventData documentation on how to use this event data",
    )
