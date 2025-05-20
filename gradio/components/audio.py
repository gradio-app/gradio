"""gr.Audio() component."""

from __future__ import annotations

import dataclasses
import io
import warnings
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import anyio
import httpx
import numpy as np
from gradio_client import handle_file
from gradio_client import utils as client_utils
from gradio_client.documentation import document
from pydub import AudioSegment

from gradio import processing_utils, utils, wasm_utils
from gradio.components.base import Component, StreamingInput, StreamingOutput
from gradio.data_classes import FileData, FileDataDict, MediaStreamChunk
from gradio.events import Events
from gradio.exceptions import Error
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


@document()
@dataclasses.dataclass
class WaveformOptions:
    """
    A dataclass for specifying options for the waveform display in the Audio component. An instance of this class can be passed into the `waveform_options` parameter of `gr.Audio`.
    Parameters:
        waveform_color: The color (as a hex string or valid CSS color) of the full waveform representing the amplitude of the audio. Defaults to a light gray color.
        waveform_progress_color: The color (as a hex string or valid CSS color) that the waveform fills with to as the audio plays. Defaults to the accent color.
        trim_region_color: The color (as a hex string or valid CSS color) of the trim region. Defaults to the accent color.
        show_recording_waveform: If True, shows a waveform when recording audio or playing audio. If False, uses the default browser audio players. For streamed audio, the default browser audio player is always used.
        show_controls: Deprecated and has no effect. Use `show_recording_waveform` instead.
        skip_length: The percentage (between 0 and 100) of the audio to skip when clicking on the skip forward / skip backward buttons.
        sample_rate: The output sample rate (in Hz) of the audio after editing.
    """

    waveform_color: str | None = None
    waveform_progress_color: str | None = None
    trim_region_color: str | None = None
    show_recording_waveform: bool = True
    show_controls: bool = False
    skip_length: int | float = 5
    sample_rate: int = 44100


@document()
class Audio(
    StreamingInput,
    StreamingOutput,
    Component,
):
    """
    Creates an audio component that can be used to upload/record audio (as an input) or display audio (as an output).
    Demos: generate_tone, reverse_audio
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
        Events.pause_recording,
        Events.stop_recording,
        Events.upload,
        Events.input,
    ]

    data_model = FileData

    def __init__(
        self,
        value: str | Path | tuple[int, np.ndarray] | Callable | None = None,
        *,
        sources: list[Literal["upload", "microphone"]]
        | Literal["upload", "microphone"]
        | None = None,
        type: Literal["numpy", "filepath"] = "numpy",
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        streaming: bool = False,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        format: Literal["wav", "mp3"] | None = None,
        autoplay: bool = False,
        show_download_button: bool | None = None,
        show_share_button: bool | None = None,
        editable: bool = True,
        min_length: int | None = None,
        max_length: int | None = None,
        waveform_options: WaveformOptions | dict | None = None,
        loop: bool = False,
        recording: bool = False,
    ):
        """
        Parameters:
            value: A path, URL, or [sample_rate, numpy array] tuple (sample rate in Hz, audio data as a float or int numpy array) for the default value that Audio component is going to take. If a function is provided, the function will be called each time the app loads to set the initial value of this component.
            sources: A list of sources permitted for audio. "upload" creates a box where user can drop an audio file, "microphone" creates a microphone input. The first element in the list will be used as the default source. If None, defaults to ["upload", "microphone"], or ["microphone"] if `streaming` is True.
            type: The format the audio file is converted to before being passed into the prediction function. "numpy" converts the audio to a tuple consisting of: (int sample rate, numpy.array for the data), "filepath" passes a str path to a temporary file containing the audio.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: Continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: Components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: Relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: Minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: If True, will allow users to upload and edit an audio file. If False, can only be used to play audio. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            streaming: If set to True when used in a `live` interface as an input, will automatically stream webcam feed. When used set as an output, takes audio chunks yield from the backend and combines them into one streaming audio output.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            format: the file extension with which to save audio files. Either 'wav' or 'mp3'. wav files are lossless but will tend to be larger files. mp3 files tend to be smaller. This parameter applies both when this component is used as an input (and `type` is "filepath") to determine which file format to convert user-provided audio to, and when this component is used as an output to determine the format of audio returned to the user. If None, no file format conversion is done and the audio is kept as is. In the case where output audio is returned from the prediction function as numpy array and no `format` is provided, it will be returned as a "wav" file.
            autoplay: Whether to automatically play the audio when the component is used as an output. Note: browsers will not autoplay audio files if the user has not interacted with the page yet.
            show_download_button: If True, will show a download button in the corner of the component for saving audio. If False, icon does not appear. By default, it will be True for output components and False for input components.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            editable: If True, allows users to manipulate the audio file if the component is interactive. Defaults to True.
            min_length: The minimum length of audio (in seconds) that the user can pass into the prediction function. If None, there is no minimum length.
            max_length: The maximum length of audio (in seconds) that the user can pass into the prediction function. If None, there is no maximum length.
            waveform_options: A dictionary of options for the waveform display. Options include: waveform_color (str), waveform_progress_color (str), show_controls (bool), skip_length (int), trim_region_color (str). Default is None, which uses the default values for these options. [See `gr.WaveformOptions` docs](#waveform-options).
            loop: If True, the audio will loop when it reaches the end and continue playing from the beginning.
            recording: If True, the audio component will be set to record audio from the microphone if the source is set to "microphone". Defaults to False.
        """
        valid_sources: list[Literal["upload", "microphone"]] = ["upload", "microphone"]
        if sources is None:
            self.sources = ["microphone"] if streaming else valid_sources
        elif isinstance(sources, str) and sources in valid_sources:
            self.sources = [sources]
        elif isinstance(sources, list):
            self.sources = sources
        else:
            raise ValueError(
                f"`sources` must be a list consisting of elements in {valid_sources}"
            )
        for source in self.sources:
            if source not in valid_sources:
                raise ValueError(
                    f"`sources` must a list consisting of elements in {valid_sources}"
                )
        valid_types = ["numpy", "filepath"]
        if type not in valid_types:
            raise ValueError(
                f"Invalid value for parameter `type`: {type}. Please choose from one of: {' '.join(valid_types)}"
            )
        self.type = type
        self.streaming = streaming
        if self.streaming and "microphone" not in self.sources:
            raise ValueError(
                "Audio streaming only available if sources includes 'microphone'."
            )
        valid_formats = ["wav", "mp3"]
        if format is not None and format.lower() not in valid_formats:
            raise ValueError(
                f"Invalid value for parameter `format`: {format}. Please choose from one of: {' '.join(valid_formats)}"
            )
        self.format = format and format.lower()
        self.autoplay = autoplay
        self.loop = loop
        self.show_download_button = show_download_button
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        self.editable = editable
        if waveform_options is None:
            self.waveform_options = WaveformOptions()
        elif isinstance(waveform_options, dict):
            self.waveform_options = WaveformOptions(**waveform_options)
        else:
            self.waveform_options = waveform_options
        if self.waveform_options.show_controls is not False:
            warnings.warn(
                "The `show_controls` parameter is deprecated and will be removed in a future release. Use `show_recording_waveform` instead."
            )
        self.min_length = min_length
        self.max_length = max_length
        self.recording = recording
        super().__init__(
            label=label,
            every=every,
            inputs=inputs,
            show_label=show_label,
            container=container,
            scale=scale,
            min_width=min_width,
            interactive=interactive,
            visible=visible,
            elem_id=elem_id,
            elem_classes=elem_classes,
            render=render,
            key=key,
            preserved_by_key=preserved_by_key,
            value=value,
        )
        self._value_description = (
            "a filepath to an audio file"
            if self.type == "filepath"
            else "a tuple of [sample_rate: int, data: np.ndarray] of audio data"
        )

    def example_payload(self) -> Any:
        return handle_file(
            "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav"
        )

    def example_value(self) -> Any:
        return "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav"

    def preprocess(
        self, payload: FileData | None
    ) -> str | tuple[int, np.ndarray] | None:
        """
        Parameters:
            payload: audio data as a FileData object, or None.
        Returns:
            passes audio as one of these formats (depending on `type`): a `str` filepath, or `tuple` of (sample rate in Hz, audio data as numpy array). If the latter, the audio data is a 16-bit `int` array whose values range from -32768 to 32767 and shape of the audio data array is (samples,) for mono audio or (samples, channels) for multi-channel audio.
        """
        if payload is None:
            return payload

        if not payload.path:
            raise ValueError("payload path missing")

        needs_conversion = False
        original_suffix = Path(payload.path).suffix.lower()
        if self.format is not None and original_suffix != f".{self.format}":
            needs_conversion = True

        if self.min_length is not None or self.max_length is not None:
            sample_rate, data = processing_utils.audio_from_file(payload.path)
            duration = len(data) / sample_rate
            if self.min_length is not None and duration < self.min_length:
                raise Error(
                    f"Audio is too short, and must be at least {self.min_length} seconds"
                )
            if self.max_length is not None and duration > self.max_length:
                raise Error(
                    f"Audio is too long, and must be at most {self.max_length} seconds"
                )

        if self.type == "numpy":
            return processing_utils.audio_from_file(payload.path)
        elif self.type == "filepath":
            if not needs_conversion:
                return payload.path
            sample_rate, data = processing_utils.audio_from_file(payload.path)
            output_file = str(Path(payload.path).with_suffix(f".{self.format}"))
            assert self.format is not None  # noqa: S101
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
        self, value: str | Path | bytes | tuple[int, np.ndarray] | None
    ) -> FileData | bytes | None:
        """
        Parameters:
            value: expects audio data in any of these formats: a `str` or `pathlib.Path` filepath or URL to an audio file, or a `bytes` object (recommended for streaming), or a `tuple` of (sample rate in Hz, audio data as numpy array). Note: if audio is supplied as a numpy array, the audio will be normalized by its peak value to avoid distortion or clipping in the resulting audio.
        Returns:
            FileData object, bytes, or None.
        """
        orig_name = None
        if value is None:
            return None

        if isinstance(value, bytes):
            if self.streaming:
                return value
            file_path = processing_utils.save_bytes_to_cache(
                value, "audio", cache_dir=self.GRADIO_CACHE
            )
            orig_name = Path(file_path).name
        elif isinstance(value, tuple):
            sample_rate, data = value
            file_path = processing_utils.save_audio_to_cache(
                data,
                sample_rate,
                format=self.format or "wav",
                cache_dir=self.GRADIO_CACHE,
            )
            orig_name = Path(file_path).name
        elif isinstance(value, (str, Path)):
            if client_utils.is_http_url_like(value):
                original_suffix = Path(httpx.URL(str(value)).path).suffix.lower()
            else:
                original_suffix = Path(value).suffix.lower()
            if self.format is not None and original_suffix != f".{self.format}":
                sample_rate, data = processing_utils.audio_from_file(str(value))
                file_path = processing_utils.save_audio_to_cache(
                    data, sample_rate, format=self.format, cache_dir=self.GRADIO_CACHE
                )
            else:
                file_path = str(value)
            orig_name = Path(file_path).name if Path(file_path).exists() else None
        else:
            raise ValueError(f"Cannot process {value} as Audio")
        return FileData(path=file_path, orig_name=orig_name)

    @staticmethod
    def _convert_to_adts(data: bytes):
        if wasm_utils.IS_WASM:
            raise wasm_utils.WasmUnsupportedError(
                "Audio streaming is not supported in the Wasm mode."
            )
        segment = AudioSegment.from_file(io.BytesIO(data))

        buffer = io.BytesIO()
        segment.export(buffer, format="adts")  # ADTS is a container format for AAC
        aac_data = buffer.getvalue()
        return aac_data, len(segment) / 1000.0

    @staticmethod
    async def covert_to_adts(data: bytes) -> tuple[bytes, float]:
        return await anyio.to_thread.run_sync(Audio._convert_to_adts, data)

    async def stream_output(
        self,
        value,
        output_id: str,
        first_chunk: bool,  # noqa: ARG002
    ) -> tuple[MediaStreamChunk | None, FileDataDict]:
        output_file: FileDataDict = {
            "path": output_id,
            "is_stream": True,
            "orig_name": "audio-stream.mp3",
            "meta": {"_type": "gradio.FileData"},
        }
        if value is None:
            return None, output_file
        if isinstance(value, bytes):
            value, duration = await self.covert_to_adts(value)
            return {
                "data": value,
                "duration": duration,
                "extension": ".aac",
            }, output_file
        if client_utils.is_http_url_like(value["path"]):
            response = httpx.get(value["path"])
            binary_data = response.content
        else:
            output_file["orig_name"] = value["orig_name"]
            file_path = value["path"]
            with open(file_path, "rb") as f:
                binary_data = f.read()
        value, duration = await self.covert_to_adts(binary_data)
        return {"data": value, "duration": duration, "extension": ".aac"}, output_file

    async def combine_stream(
        self,
        stream: list[bytes],
        desired_output_format: str | None = None,
        only_file=False,  # noqa: ARG002
    ) -> FileData:
        output_file = FileData(
            path=processing_utils.save_bytes_to_cache(
                b"".join(stream), "audio.mp3", cache_dir=self.GRADIO_CACHE
            ),
            is_stream=False,
            orig_name="audio-stream.mp3",
        )
        if desired_output_format and desired_output_format != "mp3":
            new_path = Path(output_file.path).with_suffix(f".{desired_output_format}")
            AudioSegment.from_file(output_file.path).export(
                new_path, format=desired_output_format
            )
            output_file.path = str(new_path)
        return output_file

    def process_example(
        self, value: tuple[int, np.ndarray] | str | Path | bytes | None
    ) -> str:
        if value is None:
            return ""
        elif isinstance(value, (str, Path)):
            return Path(value).name
        return "(audio)"

    def check_streamable(self):
        if (
            self.sources is not None
            and "microphone" not in self.sources
            and self.streaming
        ):
            raise ValueError(
                "Audio streaming only available if source includes 'microphone'."
            )
