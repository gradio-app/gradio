"""
Defines helper methods useful for loading and caching Interface examples.
"""
from __future__ import annotations

import ast
import csv
import inspect
import os
import subprocess
import tempfile
import threading
import warnings
from pathlib import Path
from typing import TYPE_CHECKING, Any, Callable, Iterable, List, Optional, Tuple

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import PIL

from gradio import processing_utils, utils
from gradio.context import Context
from gradio.documentation import document, set_documentation_group
from gradio.flagging import CSVLogger

if TYPE_CHECKING:  # Only import for type checking (to avoid circular imports).
    from gradio.components import IOComponent

CACHED_FOLDER = "gradio_cached_examples"
LOG_FILE = "log.csv"

set_documentation_group("helpers")


def create_examples(
    examples: List[Any] | List[List[Any]] | str,
    inputs: IOComponent | List[IOComponent],
    outputs: IOComponent | List[IOComponent] | None = None,
    fn: Callable | None = None,
    cache_examples: bool = False,
    examples_per_page: int = 10,
    _api_mode: bool = False,
    label: str | None = None,
    elem_id: str | None = None,
    run_on_click: bool = False,
    preprocess: bool = True,
    postprocess: bool = True,
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
        batch=batch,
        _initiated_directly=False,
    )
    utils.synchronize_async(examples_obj.create)
    return examples_obj


@document()
class Examples:
    """
    This class is a wrapper over the Dataset component and can be used to create Examples
    for Blocks / Interfaces. Populates the Dataset component with examples and
    assigns event listener so that clicking on an example populates the input/output
    components. Optionally handles example caching for fast inference.

    Demos: blocks_inputs, fake_gan
    Guides: more_on_examples_and_flagging, using_hugging_face_integrations, image_classification_in_pytorch, image_classification_in_tensorflow, image_classification_with_vision_transformers, create_your_own_friends_with_a_gan
    """

    def __init__(
        self,
        examples: List[Any] | List[List[Any]] | str,
        inputs: IOComponent | List[IOComponent],
        outputs: Optional[IOComponent | List[IOComponent]] = None,
        fn: Optional[Callable] = None,
        cache_examples: bool = False,
        examples_per_page: int = 10,
        _api_mode: bool = False,
        label: str = "Examples",
        elem_id: Optional[str] = None,
        run_on_click: bool = False,
        preprocess: bool = True,
        postprocess: bool = True,
        batch: bool = False,
        _initiated_directly: bool = True,
    ):
        """
        Parameters:
            examples: example inputs that can be clicked to populate specific components. Should be nested list, in which the outer list consists of samples and each inner list consists of an input corresponding to each input component. A string path to a directory of examples can also be provided but it should be within the directory with the python file running the gradio app. If there are multiple input components and a directory is provided, a log.csv file must be present in the directory to link corresponding inputs.
            inputs: the component or list of components corresponding to the examples
            outputs: optionally, provide the component or list of components corresponding to the output of the examples. Required if `cache` is True.
            fn: optionally, provide the function to run to generate the outputs corresponding to the examples. Required if `cache` is True.
            cache_examples: if True, caches examples for fast runtime. If True, then `fn` and `outputs` need to be provided
            examples_per_page: how many examples to show per page.
            label: the label to use for the examples component (by default, "Examples")
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM.
            run_on_click: if cache_examples is False, clicking on an example does not run the function when an example is clicked. Set this to True to run the function when an example is clicked. Has no effect if cache_examples is True.
            preprocess: if True, preprocesses the example input before running the prediction function and caching the output. Only applies if cache_examples is True.
            postprocess: if True, postprocesses the example output after running the prediction function and before caching. Only applies if cache_examples is True.
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
        if not isinstance(outputs, list):
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
            if not os.path.exists(examples):
                raise FileNotFoundError(
                    "Could not find examples directory: " + examples
                )
            working_directory = examples
            if not os.path.exists(os.path.join(examples, LOG_FILE)):
                if len(inputs) == 1:
                    examples = [[e] for e in os.listdir(examples)]
                else:
                    raise FileNotFoundError(
                        "Could not find log file (required for multiple inputs): "
                        + LOG_FILE
                    )
            else:
                with open(os.path.join(examples, LOG_FILE)) as logs:
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
                if not (example_for_input is None):
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
        self.outputs = outputs
        self.fn = fn
        self.cache_examples = cache_examples
        self._api_mode = _api_mode
        self.preprocess = preprocess
        self.postprocess = postprocess
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

        from gradio.components import Dataset

        with utils.set_directory(working_directory):
            self.dataset = Dataset(
                components=inputs_with_examples,
                samples=non_none_examples,
                type="index",
                label=label,
                samples_per_page=examples_per_page,
                elem_id=elem_id,
            )

        self.cached_folder = os.path.join(CACHED_FOLDER, str(self.dataset._id))
        self.cached_file = os.path.join(self.cached_folder, "log.csv")
        self.cache_examples = cache_examples
        self.run_on_click = run_on_click

    async def create(self) -> None:
        """Caches the examples if self.cache_examples is True and creates the Dataset
        component to hold the examples"""

        async def load_example(example_id):
            if self.cache_examples:
                processed_example = self.non_none_processed_examples[
                    example_id
                ] + await self.load_from_cache(example_id)
            else:
                processed_example = self.non_none_processed_examples[example_id]
            return utils.resolve_singleton(processed_example)

        if Context.root_block:
            self.dataset.click(
                load_example,
                inputs=[self.dataset],
                outputs=self.inputs_with_examples
                + (self.outputs if self.cache_examples else []),
                postprocess=False,
                queue=False,
            )
            if self.run_on_click and not self.cache_examples:
                self.dataset.click(
                    self.fn,
                    inputs=self.inputs,
                    outputs=self.outputs,
                )

        if self.cache_examples:
            await self.cache()

    async def cache(self) -> None:
        """
        Caches all of the examples so that their predictions can be shown immediately.
        """
        if os.path.exists(self.cached_file):
            print(
                f"Using cache from '{os.path.abspath(self.cached_folder)}' directory. If method or examples have changed since last caching, delete this folder to clear cache."
            )
        else:
            if Context.root_block is None:
                raise ValueError("Cannot cache examples if not in a Blocks context")

            print(f"Caching examples at: '{os.path.abspath(self.cached_file)}'")
            cache_logger = CSVLogger()

            # create a fake dependency to process the examples and get the predictions
            dependency = Context.root_block.set_event_trigger(
                event_name="fake_event",
                fn=self.fn,
                inputs=self.inputs_with_examples,
                outputs=self.outputs,
                preprocess=self.preprocess and not self._api_mode,
                postprocess=self.postprocess and not self._api_mode,
                batch=self.batch,
            )

            fn_index = Context.root_block.dependencies.index(dependency)
            cache_logger.setup(self.outputs, self.cached_folder)
            for example_id, _ in enumerate(self.examples):
                processed_input = self.processed_examples[example_id]
                if self.batch:
                    processed_input = [[value] for value in processed_input]
                prediction = await Context.root_block.process_api(
                    fn_index=fn_index, inputs=processed_input, request=None
                )
                output = prediction["data"]
                if self.batch:
                    output = [value[0] for value in output]
                cache_logger.flag(output)
            # Remove the "fake_event" to prevent bugs in loading interfaces from spaces
            Context.root_block.dependencies.remove(dependency)
            Context.root_block.fns.pop(fn_index)

    async def load_from_cache(self, example_id: int) -> List[Any]:
        """Loads a particular cached example for the interface.
        Parameters:
            example_id: The id of the example to process (zero-indexed).
        """
        with open(self.cached_file) as cache:
            examples = list(csv.reader(cache))
        example = examples[example_id + 1]  # +1 to adjust for header
        output = []
        for component, value in zip(self.outputs, example):
            try:
                value_as_dict = ast.literal_eval(value)
                assert utils.is_update(value_as_dict)
                output.append(value_as_dict)
            except (ValueError, TypeError, SyntaxError, AssertionError):
                output.append(component.serialize(value, self.cached_folder))
        return output


class TrackedIterable:
    def __init__(
        self,
        iterable: Iterable,
        index: int,
        length: int | None,
        desc: str | None,
        unit: str | None,
        _tqdm=None,
        progress: float = None,
    ) -> None:
        self.iterable = iterable
        self.index = index
        self.length = length
        self.desc = desc
        self.unit = unit
        self._tqdm = _tqdm
        self.progress = progress


@document("__call__", "track")
class Progress(Iterable):
    """
    The Progress class provides a custom progress tracker that is used in a function signature.
    To attach a Progress tracker to a function, simply add a parameter right after the input parameters that has a default value set to `gradio.Progress()`.
    The Progress tracker can then be updated in the function by calling the Progress object or using the `tqdm` method on an Iterable.
    The Progress tracker is currently only available with `queue()`.
    Example:
        import gradio as gr
        import time
        def my_function(x, progress=gr.Progress()):
            progress(0, desc="Starting...")
            time.sleep(1)
            for i in progress.track(range(100)):
                time.sleep(0.1)
            return x
        gr.Interface(my_function, gr.Textbox(), gr.Textbox()).queue().launch()
    Demos: progress
    """

    def __init__(
        self,
        track_tqdm: bool = False,
        _active: bool = False,
        _callback: Callable = None,
        _event_id: str = None,
    ):
        """
        Parameters:
            track_tqdm: If True, the Progress object will track any iterations made with tqdm.tqdm in the function.
        """
        self.track_tqdm = track_tqdm
        self._active = _active
        self._callback = _callback
        self._event_id = _event_id
        self.iterables: List[TrackedIterable] = []

    def __len__(self):
        return self.iterables[-1].length

    def __iter__(self):
        return self

    def __next__(self):
        """
        Updates progress tracker with next item in iterable.
        """
        if self._active:
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
            current_iterable.index += 1
            try:
                return next(current_iterable.iterable)
            except StopIteration:
                self.iterables.pop()
                raise StopIteration
        else:
            return self

    def __call__(
        self,
        progress: float | Tuple[int, int | None] | None,
        desc: str | None = None,
        total: float | None = None,
        unit: str = "steps",
        _tqdm=None,
    ):
        """
        Updates progress tracker with progress and message text.
        Parameters:
            progress: If float, should be between 0 and 1 representing completion. If Tuple, first number represents steps completed, and second value represents total steps or None if unknown. If None, hides progress bar.
            desc: description to display.
        """
        if self._active:
            self._callback(
                event_id=self._event_id,
                iterables=self.iterables
                + [TrackedIterable(None, 0, total, desc, unit, _tqdm, progress)],
            )
        else:
            return progress

    def track(
        self,
        iterable: Iterable | None,
        desc: str = None,
        total: float = None,
        unit: str = "steps",
        _tqdm=None,
        *args,
        **kwargs,
    ):
        """
        Attaches progress tracker to iterable.
        Parameters:
            iterable: iterable to attach progress tracker to.
            desc: description to display.

        """
        if iterable is None:
            new_iterable = TrackedIterable(None, 0, total, desc, unit, _tqdm)
            self.iterables.append(new_iterable)
            self._callback(event_id=self._event_id, iterables=self.iterables)
            return
        length = len(iterable) if hasattr(iterable, "__len__") else None
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
        if self._active and len(self.iterables) > 0:
            current_iterable = self.iterables[-1]
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
        if self._active:
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


def create_tracker(block_parent, event_id, fn, track_tqdm):

    progress = Progress(
        _active=True, _callback=block_parent._queue.set_progress, _event_id=event_id
    )
    if not track_tqdm:
        return progress, fn

    _tqdm = __import__("tqdm")
    if not hasattr(block_parent, "_progress_tracker_per_thread"):
        block_parent._progress_tracker_per_thread = {}

    def init_tqdm(self, iterable=None, desc=None, *args, **kwargs):
        self._progress = block_parent._progress_tracker_per_thread[
            threading.get_ident()
        ]
        self._progress.event_id = event_id
        self._progress.track(iterable, desc, _tqdm=self, *args, **kwargs)
        kwargs["file"] = open(os.devnull, "w")
        self.__init__orig__(iterable, desc, *args, **kwargs)

    def iter_tqdm(self):
        return self._progress

    def update_tqdm(self, n=1):
        self._progress.update(n)
        return self.__update__orig__(n)

    def close_tqdm(self):
        self._progress.close(self)
        return self.__close__orig__()

    def exit_tqdm(self, exc_type, exc_value, traceback):
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

    _tqdm.tqdm.__iter__ = iter_tqdm
    if hasattr(_tqdm, "auto") and hasattr(_tqdm.auto, "tqdm"):
        _tqdm.auto.tqdm = _tqdm.tqdm

    def tracked_fn(*args):
        thread_id = threading.get_ident()
        block_parent._progress_tracker_per_thread[thread_id] = progress
        fn(*args)
        del block_parent._progress_tracker_per_thread[thread_id]

    return progress, tracked_fn


def get_progress_tracker(fn: Callable, input_count: int):
    """
    Checks if function has a progress tracker positioned after input parameters.
    Parameters:
        fn: function to check.
        input_count: number of input parameters.
    Returns:
        Progress tracker or None.
    """
    signature = inspect.signature(fn)
    params = list(signature.parameters.values())
    if len(params) > input_count and isinstance(params[input_count].default, Progress):
        return params[input_count].default
    return None


@document()
def update(**kwargs) -> dict:
    """
    Updates component properties.
    This is a shorthand for using the update method on a component.
    For example, rather than using gr.Number.update(...) you can just use gr.update(...).
    Note that your editor's autocompletion will suggest proper parameters
    if you use the update method on the component.

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
    audio: str | Tuple[int, np.ndarray],
    *,
    bg_color: str = "#f3f4f6",
    bg_image: str = None,
    fg_alpha: float = 0.75,
    bars_color: str | Tuple[str, str] = ("#fbbf24", "#ea580c"),
    bar_count: int = 50,
    bar_width: float = 0.6,
):
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
    Returns:
        A filepath to the output video.
    """
    if isinstance(audio, str):
        audio_file = audio
        audio = processing_utils.audio_from_file(audio)
    else:
        tmp_wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        processing_utils.audio_to_file(audio[0], audio[1], tmp_wav.name)
        audio_file = tmp_wav.name
    duration = round(len(audio[1]) / audio[0], 4)

    # Helper methods to create waveform
    def hex_to_RGB(hex_str):
        return [int(hex_str[i : i + 2], 16) for i in range(1, 6, 2)]

    def get_color_gradient(c1, c2, n):
        assert n > 1
        c1_rgb = np.array(hex_to_RGB(c1)) / 255
        c2_rgb = np.array(hex_to_RGB(c2)) / 255
        mix_pcts = [x / (n - 1) for x in range(n)]
        rgb_colors = [((1 - mix) * c1_rgb + (mix * c2_rgb)) for mix in mix_pcts]
        return [
            "#" + "".join([format(int(round(val * 255)), "02x") for val in item])
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

    matplotlib.use("Agg")
    plt.clf()
    # Plot waveform
    color = (
        bars_color
        if isinstance(bars_color, str)
        else get_color_gradient(bars_color[0], bars_color[1], bar_count)
    )
    plt.bar(
        np.arange(0, bar_count),
        samples * 2,
        bottom=(-1 * samples),
        width=bar_width,
        color=color,
    )
    plt.axis("off")
    plt.margins(x=0)
    tmp_img = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    savefig_kwargs = {"bbox_inches": "tight"}
    if bg_image is not None:
        savefig_kwargs["transparent"] = True
    else:
        savefig_kwargs["facecolor"] = bg_color
    plt.savefig(tmp_img.name, **savefig_kwargs)
    waveform_img = PIL.Image.open(tmp_img.name)
    waveform_img = waveform_img.resize((1000, 200))

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
                (waveform_width, 2 * int(bg_height * waveform_width / bg_width / 2))
            )
            bg_width, bg_height = bg_img.size
        composite_height = max(bg_height, waveform_height)
        composite = PIL.Image.new("RGBA", (waveform_width, composite_height), "#FFFFFF")
        composite.paste(bg_img, (0, composite_height - bg_height))
        composite.paste(
            waveform_img, (0, composite_height - waveform_height), waveform_img
        )
        composite.save(tmp_img.name)
        img_width, img_height = composite.size
    else:
        img_width, img_height = waveform_img.size
        waveform_img.save(tmp_img.name)

    # Convert waveform to video with ffmpeg
    output_mp4 = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)

    ffmpeg_cmd = f"""ffmpeg -loop 1 -i {tmp_img.name} -i {audio_file} -vf "color=c=#FFFFFF77:s={img_width}x{img_height}[bar];[0][bar]overlay=-w+(w/{duration})*t:H-h:shortest=1" -t {duration} -y {output_mp4.name}"""

    subprocess.call(ffmpeg_cmd, shell=True)
    return output_mp4.name
