"""gr.Audio() component."""

from __future__ import annotations

import warnings
from pathlib import Path
from typing import Any, Callable, Literal

import numpy as np
import requests
from gradio_client import utils as client_utils
from gradio_client.documentation import document, set_documentation_group

from gradio import processing_utils, utils
from gradio.components.base import Component, StreamingInput, StreamingOutput, _Keywords
from gradio.data_classes import FileData
from gradio.events import Events

set_documentation_group("component")


class AudioInputData(FileData):
    crop_min: int = 0
    crop_max: int = 100


@document()
class Audio(
    StreamingInput,
    StreamingOutput,
    Component,
):
    """
    Creates an audio component that can be used to upload/record audio (as an input) or display audio (as an output).
    Preprocessing: passes the uploaded audio as a {Tuple(int, numpy.array)} corresponding to (sample rate in Hz, audio data as a 16-bit int array whose values range from -32768 to 32767), or as a {str} filepath, depending on `type`.
    Postprocessing: expects a {Tuple(int, numpy.array)} corresponding to (sample rate in Hz, audio data as a float or int numpy array) or as a {str} or {pathlib.Path} filepath or URL to an audio file, or bytes for binary content (recommended for streaming). Note: When converting audio data from float format to WAV, the audio is normalized by its peak value to avoid distortion or clipping in the resulting audio.
    Examples-format: a {str} filepath to a local file that contains audio.
    Demos: main_note, generate_tone, reverse_audio
    Guides: real-time-speech-recognition
    """

    EVENTS = [
        Events.stream,
        Events.change,
        Events.clear,
        Events.play,
        Events.pause,
        Events.stop,
        Events.pause,
        Events.start_recording,
        Events.stop_recording,
        Events.upload,
    ]

    data_model = FileData

    def __init__(
        self,
        value: str | Path | tuple[int, np.ndarray] | Callable | None = None,
        *,
        source: Literal["upload", "microphone"] | None = None,
        type: Literal["numpy", "filepath"] = "numpy",
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        format: Literal["wav", "mp3"] = "wav",
        autoplay: bool = False,
        show_download_button=True,
        show_share_button: bool | None = None,
        show_edit_button: bool | None = True,
        **kwargs,
    ):
        """
        Parameters:
            value: A path, URL, or [sample_rate, numpy array] tuple (sample rate in Hz, audio data as a float or int numpy array) for the default value that Audio component is going to take. If callable, the function will be called whenever the app loads to set the initial value of the component.
            source: Source of audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input.
            type: The format the audio file is converted to before being passed into the prediction function. "numpy" converts the audio to a tuple consisting of: (int sample rate, numpy.array for the data), "filepath" passes a str path to a temporary file containing the audio.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload and edit a audio file; if False, can only be used to play audio. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            streaming: If set to True when used in a `live` interface as an input, will automatically stream webcam feed. When used set as an output, takes audio chunks yield from the backend and combines them into one streaming audio output.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            format: The file format to save audio files. Either 'wav' or 'mp3'. wav files are lossless but will tend to be larger files. mp3 files tend to be smaller. Default is wav. Applies both when this component is used as an input (when `type` is "format") and when this component is used as an output.
            autoplay: Whether to automatically play the audio when the component is used as an output. Note: browsers will not autoplay audio files if the user has not interacted with the page yet.
            show_download_button: If True, will show a download button in the corner of the component for saving audio. If False, icon does not appear.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_edit_button: If True, will show an edit icon in the corner of the component that allows user to edit the audio. If False, icon does not appear. Default is True.
        """
        valid_sources = ["upload", "microphone"]
        source = source if source else ("microphone" if streaming else "upload")
        if source not in valid_sources:
            raise ValueError(
                f"Invalid value for parameter `source`: {source}. Please choose from one of: {valid_sources}"
            )
        self.source = source
        valid_types = ["numpy", "filepath"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {valid_types}"
            )
        self.type = type
        self.streaming = streaming
        if streaming and source == "upload":
            raise ValueError(
                "Audio streaming only available if source is 'microphone'."
            )
        self.format = format
        self.autoplay = autoplay
        self.show_download_button = show_download_button
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        self.show_edit_button = show_edit_button
        super().__init__(
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

    def example_inputs(self) -> Any:
        return "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav"

    @staticmethod
    def update(
        value: Any | Literal[_Keywords.NO_VALUE] | None = _Keywords.NO_VALUE,
        source: Literal["upload", "microphone"] | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool | None = None,
        visible: bool | None = None,
        autoplay: bool | None = None,
        show_download_button: bool | None = None,
        show_share_button: bool | None = None,
        show_edit_button: bool | None = None,
    ):
        warnings.warn(
            "Using the update method is deprecated. Simply return a new object instead, e.g. `return gr.Audio(...)` instead of `return gr.Audio.update(...)`."
        )
        return {
            "source": source,
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "autoplay": autoplay,
            "show_download_button": show_download_button,
            "show_share_button": show_share_button,
            "show_edit_button": show_edit_button,
            "__type__": "update",
        }

    def preprocess(
        self, x: dict[str, Any] | None
    ) -> tuple[int, np.ndarray] | str | None:
        """
        Parameters:
            x: dictionary with keys "name", "data", "is_file", "crop_min", "crop_max".
        Returns:
            audio in requested format
        """
        if x is None:
            return x

        payload: AudioInputData = AudioInputData(**x)
        assert payload.name

        # Need a unique name for the file to avoid re-using the same audio file if
        # a user submits the same audio file twice, but with different crop min/max.
        temp_file_path = Path(payload.name)
        output_file_name = str(
            temp_file_path.with_name(
                f"{temp_file_path.stem}-{payload.crop_min}-{payload.crop_max}{temp_file_path.suffix}"
            )
        )

        sample_rate, data = processing_utils.audio_from_file(
            temp_file_path, crop_min=payload.crop_min, crop_max=payload.crop_max
        )

        if self.type == "numpy":
            return sample_rate, data
        elif self.type == "filepath":
            output_file = str(Path(output_file_name).with_suffix(f".{self.format}"))
            processing_utils.audio_to_file(
                sample_rate, data, output_file, format=self.format
            )
            return output_file
        else:
            raise ValueError(
                "Unknown type: "
                + str(self.type)
                + ". Please choose from: 'numpy', 'filepath'."
            )

    def postprocess(
        self, y: tuple[int, np.ndarray] | str | Path | bytes | None
    ) -> FileData | None | bytes:
        """
        Parameters:
            y: audio data in either of the following formats: a tuple of (sample_rate, data), or a string filepath or URL to an audio file, or None.
        Returns:
            base64 url data
        """
        if y is None:
            return None
        if isinstance(y, bytes):
            if self.streaming:
                return y
            file_path = processing_utils.save_bytes_to_cache(
                y, "audio", cache_dir=self.GRADIO_CACHE
            )
        elif isinstance(y, tuple):
            sample_rate, data = y
            file_path = processing_utils.save_audio_to_cache(
                data, sample_rate, format=self.format, cache_dir=self.GRADIO_CACHE
            )
        else:
            if not isinstance(y, (str, Path)):
                raise ValueError(f"Cannot process {y} as Audio")
            file_path = str(y)
        return FileData(**{"name": file_path, "data": None, "is_file": True})

    def stream_output(
        self, y, output_id: str, first_chunk: bool
    ) -> tuple[bytes | None, Any]:
        output_file = {
            "name": output_id,
            "is_stream": True,
            "is_file": False,
        }
        if y is None:
            return None, output_file
        if isinstance(y, bytes):
            return y, output_file
        if client_utils.is_http_url_like(y["name"]):
            response = requests.get(y["name"])
            binary_data = response.content
        else:
            output_file["orig_name"] = y["orig_name"]
            file_path = y["name"]
            is_wav = file_path.endswith(".wav")
            with open(file_path, "rb") as f:
                binary_data = f.read()
            if is_wav:
                # strip length information from first chunk header, remove headers entirely from subsequent chunks
                if first_chunk:
                    binary_data = (
                        binary_data[:4] + b"\xFF\xFF\xFF\xFF" + binary_data[8:]
                    )
                    binary_data = (
                        binary_data[:40] + b"\xFF\xFF\xFF\xFF" + binary_data[44:]
                    )
                else:
                    binary_data = binary_data[44:]
        return binary_data, output_file

    def as_example(self, input_data: str | None) -> str:
        return Path(input_data).name if input_data else ""

    def check_streamable(self):
        if self.source != "microphone" and self.streaming:
            raise ValueError(
                "Audio streaming only available if source is 'microphone'."
            )
