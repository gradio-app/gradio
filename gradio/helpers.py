"""
Defines helper methods useful for loading and caching Interface examples.
"""
from __future__ import annotations

import ast
import csv
import inspect
import os
import shutil
import subprocess
import tempfile
import threading
import warnings
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, Iterable, Literal, Optional

import matplotlib.pyplot as plt
import numpy as np
import PIL
import PIL.Image
from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group
from matplotlib import animation

from gradio import components, oauth, processing_utils, routes, utils
from gradio.context import Context
from gradio.exceptions import Error
from gradio.flagging import CSVLogger

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio.blocks import Block
    from gradio.components import IOComponent

CACHED_FOLDER = "gradio_cached_examples"
LOG_FILE = "log.csv"

set_documentation_group("helpers")


def create_examples(
    examples: list[Any] | list[list[Any]] | str,
    inputs: IOComponent | list[IOComponent],
    outputs: IOComponent | list[IOComponent] | None = None,
    fn: Callable | None = None,
    cache_examples: bool = False,
    examples_per_page: int = 10,
    _api_mode: bool = False,
    label: str | None = None,
    elem_id: str | None = None,
    run_on_click: bool = False,
    preprocess: bool = True,
    postprocess: bool = True,
    api_name: str | None | Literal[False] = False,
    batch: bool = False,
):
    """Top-level synchronous function that creates Examples. Provided for backwards compatibility, i.e. so that gr.Examples(...) can be used to create the Examples component."""
    examples_obj = Examples(
        examples=examples,
        inputs=inputs,
        outputs=outputs,
        fn=fn,
        cache_examples=cache_examples,
        examples_per_page=examples_per_page,
        _api_mode=_api_mode,
        label=label,
        elem_id=elem_id,
        run_on_click=run_on_click,
        preprocess=preprocess,
        postprocess=postprocess,
        api_name=api_name,
        batch=batch,
        _initiated_directly=False,
    )
    client_utils.synchronize_async(examples_obj.create)
    return examples_obj


@document()
class Examples:
    """
    This class is a wrapper over the Dataset component and can be used to create Examples
    for Blocks / Interfaces. Populates the Dataset component with examples and
    assigns event listener so that clicking on an example populates the input/output
    components. Optionally handles example caching for fast inference.

    Demos: blocks_inputs, fake_gan
    Guides: more-on-examples-and-flagging, using-hugging-face-integrations, image-classification-in-pytorch, image-classification-in-tensorflow, image-classification-with-vision-transformers, create-your-own-friends-with-a-gan
    """

    def __init__(
        self,
        examples: list[Any] | list[list[Any]] | str,
        inputs: IOComponent | list[IOComponent],
        outputs: IOComponent | list[IOComponent] | None = None,
        fn: Callable | None = None,
        cache_examples: bool = False,
        examples_per_page: int = 10,
        _api_mode: bool = False,
        label: str | None = "Examples",
        elem_id: str | None = None,
        run_on_click: bool = False,
        preprocess: bool = True,
        postprocess: bool = True,
        api_name: str | None | Literal[False] = False,
        batch: bool = False,
        _initiated_directly: bool = True,
    ):
        """
        Parameters:
            examples: example inputs that can be clicked to populate specific components. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided but it should be within the directory with the python file running the gradio app. If there are multiple input components and a directory is provided, a log.csv file must be present in the directory to link corresponding inputs.
            inputs: the component or list of components corresponding to the examples
            outputs: optionally, provide the component or list of components corresponding to the output of the examples. Required if `cache` is True.
            fn: optionally, provide the function to run to generate the outputs corresponding to the examples. Required if `cache` is True.
            cache_examples: if True, caches examples for fast runtime. If True, then `fn` and `outputs` must be provided. If `fn` is a generator function, then the last yielded value will be used as the output.
            examples_per_page: how many examples to show per page.
            label: the label to use for the examples component (by default, "Examples")
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM.
            run_on_click: if cache_examples is False, clicking on an example does not run the function when an example is clicked. Set this to True to run the function when an example is clicked. Has no effect if cache_examples is True.
            preprocess: if True, preprocesses the example input before running the prediction function and caching the output. Only applies if cache_examples is True.
            postprocess: if True, postprocesses the example output after running the prediction function and before caching. Only applies if cache_examples is True.
            api_name: Defines how the event associated with clicking on the examples appears in the API docs. Can be a string, None, or False. If False (default), the endpoint will not be exposed in the api docs. If set to None, the endpoint will be exposed in the api docs as an unnamed endpoint, although this behavior will be changed in Gradio 4.0. If set to a string, the endpoint will be exposed in the api docs with the given name.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. Used only if cache_examples is True.
        """
        if _initiated_directly:
            warnings.warn(
                "Please use gr.Examples(...) instead of gr.examples.Examples(...) to create the Examples.",
            )

        if cache_examples and (fn is None or outputs is None):
            raise ValueError("If caching examples, `fn` and `outputs` must be provided")

        if not isinstance(inputs, list):
            inputs = [inputs]
        if outputs and not isinstance(outputs, list):
            outputs = [outputs]

        working_directory = Path().absolute()

        if examples is None:
            raise ValueError("The parameter `examples` cannot be None")
        elif isinstance(examples, list) and (
            len(examples) == 0 or isinstance(examples[0], list)
        ):
            pass
        elif (
            isinstance(examples, list) and len(inputs) == 1
        ):  # If there is only one input component, examples can be provided as a regular list instead of a list of lists
            examples = [[e] for e in examples]
        elif isinstance(examples, str):
            if not Path(examples).exists():
                raise FileNotFoundError(
                    f"Could not find examples directory: {examples}"
                )
            working_directory = examples
            if not (Path(examples) / LOG_FILE).exists():
                if len(inputs) == 1:
                    examples = [[e] for e in os.listdir(examples)]
                else:
                    raise FileNotFoundError(
                        "Could not find log file (required for multiple inputs): "
                        + LOG_FILE
                    )
            else:
                with open(Path(examples) / LOG_FILE) as logs:
                    examples = list(csv.reader(logs))
                    examples = [
                        examples[i][: len(inputs)] for i in range(1, len(examples))
                    ]  # remove header and unnecessary columns

        else:
            raise ValueError(
                "The parameter `examples` must either be a string directory or a list"
                "(if there is only 1 input component) or (more generally), a nested "
                "list, where each sublist represents a set of inputs."
            )

        input_has_examples = [False] * len(inputs)
        for example in examples:
            for idx, example_for_input in enumerate(example):
                if example_for_input is not None:
                    try:
                        input_has_examples[idx] = True
                    except IndexError:
                        pass  # If there are more example components than inputs, ignore. This can sometimes be intentional (e.g. loading from a log file where outputs and timestamps are also logged)

        inputs_with_examples = [
            inp for (inp, keep) in zip(inputs, input_has_examples) if keep
        ]
        non_none_examples = [
            [ex for (ex, keep) in zip(example, input_has_examples) if keep]
            for example in examples
        ]

        self.examples = examples
        self.non_none_examples = non_none_examples
        self.inputs = inputs
        self.inputs_with_examples = inputs_with_examples
        self.outputs = outputs or []
        self.fn = fn
        self.cache_examples = cache_examples
        self._api_mode = _api_mode
        self.preprocess = preprocess
        self.postprocess = postprocess
        self.api_name = api_name
        self.batch = batch

        with utils.set_directory(working_directory):
            self.processed_examples = [
                [
                    component.postprocess(sample)
                    for component, sample in zip(inputs, example)
                ]
                for example in examples
            ]
        self.non_none_processed_examples = [
            [ex for (ex, keep) in zip(example, input_has_examples) if keep]
            for example in self.processed_examples
        ]
        if cache_examples:
            for example in self.examples:
                if len([ex for ex in example if ex is not None]) != len(self.inputs):
                    warnings.warn(
                        "Examples are being cached but not all input components have "
                        "example values. This may result in an exception being thrown by "
                        "your function. If you do get an error while caching examples, make "
                        "sure all of your inputs have example values for all of your examples "
                        "or you provide default values for those particular parameters in your function."
                    )
                    break

        from gradio import components

        with utils.set_directory(working_directory):
            self.dataset = components.Dataset(
                components=inputs_with_examples,
                samples=non_none_examples,
                type="index",
                label=label,
                samples_per_page=examples_per_page,
                elem_id=elem_id,
            )

        self.cached_folder = Path(CACHED_FOLDER) / str(self.dataset._id)
        self.cached_file = Path(self.cached_folder) / "log.csv"
        self.cache_examples = cache_examples
        self.run_on_click = run_on_click

    async def create(self) -> None:
        """Caches the examples if self.cache_examples is True and creates the Dataset
        component to hold the examples"""

        async def load_example(example_id):
            processed_example = self.non_none_processed_examples[example_id]
            return utils.resolve_singleton(processed_example)

        if Context.root_block:
            self.load_input_event = self.dataset.click(
                load_example,
                inputs=[self.dataset],
                outputs=self.inputs_with_examples,  # type: ignore
                show_progress="hidden",
                postprocess=False,
                queue=False,
                api_name=self.api_name,  # type: ignore
            )
            if self.run_on_click and not self.cache_examples:
                if self.fn is None:
                    raise ValueError("Cannot run_on_click if no function is provided")
                self.load_input_event.then(
                    self.fn,
                    inputs=self.inputs,  # type: ignore
                    outputs=self.outputs,  # type: ignore
                )

        if self.cache_examples:
            await self.cache()

    async def cache(self) -> None:
        """
        Caches all of the examples so that their predictions can be shown immediately.
        """
        if Path(self.cached_file).exists():
            print(
                f"Using cache from '{utils.abspath(self.cached_folder)}' directory. If method or examples have changed since last caching, delete this folder to clear cache.\n"
            )
        else:
            if Context.root_block is None:
                raise ValueError("Cannot cache examples if not in a Blocks context")

            print(f"Caching examples at: '{utils.abspath(self.cached_folder)}'")
            cache_logger = CSVLogger()

            generated_values = []
            if inspect.isgeneratorfunction(self.fn):

                def get_final_item(*args):  # type: ignore
                    x = None
                    generated_values.clear()
                    for x in self.fn(*args):  # noqa: B007  # type: ignore
                        generated_values.append(x)
                    return x

                fn = get_final_item
            elif inspect.isasyncgenfunction(self.fn):

                async def get_final_item(*args):
                    x = None
                    generated_values.clear()
                    async for x in self.fn(*args):  # noqa: B007  # type: ignore
                        generated_values.append(x)
                    return x

                fn = get_final_item
            else:
                fn = self.fn

            # create a fake dependency to process the examples and get the predictions
            dependency, fn_index = Context.root_block.set_event_trigger(
                event_name="fake_event",
                fn=fn,
                inputs=self.inputs_with_examples,  # type: ignore
                outputs=self.outputs,  # type: ignore
                preprocess=self.preprocess and not self._api_mode,
                postprocess=self.postprocess and not self._api_mode,
                batch=self.batch,
            )

            assert self.outputs is not None
            cache_logger.setup(self.outputs, self.cached_folder)
            for example_id, _ in enumerate(self.examples):
                print(f"Caching example {example_id + 1}/{len(self.examples)}")
                processed_input = self.processed_examples[example_id]
                if self.batch:
                    processed_input = [[value] for value in processed_input]
                with utils.MatplotlibBackendMananger():
                    prediction = await Context.root_block.process_api(
                        fn_index=fn_index,
                        inputs=processed_input,
                        request=None,
                        state={},
                    )
                output = prediction["data"]
                if len(generated_values):
                    output = merge_generated_values_into_output(
                        self.outputs, generated_values, output
                    )

                if self.batch:
                    output = [value[0] for value in output]
                cache_logger.flag(output)
            # Remove the "fake_event" to prevent bugs in loading interfaces from spaces
            Context.root_block.dependencies.remove(dependency)
            Context.root_block.fns.pop(fn_index)

            # Remove the original load_input_event and replace it with one that
            # also populates the input. We do it this way to to allow the cache()
            # method to be called independently of the create() method
            index = Context.root_block.dependencies.index(self.load_input_event)
            Context.root_block.dependencies.pop(index)
            Context.root_block.fns.pop(index)

            async def load_example(example_id):
                processed_example = self.non_none_processed_examples[
                    example_id
                ] + await self.load_from_cache(example_id)
                return utils.resolve_singleton(processed_example)

            self.load_input_event = self.dataset.click(
                load_example,
                inputs=[self.dataset],
                outputs=self.inputs_with_examples + self.outputs,  # type: ignore
                show_progress="hidden",
                postprocess=False,
                queue=False,
                api_name=self.api_name,  # type: ignore
            )

            print("Caching complete\n")

    async def load_from_cache(self, example_id: int) -> list[Any]:
        """Loads a particular cached example for the interface.
        Parameters:
            example_id: The id of the example to process (zero-indexed).
        """
        with open(self.cached_file, encoding="utf-8") as cache:
            examples = list(csv.reader(cache))
        example = examples[example_id + 1]  # +1 to adjust for header
        output = []
        assert self.outputs is not None
        for component, value in zip(self.outputs, example):
            value_to_use = value
            try:
                value_as_dict = ast.literal_eval(value)
                # File components that output multiple files get saved as a python list
                # need to pass the parsed list to serialize
                # TODO: Better file serialization in 4.0
                if isinstance(value_as_dict, list) and isinstance(
                    component, components.File
                ):
                    value_to_use = value_as_dict
                assert utils.is_update(value_as_dict)
                output.append(value_as_dict)
            except (ValueError, TypeError, SyntaxError, AssertionError):
                output.append(
                    component.serialize(
                        value_to_use, self.cached_folder, allow_links=True
                    )
                )
        return output


def merge_generated_values_into_output(
    components: list[IOComponent], generated_values: list, output: list
):
    from gradio.events import StreamableOutput

    for output_index, output_component in enumerate(components):
        if (
            isinstance(output_component, StreamableOutput)
            and output_component.streaming
        ):
            binary_chunks = []
            for i, chunk in enumerate(generated_values):
                if len(components) > 1:
                    chunk = chunk[output_index]
                processed_chunk = output_component.postprocess(chunk)
                binary_chunks.append(
                    output_component.stream_output(processed_chunk, "", i == 0)[0]
                )
            binary_data = b"".join(binary_chunks)
            tempdir = os.environ.get("GRADIO_TEMP_DIR") or str(
                Path(tempfile.gettempdir()) / "gradio"
            )
            os.makedirs(tempdir, exist_ok=True)
            temp_file = tempfile.NamedTemporaryFile(dir=tempdir, delete=False)
            with open(temp_file.name, "wb") as f:
                f.write(binary_data)

            output[output_index] = {
                "name": temp_file.name,
                "is_file": True,
                "data": None,
            }

    return output


class TrackedIterable:
    def __init__(
        self,
        iterable: Iterable | None,
        index: int | None,
        length: int | None,
        desc: str | None,
        unit: str | None,
        _tqdm=None,
        progress: float | None = None,
    ) -> None:
        self.iterable = iterable
        self.index = index
        self.length = length
        self.desc = desc
        self.unit = unit
        self._tqdm = _tqdm
        self.progress = progress


@document("__call__", "tqdm")
class Progress(Iterable):
    """
    The Progress class provides a custom progress tracker that is used in a function signature.
    To attach a Progress tracker to a function, simply add a parameter right after the input parameters that has a default value set to a `gradio.Progress()` instance.
    The Progress tracker can then be updated in the function by calling the Progress object or using the `tqdm` method on an Iterable.
    The Progress tracker is currently only available with `queue()`.
    Example:
        import gradio as gr
        import time
        def my_function(x, progress=gr.Progress()):
            progress(0, desc="Starting...")
            time.sleep(1)
            for i in progress.tqdm(range(100)):
                time.sleep(0.1)
            return x
        gr.Interface(my_function, gr.Textbox(), gr.Textbox()).queue().launch()
    Demos: progress
    """

    def __init__(
        self,
        track_tqdm: bool = False,
        _callback: Callable | None = None,  # for internal use only
        _event_id: str | None = None,
    ):
        """
        Parameters:
            track_tqdm: If True, the Progress object will track any tqdm.tqdm iterations with the tqdm library in the function.
        """
        self.track_tqdm = track_tqdm
        self._callback = _callback
        self._event_id = _event_id
        self.iterables: list[TrackedIterable] = []

    def __len__(self):
        return self.iterables[-1].length

    def __iter__(self):
        return self

    def __next__(self):
        """
        Updates progress tracker with next item in iterable.
        """
        if self._callback:
            current_iterable = self.iterables[-1]
            while (
                not hasattr(current_iterable.iterable, "__next__")
                and len(self.iterables) > 0
            ):
                current_iterable = self.iterables.pop()
            self._callback(
                event_id=self._event_id,
                iterables=self.iterables,
            )
            assert current_iterable.index is not None, "Index not set."
            current_iterable.index += 1
            try:
                return next(current_iterable.iterable)  # type: ignore
            except StopIteration:
                self.iterables.pop()
                raise
        else:
            return self

    def __call__(
        self,
        progress: float | tuple[int, int | None] | None,
        desc: str | None = None,
        total: int | None = None,
        unit: str = "steps",
        _tqdm=None,
    ):
        """
        Updates progress tracker with progress and message text.
        Parameters:
            progress: If float, should be between 0 and 1 representing completion. If Tuple, first number represents steps completed, and second value represents total steps or None if unknown. If None, hides progress bar.
            desc: description to display.
            total: estimated total number of steps.
            unit: unit of iterations.
        """
        if self._callback:
            if isinstance(progress, tuple):
                index, total = progress
                progress = None
            else:
                index = None
            self._callback(
                event_id=self._event_id,
                iterables=self.iterables
                + [TrackedIterable(None, index, total, desc, unit, _tqdm, progress)],
            )
        else:
            return progress

    def tqdm(
        self,
        iterable: Iterable | None,
        desc: str | None = None,
        total: int | None = None,
        unit: str = "steps",
        _tqdm=None,
    ):
        """
        Attaches progress tracker to iterable, like tqdm.
        Parameters:
            iterable: iterable to attach progress tracker to.
            desc: description to display.
            total: estimated total number of steps.
            unit: unit of iterations.
        """
        if self._callback:
            if iterable is None:
                new_iterable = TrackedIterable(None, 0, total, desc, unit, _tqdm)
                self.iterables.append(new_iterable)
                self._callback(event_id=self._event_id, iterables=self.iterables)
                return self
            length = len(iterable) if hasattr(iterable, "__len__") else None  # type: ignore
            self.iterables.append(
                TrackedIterable(iter(iterable), 0, length, desc, unit, _tqdm)
            )
        return self

    def update(self, n=1):
        """
        Increases latest iterable with specified number of steps.
        Parameters:
            n: number of steps completed.
        """
        if self._callback and len(self.iterables) > 0:
            current_iterable = self.iterables[-1]
            assert current_iterable.index is not None, "Index not set."
            current_iterable.index += n
            self._callback(
                event_id=self._event_id,
                iterables=self.iterables,
            )
        else:
            return

    def close(self, _tqdm):
        """
        Removes iterable with given _tqdm.
        """
        if self._callback:
            for i in range(len(self.iterables)):
                if id(self.iterables[i]._tqdm) == id(_tqdm):
                    self.iterables.pop(i)
                    break
            self._callback(
                event_id=self._event_id,
                iterables=self.iterables,
            )
        else:
            return


def create_tracker(root_blocks, event_id, fn, track_tqdm):
    progress = Progress(_callback=root_blocks._queue.set_progress, _event_id=event_id)
    if not track_tqdm:
        return progress, fn

    try:
        _tqdm = __import__("tqdm")
    except ModuleNotFoundError:
        return progress, fn
    if not hasattr(root_blocks, "_progress_tracker_per_thread"):
        root_blocks._progress_tracker_per_thread = {}

    def init_tqdm(
        self, iterable=None, desc=None, total=None, unit="steps", *args, **kwargs
    ):
        self._progress = root_blocks._progress_tracker_per_thread.get(
            threading.get_ident()
        )
        if self._progress is not None:
            self._progress.event_id = event_id
            self._progress.tqdm(iterable, desc, total, unit, _tqdm=self)
            kwargs["file"] = open(os.devnull, "w")  # noqa: SIM115
        self.__init__orig__(iterable, desc, total, *args, unit=unit, **kwargs)

    def iter_tqdm(self):
        if self._progress is not None:
            return self._progress
        else:
            return self.__iter__orig__()

    def update_tqdm(self, n=1):
        if self._progress is not None:
            self._progress.update(n)
        return self.__update__orig__(n)

    def close_tqdm(self):
        if self._progress is not None:
            self._progress.close(self)
        return self.__close__orig__()

    def exit_tqdm(self, exc_type, exc_value, traceback):
        if self._progress is not None:
            self._progress.close(self)
        return self.__exit__orig__(exc_type, exc_value, traceback)

    if not hasattr(_tqdm.tqdm, "__init__orig__"):
        _tqdm.tqdm.__init__orig__ = _tqdm.tqdm.__init__
    _tqdm.tqdm.__init__ = init_tqdm
    if not hasattr(_tqdm.tqdm, "__update__orig__"):
        _tqdm.tqdm.__update__orig__ = _tqdm.tqdm.update
    _tqdm.tqdm.update = update_tqdm
    if not hasattr(_tqdm.tqdm, "__close__orig__"):
        _tqdm.tqdm.__close__orig__ = _tqdm.tqdm.close
    _tqdm.tqdm.close = close_tqdm
    if not hasattr(_tqdm.tqdm, "__exit__orig__"):
        _tqdm.tqdm.__exit__orig__ = _tqdm.tqdm.__exit__
    _tqdm.tqdm.__exit__ = exit_tqdm
    if not hasattr(_tqdm.tqdm, "__iter__orig__"):
        _tqdm.tqdm.__iter__orig__ = _tqdm.tqdm.__iter__
    _tqdm.tqdm.__iter__ = iter_tqdm
    if hasattr(_tqdm, "auto") and hasattr(_tqdm.auto, "tqdm"):
        _tqdm.auto.tqdm = _tqdm.tqdm

    def before_fn():
        thread_id = threading.get_ident()
        root_blocks._progress_tracker_per_thread[thread_id] = progress

    def after_fn():
        thread_id = threading.get_ident()
        del root_blocks._progress_tracker_per_thread[thread_id]

    tracked_fn = utils.function_wrapper(fn, before_fn=before_fn, after_fn=after_fn)

    return progress, tracked_fn


def special_args(
    fn: Callable,
    inputs: list[Any] | None = None,
    request: routes.Request | None = None,
    event_data: EventData | None = None,
):
    """
    Checks if function has special arguments Request or EventData (via annotation) or Progress (via default value).
    If inputs is provided, these values will be loaded into the inputs array.
    Parameters:
        fn: function to check.
        inputs: array to load special arguments into.
        request: request to load into inputs.
        event_data: event-related data to load into inputs.
    Returns:
        updated inputs, progress index, event data index.
    """
    signature = inspect.signature(fn)
    type_hints = utils.get_type_hints(fn)
    positional_args = []
    for param in signature.parameters.values():
        if param.kind not in (param.POSITIONAL_ONLY, param.POSITIONAL_OR_KEYWORD):
            break
        positional_args.append(param)
    progress_index = None
    event_data_index = None
    for i, param in enumerate(positional_args):
        type_hint = type_hints.get(param.name)
        if isinstance(param.default, Progress):
            progress_index = i
            if inputs is not None:
                inputs.insert(i, param.default)
        elif type_hint == routes.Request:
            if inputs is not None:
                inputs.insert(i, request)
        elif (
            type_hint == Optional[oauth.OAuthProfile]
            or type_hint == oauth.OAuthProfile
            # Note: "OAuthProfile | None" is equals to Optional[OAuthProfile] in Python
            #       => it is automatically handled as well by the above condition
            #       (adding explicit "OAuthProfile | None" would break in Python3.9)
        ):
            if inputs is not None:
                # Retrieve session from gr.Request, if it exists (i.e. if user is logged in)
                session = (
                    # request.session (if fastapi.Request obj i.e. direct call)
                    getattr(request, "session", {})
                    or
                    # or request.request.session (if gr.Request obj i.e. websocket call)
                    getattr(getattr(request, "request", None), "session", {})
                )
                oauth_profile = (
                    session["oauth_profile"] if "oauth_profile" in session else None
                )
                if type_hint == oauth.OAuthProfile and oauth_profile is None:
                    raise Error(
                        "This action requires a logged in user. Please sign in and retry."
                    )
                inputs.insert(i, oauth_profile)
        elif (
            type_hint
            and inspect.isclass(type_hint)
            and issubclass(type_hint, EventData)
        ):
            event_data_index = i
            if inputs is not None and event_data is not None:
                inputs.insert(i, type_hint(event_data.target, event_data._data))
        elif (
            param.default is not param.empty and inputs is not None and len(inputs) <= i
        ):
            inputs.insert(i, param.default)
    if inputs is not None:
        while len(inputs) < len(positional_args):
            i = len(inputs)
            param = positional_args[i]
            if param.default == param.empty:
                warnings.warn("Unexpected argument. Filling with None.")
                inputs.append(None)
            else:
                inputs.append(param.default)
    return inputs or [], progress_index, event_data_index


@document()
def update(**kwargs) -> dict:
    """
    Updates component properties. When a function passed into a Gradio Interface or a Blocks events returns a typical value, it updates the value of the output component. But it is also possible to update the properties of an output component (such as the number of lines of a `Textbox` or the visibility of an `Image`) by returning the component's `update()` function, which takes as parameters any of the constructor parameters for that component.
    This is a shorthand for using the update method on a component.
    For example, rather than using gr.Number.update(...) you can just use gr.update(...).
    Note that your editor's autocompletion will suggest proper parameters
    if you use the update method on the component.
    Demos: blocks_essay, blocks_update, blocks_essay_update

    Parameters:
        kwargs: Key-word arguments used to update the component's properties.
    Example:
        # Blocks Example
        import gradio as gr
        with gr.Blocks() as demo:
            radio = gr.Radio([1, 2, 4], label="Set the value of the number")
            number = gr.Number(value=2, interactive=True)
            radio.change(fn=lambda value: gr.update(value=value), inputs=radio, outputs=number)
        demo.launch()

        # Interface example
        import gradio as gr
        def change_textbox(choice):
          if choice == "short":
              return gr.Textbox.update(lines=2, visible=True)
          elif choice == "long":
              return gr.Textbox.update(lines=8, visible=True)
          else:
              return gr.Textbox.update(visible=False)
        gr.Interface(
          change_textbox,
          gr.Radio(
              ["short", "long", "none"], label="What kind of essay would you like to write?"
          ),
          gr.Textbox(lines=2),
          live=True,
        ).launch()
    """
    kwargs["__type__"] = "generic_update"
    return kwargs


def skip() -> dict:
    return update()


@document()
def make_waveform(
    audio: str | tuple[int, np.ndarray],
    *,
    bg_color: str = "#f3f4f6",
    bg_image: str | None = None,
    fg_alpha: float = 0.75,
    bars_color: str | tuple[str, str] = ("#fbbf24", "#ea580c"),
    bar_count: int = 50,
    bar_width: float = 0.6,
    animate: bool = False,
) -> str:
    """
    Generates a waveform video from an audio file. Useful for creating an easy to share audio visualization. The output should be passed into a `gr.Video` component.
    Parameters:
        audio: Audio file path or tuple of (sample_rate, audio_data)
        bg_color: Background color of waveform (ignored if bg_image is provided)
        bg_image: Background image of waveform
        fg_alpha: Opacity of foreground waveform
        bars_color: Color of waveform bars. Can be a single color or a tuple of (start_color, end_color) of gradient
        bar_count: Number of bars in waveform
        bar_width: Width of bars in waveform. 1 represents full width, 0.5 represents half width, etc.
        animate: If true, the audio waveform overlay will be animated, if false, it will be static.
    Returns:
        A filepath to the output video in mp4 format.
    """
    if isinstance(audio, str):
        audio_file = audio
        audio = processing_utils.audio_from_file(audio)
    else:
        tmp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        processing_utils.audio_to_file(audio[0], audio[1], tmp_wav.name, format="wav")
        audio_file = tmp_wav.name

    if not os.path.isfile(audio_file):
        raise ValueError("Audio file not found.")

    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg not found.")

    duration = round(len(audio[1]) / audio[0], 4)

    # Helper methods to create waveform
    def hex_to_rgb(hex_str):
        return [int(hex_str[i : i + 2], 16) for i in range(1, 6, 2)]

    def get_color_gradient(c1, c2, n):
        assert n > 1
        c1_rgb = np.array(hex_to_rgb(c1)) / 255
        c2_rgb = np.array(hex_to_rgb(c2)) / 255
        mix_pcts = [x / (n - 1) for x in range(n)]
        rgb_colors = [((1 - mix) * c1_rgb + (mix * c2_rgb)) for mix in mix_pcts]
        return [
            "#" + "".join(f"{int(round(val * 255)):02x}" for val in item)
            for item in rgb_colors
        ]

    # Reshape audio to have a fixed number of bars
    samples = audio[1]
    if len(samples.shape) > 1:
        samples = np.mean(samples, 1)
    bins_to_pad = bar_count - (len(samples) % bar_count)
    samples = np.pad(samples, [(0, bins_to_pad)])
    samples = np.reshape(samples, (bar_count, -1))
    samples = np.abs(samples)
    samples = np.max(samples, 1)

    with utils.MatplotlibBackendMananger():
        plt.clf()
        # Plot waveform
        color = (
            bars_color
            if isinstance(bars_color, str)
            else get_color_gradient(bars_color[0], bars_color[1], bar_count)
        )

        if animate:
            fig = plt.figure(figsize=(5, 1), dpi=200, frameon=False)
            fig.subplots_adjust(left=0, bottom=0, right=1, top=1)
        plt.axis("off")
        plt.margins(x=0)

        bar_alpha = fg_alpha if animate else 1.0
        barcollection = plt.bar(
            np.arange(0, bar_count),
            samples * 2,
            bottom=(-1 * samples),
            width=bar_width,
            color=color,
            alpha=bar_alpha,
        )

        tmp_img = tempfile.NamedTemporaryFile(suffix=".png", delete=False)

        savefig_kwargs: dict[str, Any] = {"bbox_inches": "tight"}
        if bg_image is not None:
            savefig_kwargs["transparent"] = True
            if animate:
                savefig_kwargs["facecolor"] = "none"
        else:
            savefig_kwargs["facecolor"] = bg_color
        plt.savefig(tmp_img.name, **savefig_kwargs)

        if not animate:
            waveform_img = PIL.Image.open(tmp_img.name)
            waveform_img = waveform_img.resize((1000, 400))

            # Composite waveform with background image
            if bg_image is not None:
                waveform_array = np.array(waveform_img)
                waveform_array[:, :, 3] = waveform_array[:, :, 3] * fg_alpha
                waveform_img = PIL.Image.fromarray(waveform_array)

                bg_img = PIL.Image.open(bg_image)
                waveform_width, waveform_height = waveform_img.size
                bg_width, bg_height = bg_img.size
                if waveform_width != bg_width:
                    bg_img = bg_img.resize(
                        (
                            waveform_width,
                            2 * int(bg_height * waveform_width / bg_width / 2),
                        )
                    )
                    bg_width, bg_height = bg_img.size
                composite_height = max(bg_height, waveform_height)
                composite = PIL.Image.new(
                    "RGBA", (waveform_width, composite_height), "#FFFFFF"
                )
                composite.paste(bg_img, (0, composite_height - bg_height))
                composite.paste(
                    waveform_img, (0, composite_height - waveform_height), waveform_img
                )
                composite.save(tmp_img.name)
                img_width, img_height = composite.size
            else:
                img_width, img_height = waveform_img.size
                waveform_img.save(tmp_img.name)
        else:

            def _animate(_):
                for idx, b in enumerate(barcollection):
                    rand_height = np.random.uniform(0.8, 1.2)
                    b.set_height(samples[idx] * rand_height * 2)
                    b.set_y((-rand_height * samples)[idx])

            frames = int(duration * 10)
            anim = animation.FuncAnimation(
                fig,  # type: ignore
                _animate,
                repeat=False,
                blit=False,
                frames=frames,
                interval=100,
            )
            anim.save(
                tmp_img.name,
                writer="pillow",
                fps=10,
                codec="png",
                savefig_kwargs=savefig_kwargs,
            )

    # Convert waveform to video with ffmpeg
    output_mp4 = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)

    if animate and bg_image is not None:
        ffmpeg_cmd = [
            ffmpeg,
            "-loop",
            "1",
            "-i",
            bg_image,
            "-i",
            tmp_img.name,
            "-i",
            audio_file,
            "-filter_complex",
            "[0:v]scale=w=trunc(iw/2)*2:h=trunc(ih/2)*2[bg];[1:v]format=rgba,colorchannelmixer=aa=1.0[ov];[bg][ov]overlay=(main_w-overlay_w*0.9)/2:main_h-overlay_h*0.9/2[output]",
            "-t",
            str(duration),
            "-map",
            "[output]",
            "-map",
            "2:a",
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-shortest",
            "-y",
            output_mp4.name,
        ]
    elif animate and bg_image is None:
        ffmpeg_cmd = [
            ffmpeg,
            "-i",
            tmp_img.name,
            "-i",
            audio_file,
            "-filter_complex",
            "[0:v][1:a]concat=n=1:v=1:a=1[v];[v]scale=1000:400,format=yuv420p[v_scaled]",
            "-map",
            "[v_scaled]",
            "-map",
            "1:a",
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-shortest",
            "-y",
            output_mp4.name,
        ]
    else:
        ffmpeg_cmd = [
            ffmpeg,
            "-loop",
            "1",
            "-i",
            tmp_img.name,
            "-i",
            audio_file,
            "-vf",
            f"color=c=#FFFFFF77:s={img_width}x{img_height}[bar];[0][bar]overlay=-w+(w/{duration})*t:H-h:shortest=1",  # type: ignore
            "-t",
            str(duration),
            "-y",
            output_mp4.name,
        ]

    subprocess.check_call(ffmpeg_cmd)
    return output_mp4.name


@document()
class EventData:
    """
    When a subclass of EventData is added as a type hint to an argument of an event listener method, this object will be passed as that argument.
    It contains information about the event that triggered the listener, such the target object, and other data related to the specific event that are attributes of the subclass.

    Example:
        table = gr.Dataframe([[1, 2, 3], [4, 5, 6]])
        gallery = gr.Gallery([("cat.jpg", "Cat"), ("dog.jpg", "Dog")])
        textbox = gr.Textbox("Hello World!")

        statement = gr.Textbox()

        def on_select(evt: gr.SelectData):  # SelectData is a subclass of EventData
            return f"You selected {evt.value} at {evt.index} from {evt.target}"

        table.select(on_select, None, statement)
        gallery.select(on_select, None, statement)
        textbox.select(on_select, None, statement)
    Demos: gallery_selections, tictactoe
    """

    def __init__(self, target: Block | None, _data: Any):
        """
        Parameters:
            target: The target object that triggered the event. Can be used to distinguish if multiple components are bound to the same listener.
        """
        self.target = target
        self._data = _data


def log_message(message: str, level: Literal["info", "warning"] = "info"):
    from gradio import context

    if not hasattr(context.thread_data, "blocks"):  # Function called outside of Gradio
        if level == "info":
            print(message)
        elif level == "warning":
            warnings.warn(message)
        return
    if not context.thread_data.blocks.enable_queue:
        warnings.warn(
            f"Queueing must be enabled to issue {level.capitalize()}: '{message}'."
        )
        return
    context.thread_data.blocks._queue.log_message(
        event_id=context.thread_data.event_id, log=message, level=level
    )


@document()
def Warning(message: str = "Warning issued."):  # noqa: N802
    """
    This function allows you to pass custom warning messages to the user. You can do so simply with `gr.Warning('message here')`, and when that line is executed the custom message will appear in a modal on the demo.
    Parameters:
        message: The warning message to be displayed to the user.
    """
    log_message(message, level="warning")


@document()
def Info(message: str = "Info issued."):  # noqa: N802
    """
    Parameters:
        message: The info message to be displayed to the user.
    """
    log_message(message, level="info")
