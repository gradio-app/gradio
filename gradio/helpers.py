"""
Defines helper methods useful for loading and caching Interface examples.
"""

from __future__ import annotations

import ast
import copy
import csv
import inspect
import os
import shutil
import subprocess
import tempfile
import warnings
from functools import partial
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, Iterable, Literal, Optional, Sequence

import numpy as np
import PIL
import PIL.Image
from gradio_client import utils as client_utils
from gradio_client.documentation import document

from gradio import components, oauth, processing_utils, routes, utils, wasm_utils
from gradio.context import Context, LocalContext, get_blocks_context
from gradio.data_classes import GradioModel, GradioRootModel
from gradio.events import Dependency, EventData
from gradio.exceptions import Error
from gradio.flagging import CSVLogger
from gradio.utils import UnhashableKeyDict

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio.components import Component

LOG_FILE = "log.csv"


def create_examples(
    examples: list[Any] | list[list[Any]] | str,
    inputs: Component | Sequence[Component],
    outputs: Component | Sequence[Component] | None = None,
    fn: Callable | None = None,
    cache_examples: bool | Literal["lazy"] | None = None,
    examples_per_page: int = 10,
    _api_mode: bool = False,
    label: str | None = None,
    elem_id: str | None = None,
    run_on_click: bool = False,
    preprocess: bool = True,
    postprocess: bool = True,
    api_name: str | Literal[False] = "load_example",
    batch: bool = False,
    *,
    example_labels: list[str] | None = None,
    visible: bool = True,
    _defer_caching: bool = False,
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
        _defer_caching=_defer_caching,
        example_labels=example_labels,
        visible=visible,
        _initiated_directly=False,
    )
    examples_obj.create()
    return examples_obj


@document()
class Examples:
    """
    This class is a wrapper over the Dataset component and can be used to create Examples
    for Blocks / Interfaces. Populates the Dataset component with examples and
    assigns event listener so that clicking on an example populates the input/output
    components. Optionally handles example caching for fast inference.

    Demos: calculator_blocks
    Guides: more-on-examples-and-flagging, using-hugging-face-integrations, image-classification-in-pytorch, image-classification-in-tensorflow, image-classification-with-vision-transformers, create-your-own-friends-with-a-gan
    """

    def __init__(
        self,
        examples: list[Any] | list[list[Any]] | str,
        inputs: Component | Sequence[Component],
        outputs: Component | Sequence[Component] | None = None,
        fn: Callable | None = None,
        cache_examples: bool | Literal["lazy"] | None = None,
        examples_per_page: int = 10,
        _api_mode: bool = False,
        label: str | None = "Examples",
        elem_id: str | None = None,
        run_on_click: bool = False,
        preprocess: bool = True,
        postprocess: bool = True,
        api_name: str | Literal[False] = "load_example",
        batch: bool = False,
        *,
        example_labels: list[str] | None = None,
        visible: bool = True,
        _defer_caching: bool = False,
        _initiated_directly: bool = True,
    ):
        """
        Parameters:
            examples: example inputs that can be clicked to populate specific components. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided but it should be within the directory with the python file running the gradio app. If there are multiple input components and a directory is provided, a log.csv file must be present in the directory to link corresponding inputs.
            inputs: the component or list of components corresponding to the examples
            outputs: optionally, provide the component or list of components corresponding to the output of the examples. Required if `cache_examples` is not False.
            fn: optionally, provide the function to run to generate the outputs corresponding to the examples. Required if `cache_examples` is not False. Also required if `run_on_click` is True.
            cache_examples: If True, caches examples in the server for fast runtime in examples. If "lazy", then examples are cached after their first use. Can also be set by the GRADIO_CACHE_EXAMPLES environment variable, which takes a case-insensitive value, one of: {"true", "lazy", or "false"} (for the first two to take effect, `fn` and `outputs` should also be provided). In HuggingFace Spaces, this is True (as long as `fn` and `outputs` are also provided). The default option otherwise is False.
            examples_per_page: how many examples to show per page.
            label: the label to use for the examples component (by default, "Examples")
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM.
            run_on_click: if cache_examples is False, clicking on an example does not run the function when an example is clicked. Set this to True to run the function when an example is clicked. Has no effect if cache_examples is True.
            preprocess: if True, preprocesses the example input before running the prediction function and caching the output. Only applies if `cache_examples` is not False.
            postprocess: if True, postprocesses the example output after running the prediction function and before caching. Only applies if `cache_examples` is not False.
            api_name: Defines how the event associated with clicking on the examples appears in the API docs. Can be a string or False. If set to a string, the endpoint will be exposed in the API docs with the given name. If False, the endpoint will not be exposed in the API docs and downstream apps (including those that `gr.load` this app) will not be able to use the example function.
            batch: If True, then the function should process a batch of inputs, meaning that it should accept a list of input values for each parameter. Used only if cache_examples is not False.
            example_labels: A list of labels for each example. If provided, the length of this list should be the same as the number of examples, and these labels will be used in the UI instead of rendering the example values.
            visible: If False, the examples component will be hidden in the UI.
        """
        if _initiated_directly:
            warnings.warn(
                "Please use gr.Examples(...) instead of gr.examples.Examples(...) to create the Examples.",
            )

        if cache_examples is None:
            if cache_examples_env := os.getenv("GRADIO_CACHE_EXAMPLES"):
                if cache_examples_env.lower() == "true":
                    if fn is not None and outputs is not None:
                        self.cache_examples = True
                    else:
                        self.cache_examples = False
                elif cache_examples_env.lower() == "lazy":
                    if fn is not None and outputs is not None:
                        self.cache_examples = "lazy"
                    else:
                        self.cache_examples = False
                elif cache_examples_env.lower() == "false":
                    self.cache_examples = False
                else:
                    raise ValueError(
                        "The `GRADIO_CACHE_EXAMPLES` env variable must be one of: 'true', 'false', 'lazy' (case-insensitive)."
                    )
            elif utils.get_space() and fn is not None and outputs is not None:
                self.cache_examples = True
            else:
                self.cache_examples = cache_examples or False
        else:
            if cache_examples not in [True, False, "lazy"]:
                raise ValueError(
                    "The `cache_examples` parameter must be one of: True, False, 'lazy'."
                )
            self.cache_examples = cache_examples

        if self.cache_examples and (fn is None or outputs is None):
            raise ValueError("If caching examples, `fn` and `outputs` must be provided")
        self._defer_caching = _defer_caching

        if not isinstance(inputs, Sequence):
            inputs = [inputs]
        if outputs and not isinstance(outputs, Sequence):
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
        if example_labels is not None and len(example_labels) != len(examples):
            raise ValueError(
                "If `example_labels` are provided, the length of `example_labels` must be the same as the number of examples."
            )

        self.examples = examples
        self.non_none_examples = non_none_examples
        self.inputs = inputs
        self.input_has_examples = input_has_examples
        self.inputs_with_examples = inputs_with_examples
        self.outputs = outputs or []
        self.fn = fn
        self._api_mode = _api_mode
        self.preprocess = preprocess
        self.postprocess = postprocess
        self.api_name: str | Literal[False] = api_name
        self.batch = batch
        self.example_labels = example_labels
        self.working_directory = working_directory

        from gradio import components

        with utils.set_directory(working_directory):
            self.dataset = components.Dataset(
                components=inputs_with_examples,
                samples=copy.deepcopy(non_none_examples),
                type="tuple",
                label=label,
                samples_per_page=examples_per_page,
                elem_id=elem_id,
                visible=visible,
                sample_labels=example_labels,
            )

        self.cache_logger = CSVLogger(simplify_file_data=False)
        self.cached_folder = utils.get_cache_folder() / str(self.dataset._id)
        self.cached_file = Path(self.cached_folder) / "log.csv"
        self.cached_indices_file = Path(self.cached_folder) / "indices.csv"
        self.run_on_click = run_on_click
        self.cache_event: Dependency | None = None
        self.non_none_processed_examples = UnhashableKeyDict()

        if self.dataset.samples:
            for index, example in enumerate(self.non_none_examples):
                self.non_none_processed_examples[self.dataset.samples[index]] = (
                    self._get_processed_example(example)
                )

    def _get_processed_example(self, example):
        if example in self.non_none_processed_examples:
            return self.non_none_processed_examples[example]
        with utils.set_directory(self.working_directory):
            sub = []
            for component, sample in zip(self.inputs, example):
                prediction_value = component.postprocess(sample)
                if isinstance(prediction_value, (GradioRootModel, GradioModel)):
                    prediction_value = prediction_value.model_dump()
                prediction_value = processing_utils.move_files_to_cache(
                    prediction_value,
                    component,
                    postprocess=True,
                )
                sub.append(prediction_value)
        return [ex for (ex, keep) in zip(sub, self.input_has_examples) if keep]

    def create(self) -> None:
        """Caches the examples if self.cache_examples is True and creates the Dataset
        component to hold the examples"""

        async def load_example(example_tuple):
            _, example_value = example_tuple
            processed_example = self._get_processed_example(example_value)
            if len(self.inputs_with_examples) == 1:
                return update(
                    value=processed_example[0],
                    **self.dataset.component_props[0],  # type: ignore
                )
            return [
                update(value=processed_example[i], **self.dataset.component_props[i])  # type: ignore
                for i in range(len(self.inputs_with_examples))
            ]

        root_block = get_blocks_context()
        if root_block:
            self.load_input_event = self.dataset.click(
                load_example,
                inputs=[self.dataset],
                outputs=self.inputs_with_examples,  # type: ignore
                show_progress="hidden",
                postprocess=False,
                queue=False,
                api_name=self.api_name,
                show_api=False,
            )
            if self.run_on_click and not self.cache_examples:
                if self.fn is None:
                    raise ValueError("Cannot run_on_click if no function is provided")
                self.load_input_event.then(
                    self.fn,
                    inputs=self.inputs,  # type: ignore
                    outputs=self.outputs,  # type: ignore
                    show_api=False,
                )
        if not self._defer_caching:
            self._start_caching()

    async def _postprocess_output(self, output) -> list:
        """
        This is a way that we can postprocess the data manually, since we set postprocess=False in the lazy_cache
        event handler. The reason we did that is because we don't want to postprocess data if we are loading from
        the cache, since that has already been postprocessed. We postprocess this data manually if we are calling
        the function using the _handle_callable_as_generator() method.
        """
        import gradio as gr

        with gr.Blocks() as demo:
            [output.render() for output in self.outputs]
            demo.load(self.fn, self.inputs, self.outputs)
        demo.unrender()
        return await demo.postprocess_data(demo.default_config.fns[0], output, None)

    def _get_cached_index_if_cached(self, example_index) -> int | None:
        if Path(self.cached_indices_file).exists():
            with open(self.cached_indices_file) as f:
                cached_indices = [int(line.strip()) for line in f]
            if example_index in cached_indices:
                cached_index = cached_indices.index(example_index)
                return cached_index
        return None

    def _start_caching(self):
        if self.cache_examples:
            for example in self.examples:
                if len([ex for ex in example if ex is not None]) != len(self.inputs):
                    warnings.warn(
                        "Examples will be cached but not all input components have "
                        "example values. This may result in an exception being thrown by "
                        "your function. If you do get an error while caching examples, make "
                        "sure all of your inputs have example values for all of your examples "
                        "or you provide default values for those particular parameters in your function."
                    )
                    break
        if self.cache_examples == "lazy":
            client_utils.synchronize_async(self.lazy_cache)
        if self.cache_examples is True:
            if wasm_utils.IS_WASM:
                # In the Wasm mode, the `threading` module is not supported,
                # so `client_utils.synchronize_async` is also not available.
                # And `self.cache()` should be waited for to complete before this method returns,
                # (otherwise, an error "Cannot cache examples if not in a Blocks context" will be raised anyway)
                # so `eventloop.create_task(self.cache())` is also not an option.
                warnings.warn(
                    "Setting `cache_examples=True` is not supported in the Wasm mode. You can set `cache_examples='lazy'` to cache examples after first use."
                )
            else:
                client_utils.synchronize_async(self.cache)

    async def lazy_cache(self) -> None:
        print(
            f"Will cache examples in '{utils.abspath(self.cached_folder)}' directory at first use. ",
            end="",
        )
        if Path(self.cached_file).exists():
            print(
                "If method or examples have changed since last caching, delete this folder to reset cache.",
                end="",
            )
        print("\n\n")
        self.cache_logger.setup(self.outputs, self.cached_folder)
        if inspect.iscoroutinefunction(self.fn) or inspect.isasyncgenfunction(self.fn):
            lazy_cache_fn = self.async_lazy_cache
        else:
            lazy_cache_fn = self.sync_lazy_cache
        self.cache_event = self.load_input_event.then(
            lazy_cache_fn,
            inputs=[self.dataset] + list(self.inputs),
            outputs=self.outputs,
            postprocess=False,
            api_name=self.api_name,
            show_api=False,
        )

    async def async_lazy_cache(
        self, example_value: tuple[int, list[Any]], *input_values
    ):
        example_index, _ = example_value
        cached_index = self._get_cached_index_if_cached(example_index)
        if cached_index is not None:
            output = self.load_from_cache(cached_index)
            yield output[0] if len(self.outputs) == 1 else output
            return
        output = [None] * len(self.outputs)
        if inspect.isasyncgenfunction(self.fn):
            fn = self.fn
        else:
            fn = utils.async_fn_to_generator(self.fn)
        async for output in fn(*input_values):
            output = await self._postprocess_output(output)
            yield output[0] if len(self.outputs) == 1 else output
        self.cache_logger.flag(output)
        with open(self.cached_indices_file, "a") as f:
            f.write(f"{example_index}\n")

    def sync_lazy_cache(self, example_value: tuple[int, list[Any]], *input_values):
        example_index, _ = example_value
        cached_index = self._get_cached_index_if_cached(example_index)
        if cached_index is not None:
            output = self.load_from_cache(cached_index)
            yield output[0] if len(self.outputs) == 1 else output
            return
        output = [None] * len(self.outputs)
        if inspect.isgeneratorfunction(self.fn):
            fn = self.fn
        else:
            fn = utils.sync_fn_to_generator(self.fn)
        for output in fn(*input_values):
            output = client_utils.synchronize_async(self._postprocess_output, output)
            yield output[0] if len(self.outputs) == 1 else output
        self.cache_logger.flag(output)
        with open(self.cached_indices_file, "a") as f:
            f.write(f"{example_index}\n")

    async def cache(self) -> None:
        """
        Caches examples so that their predictions can be shown immediately.
        """
        blocks_config = get_blocks_context()
        if blocks_config is None or Context.root_block is None:
            raise ValueError("Cannot cache examples if not in a Blocks context")
        if Path(self.cached_file).exists():
            print(
                f"Using cache from '{utils.abspath(self.cached_folder)}' directory. If method or examples have changed since last caching, delete this folder to clear cache.\n"
            )
        else:
            print(f"Caching examples at: '{utils.abspath(self.cached_folder)}'")
            self.cache_logger.setup(self.outputs, self.cached_folder)
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
            from gradio.events import EventListenerMethod

            _, fn_index = blocks_config.set_event_trigger(
                [EventListenerMethod(Context.root_block, "load")],
                fn=fn,
                inputs=self.inputs_with_examples,  # type: ignore
                outputs=self.outputs,  # type: ignore
                preprocess=self.preprocess and not self._api_mode,
                postprocess=self.postprocess and not self._api_mode,
                batch=self.batch,
            )

            if self.outputs is None:
                raise ValueError("self.outputs is missing")
            for i, example in enumerate(self.examples):
                print(f"Caching example {i + 1}/{len(self.examples)}")
                processed_input = self._get_processed_example(example)
                if self.batch:
                    processed_input = [[value] for value in processed_input]
                with utils.MatplotlibBackendMananger():
                    prediction = await Context.root_block.process_api(
                        block_fn=blocks_config.fns[fn_index],
                        inputs=processed_input,
                        request=None,
                    )
                output = prediction["data"]
                if len(generated_values):
                    output = merge_generated_values_into_output(
                        self.outputs, generated_values, output
                    )
                if self.batch:
                    output = [value[0] for value in output]
                self.cache_logger.flag(output)
            # Remove the "fake_event" to prevent bugs in loading interfaces from spaces
            blocks_config.fns.pop(fn_index)

        # Remove the original load_input_event and replace it with one that
        # also populates the input. We do it this way to to allow the cache()
        # method to be called independently of the create() method
        blocks_config.fns.pop(self.load_input_event["id"])

        def load_example(example_tuple):
            example_id, example_value = example_tuple
            processed_example = self._get_processed_example(
                example_value
            ) + self.load_from_cache(example_id)
            return utils.resolve_singleton(processed_example)

        self.cache_event = self.load_input_event = self.dataset.click(
            load_example,
            inputs=[self.dataset],
            outputs=self.inputs_with_examples + self.outputs,  # type: ignore
            show_progress="hidden",
            postprocess=False,
            queue=False,
            api_name=self.api_name,
            show_api=False,
        )

    def load_from_cache(self, example_id: int) -> list[Any]:
        """Loads a particular cached example for the interface.
        Parameters:
            example_id: The id of the example to process (zero-indexed).
        """
        with open(self.cached_file, encoding="utf-8") as cache:
            examples = list(csv.reader(cache))
        example = examples[example_id + 1]  # +1 to adjust for header
        output = []
        if self.outputs is None:
            raise ValueError("self.outputs is missing")
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
                if not utils.is_prop_update(value_as_dict):
                    raise TypeError("value wasn't an update")  # caught below
                output.append(value_as_dict)
            except (ValueError, TypeError, SyntaxError):
                output.append(component.read_from_flag(value_to_use))
        return output


def merge_generated_values_into_output(
    components: Sequence[Component], generated_values: list, output: list
):
    from gradio.components.base import StreamingOutput

    for output_index, output_component in enumerate(components):
        if isinstance(output_component, StreamingOutput) and output_component.streaming:
            binary_chunks = []
            for i, chunk in enumerate(generated_values):
                if len(components) > 1:
                    chunk = chunk[output_index]
                processed_chunk = output_component.postprocess(chunk)
                if isinstance(processed_chunk, (GradioModel, GradioRootModel)):
                    processed_chunk = processed_chunk.model_dump()
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
                "path": temp_file.name,
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
    """

    def __init__(
        self,
        track_tqdm: bool = False,
    ):
        """
        Parameters:
            track_tqdm: If True, the Progress object will track any tqdm.tqdm iterations with the tqdm library in the function.
        """
        if track_tqdm:
            patch_tqdm()
        self.track_tqdm = track_tqdm
        self.iterables: list[TrackedIterable] = []

    def __len__(self):
        return self.iterables[-1].length

    def __iter__(self):
        return self

    def __next__(self):
        """
        Updates progress tracker with next item in iterable.
        """
        callback = self._progress_callback()
        if callback:
            current_iterable = self.iterables[-1]
            while (
                not hasattr(current_iterable.iterable, "__next__")
                and len(self.iterables) > 0
            ):
                current_iterable = self.iterables.pop()
            callback(self.iterables)
            if current_iterable.index is None:
                raise IndexError("Index not set.")
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
        callback = self._progress_callback()
        if callback:
            if isinstance(progress, tuple):
                index, total = progress
                progress = None
            else:
                index = None
            callback(
                self.iterables
                + [TrackedIterable(None, index, total, desc, unit, _tqdm, progress)]
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
        callback = self._progress_callback()
        if callback:
            if iterable is None:
                new_iterable = TrackedIterable(None, 0, total, desc, unit, _tqdm)
                self.iterables.append(new_iterable)
                callback(self.iterables)
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
        callback = self._progress_callback()
        if callback and len(self.iterables) > 0:
            current_iterable = self.iterables[-1]
            if current_iterable.index is None:
                raise IndexError("Index not set.")
            current_iterable.index += n
            callback(self.iterables)
        else:
            return

    def close(self, _tqdm):
        """
        Removes iterable with given _tqdm.
        """
        callback = self._progress_callback()
        if callback:
            for i in range(len(self.iterables)):
                if id(self.iterables[i]._tqdm) == id(_tqdm):
                    self.iterables.pop(i)
                    break
            callback(self.iterables)
        else:
            return

    @staticmethod
    def _progress_callback():
        blocks = LocalContext.blocks.get()
        event_id = LocalContext.event_id.get()
        if not (blocks and event_id):
            return None
        return partial(blocks._queue.set_progress, event_id)


def patch_tqdm() -> None:
    try:
        _tqdm = __import__("tqdm")
    except ModuleNotFoundError:
        return

    def init_tqdm(
        self, iterable=None, desc=None, total=None, unit="steps", *args, **kwargs
    ):
        self._progress = LocalContext.progress.get()
        if self._progress is not None:
            self._progress.tqdm(iterable, desc, total, unit, _tqdm=self)
            kwargs["file"] = open(os.devnull, "w")  # noqa: SIM115
        self.__init__orig__(iterable, desc, total, *args, unit=unit, **kwargs)

    def iter_tqdm(self):
        if self._progress is not None:
            return self._progress
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

    # Backup
    if not hasattr(_tqdm.tqdm, "__init__orig__"):
        _tqdm.tqdm.__init__orig__ = _tqdm.tqdm.__init__
    if not hasattr(_tqdm.tqdm, "__update__orig__"):
        _tqdm.tqdm.__update__orig__ = _tqdm.tqdm.update
    if not hasattr(_tqdm.tqdm, "__close__orig__"):
        _tqdm.tqdm.__close__orig__ = _tqdm.tqdm.close
    if not hasattr(_tqdm.tqdm, "__exit__orig__"):
        _tqdm.tqdm.__exit__orig__ = _tqdm.tqdm.__exit__
    if not hasattr(_tqdm.tqdm, "__iter__orig__"):
        _tqdm.tqdm.__iter__orig__ = _tqdm.tqdm.__iter__

    # Patch
    _tqdm.tqdm.__init__ = init_tqdm
    _tqdm.tqdm.update = update_tqdm
    _tqdm.tqdm.close = close_tqdm
    _tqdm.tqdm.__exit__ = exit_tqdm
    _tqdm.tqdm.__iter__ = iter_tqdm

    if hasattr(_tqdm, "auto") and hasattr(_tqdm.auto, "tqdm"):
        _tqdm.auto.tqdm = _tqdm.tqdm


def create_tracker(fn, track_tqdm):
    progress = Progress(track_tqdm=track_tqdm)
    if not track_tqdm:
        return progress, fn
    return progress, utils.function_wrapper(
        f=fn,
        before_fn=LocalContext.progress.set,
        before_args=(progress,),
        after_fn=LocalContext.progress.set,
        after_args=(None,),
    )


def special_args(
    fn: Callable,
    inputs: list[Any] | None = None,
    request: routes.Request | None = None,
    event_data: EventData | None = None,
) -> tuple[list, int | None, int | None]:
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
    try:
        signature = inspect.signature(fn)
    except ValueError:
        return inputs or [], None, None
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
        elif type_hint in (routes.Request, Optional[routes.Request]):
            if inputs is not None:
                inputs.insert(i, request)
        elif type_hint in (
            # Note: "OAuthProfile | None" is equals to Optional[OAuthProfile] in Python
            #       => it is automatically handled as well by the above condition
            #       (adding explicit "OAuthProfile | None" would break in Python3.9)
            #       (same for "OAuthToken")
            Optional[oauth.OAuthProfile],
            Optional[oauth.OAuthToken],
            oauth.OAuthProfile,
            oauth.OAuthToken,
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

                # Inject user profile
                if type_hint in (Optional[oauth.OAuthProfile], oauth.OAuthProfile):
                    oauth_profile = (
                        session["oauth_info"]["userinfo"]
                        if "oauth_info" in session
                        else None
                    )
                    if oauth_profile is not None:
                        oauth_profile = oauth.OAuthProfile(oauth_profile)
                    elif type_hint == oauth.OAuthProfile:
                        raise Error(
                            "This action requires a logged in user. Please sign in and retry."
                        )
                    inputs.insert(i, oauth_profile)

                # Inject user token
                elif type_hint in (Optional[oauth.OAuthToken], oauth.OAuthToken):
                    oauth_info = session.get("oauth_info", None)
                    oauth_token = (
                        oauth.OAuthToken(
                            token=oauth_info["access_token"],
                            scope=oauth_info["scope"],
                            expires_at=oauth_info["expires_at"],
                        )
                        if oauth_info is not None
                        else None
                    )
                    if oauth_token is None and type_hint == oauth.OAuthToken:
                        raise Error(
                            "This action requires a logged in user. Please sign in and retry."
                        )
                    inputs.insert(i, oauth_token)
        elif (
            type_hint
            and inspect.isclass(type_hint)
            and issubclass(type_hint, EventData)
        ):
            event_data_index = i
            if inputs is not None and event_data is not None:
                processing_utils.check_all_files_in_cache(event_data._data)
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


def update(
    elem_id: str | None = None,
    elem_classes: list[str] | str | None = None,
    visible: bool | None = None,
    **kwargs: Any,
) -> dict[str, Any]:
    """
    Updates a component's properties. When a function passed into a Gradio Interface or a Blocks events returns a value, it typically updates the value of the output component. But it is also possible to update the *properties* of an output component (such as the number of lines of a `Textbox` or the visibility of an `Row`) by returning a component and passing in the parameters to update in the constructor of the component. Alternatively, you can return `gr.update(...)` with any arbitrary parameters to update. (This is useful as a shorthand or if the same function can be called with different components to update.)

    Parameters:
        elem_id: Use this to update the id of the component in the HTML DOM
        elem_classes: Use this to update the classes of the component in the HTML DOM
        visible: Use this to update the visibility of the component
        kwargs: Any other keyword arguments to update the component's properties.
    Example:
        import gradio as gr
        with gr.Blocks() as demo:
            radio = gr.Radio([1, 2, 4], label="Set the value of the number")
            number = gr.Number(value=2, interactive=True)
            radio.change(fn=lambda value: gr.update(value=value), inputs=radio, outputs=number)
        demo.launch()
    """
    kwargs["__type__"] = "update"
    if elem_id is not None:
        kwargs["elem_id"] = elem_id
    if elem_classes is not None:
        kwargs["elem_classes"] = elem_classes
    if visible is not None:
        kwargs["visible"] = visible
    return kwargs


def skip() -> dict:
    return {"__type__": "update"}


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
    import matplotlib.pyplot as plt
    from matplotlib.animation import FuncAnimation

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
        if n < 1:
            raise ValueError("Must have at least one stop in gradient")
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
            anim = FuncAnimation(
                fig,  # type: ignore
                _animate,  # type: ignore
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


def log_message(
    message: str,
    level: Literal["info", "warning"] = "info",
    duration: float | None = 10,
    visible: bool = True,
):
    from gradio.context import LocalContext

    blocks = LocalContext.blocks.get()
    event_id = LocalContext.event_id.get()
    if blocks is None or event_id is None:
        # Function called outside of Gradio if blocks is None
        # Or from /api/predict if event_id is None
        if level == "info":
            print(message)
        elif level == "warning":
            warnings.warn(message)
        return
    blocks._queue.log_message(
        event_id=event_id, log=message, level=level, duration=duration, visible=visible
    )


@document(documentation_group="modals")
def Warning(  # noqa: N802
    message: str = "Warning issued.", duration: float | None = 10, visible: bool = True
):
    """
    This function allows you to pass custom warning messages to the user. You can do so simply by writing `gr.Warning('message here')` in your function, and when that line is executed the custom message will appear in a modal on the demo. The modal is yellow by default and has the heading: "Warning." Queue must be enabled for this behavior; otherwise, the warning will be printed to the console using the `warnings` library.
    Demos: blocks_chained_events
    Parameters:
        message: The warning message to be displayed to the user. Can be HTML, which will be rendered in the modal.
        duration: The duration in seconds that the warning message should be displayed for. If None or 0, the message will be displayed indefinitely until the user closes it.
        visible: Whether the error message should be displayed in the UI.
    Example:
        import gradio as gr
        def hello_world():
            gr.Warning('This is a warning message.')
            return "hello world"
        with gr.Blocks() as demo:
            md = gr.Markdown()
            demo.load(hello_world, inputs=None, outputs=[md])
        demo.queue().launch()
    """
    log_message(message, level="warning", duration=duration, visible=visible)


@document(documentation_group="modals")
def Info(  # noqa: N802
    message: str = "Info issued.",
    duration: float | None = 10,
    visible: bool = True,
):
    """
    This function allows you to pass custom info messages to the user. You can do so simply by writing `gr.Info('message here')` in your function, and when that line is executed the custom message will appear in a modal on the demo. The modal is gray by default and has the heading: "Info." Queue must be enabled for this behavior; otherwise, the message will be printed to the console.
    Demos: blocks_chained_events
    Parameters:
        message: The info message to be displayed to the user. Can be HTML, which will be rendered in the modal.
        duration: The duration in seconds that the info message should be displayed for. If None or 0, the message will be displayed indefinitely until the user closes it.
        visible: Whether the error message should be displayed in the UI.
    Example:
        import gradio as gr
        def hello_world():
            gr.Info('This is some info.')
            return "hello world"
        with gr.Blocks() as demo:
            md = gr.Markdown()
            demo.load(hello_world, inputs=None, outputs=[md])
        demo.queue().launch()
    """
    log_message(message, level="info", duration=duration, visible=visible)
