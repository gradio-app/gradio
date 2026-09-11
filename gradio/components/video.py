"""gr.Video() component."""

from __future__ import annotations

import asyncio
import json
import subprocess
import tempfile
import time
import warnings
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal

import anyio
from gradio_client import handle_file
from gradio_client import utils as client_utils
from gradio_client.documentation import document

from gradio import processing_utils, utils
from gradio._vendor.ffmpy import FFmpeg
from gradio.audio_stream_encoder import (
    AacStreamEncoder,
    EncoderSlot,
    decode_file_to_pcm,
)
from gradio.components.base import Component, StreamingOutput
from gradio.components.button import Button
from gradio.components.image_editor import WatermarkOptions, WebcamOptions
from gradio.data_classes import FileData, FileDataDict, MediaStreamChunk
from gradio.events import Events
from gradio.i18n import I18nData
from gradio.profiling import trace_phase_sync, traced_sync
from gradio.utils import get_upload_folder, set_default_buttons

if TYPE_CHECKING:
    from gradio.components import Timer


# Where a stream's timeline starts. H.264 with B-frames carries a DTS that runs
# ahead of its first PTS, and MPEG-TS cannot hold a negative timestamp, so a
# stream anchored at zero has its first segment quietly shifted forward, which
# leaves a step exactly where the playlist promises there is none.
STREAM_PTS_BASE = 10.0

# How long a chunk waits for the frames covering the audio it has already fed
# in. See `Video._encode_chunk`.
DRAIN_TIMEOUT = 0.5


TS_PACKET_SIZE = 188
TS_NULL_PID = 0x1FFF


def _continue_counters(data: bytes, counters: dict[int, int] | None) -> bytes:
    """Renumber a segment's MPEG-TS continuity counters to follow the last one.

    Every packet carries a four bit counter that has to step by one per packet
    on its own PID, and each segment is muxed by its own ffmpeg, so each one
    restarts them from zero. A player reading the segments in sequence sees
    that as packet loss: ffmpeg calls it `Packet corrupt` and drops the
    packets, and a browser stops advancing the playhead with a buffer that
    looks full. `#EXT-X-DISCONTINUITY` used to declare the reset, which is
    partly what it was there for; without it the counters have to be real.
    """
    if counters is None or len(data) % TS_PACKET_SIZE or not data:
        return data
    buffer = bytearray(data)
    for offset in range(0, len(buffer), TS_PACKET_SIZE):
        if buffer[offset] != 0x47:
            # Not a transport stream after all; leave it exactly as it came.
            return data
        pid = ((buffer[offset + 1] & 0x1F) << 8) | buffer[offset + 2]
        if pid == TS_NULL_PID:
            continue
        value = counters.get(pid, 0)
        buffer[offset + 3] = (buffer[offset + 3] & 0xF0) | value
        # A packet that carries no payload repeats the counter rather than
        # advancing it.
        if (buffer[offset + 3] >> 4) & 0x01:
            counters[pid] = (value + 1) & 0x0F
    return bytes(buffer)


class _VideoStream:
    """One streamed output's encoder and its place on the timeline."""

    def __init__(self) -> None:
        self.slot = EncoderSlot()
        self.video_time = 0.0
        self.frames_emitted = 0
        self.samples_written = 0
        # The MPEG-TS continuity counter each PID is up to. See
        # `_continue_counters`.
        self.counters: dict[int, int] = {}

    def catch_up(self, encoder: AacStreamEncoder) -> bytes:
        """Silence for any of the video's timeline the audio has not filled.

        The two clocks are driven by different things - the audio's by however
        much PCM has arrived, the video's by each chunk's own length - and a
        generator whose chunks carry a little less audio than video would walk
        them apart for as long as the stream lasts. The old per-chunk segments
        hid that, the player resetting at each one. Asking for 0.25 s at 30 fps
        is enough to cause it: the video rounds up to eight frames and runs
        16.7 ms long every chunk, a second and a half of drift per half minute.

        So the audio is topped up to where the video has reached before the
        chunk's own samples go in, and it goes through the same encoder as
        everything else, so it costs no priming frame. A generator whose chunks
        are whole frames long, with audio to match, never triggers it.

        Letting the audio set the pace instead and following it with the video
        looks tempting and is worse: the frames then land between the positions
        the video's own timebase can express, two of them round onto the same
        timestamp about once a chunk, and a decoder will not cross that. It is
        what froze the playhead on a real clip.

        Audio that runs ahead of the video is left alone rather than trimmed:
        dropping it would throw away something the generator did supply.
        """
        behind = round(self.video_time * encoder.sample_rate) - self.samples_written
        return b"\x00" * (max(behind, 0) * encoder.channels * 2)

    def audio_time(self, encoder: AacStreamEncoder) -> float:
        """Where the frames emitted so far belong on the stream's clock.

        One frame ahead of where they were written: the encoder's own delay is
        exactly one frame at every sample rate measured, and ADTS inside
        MPEG-TS has nowhere to record it the way mp4's edit list does. Left
        alone the audio plays 23 ms behind the video at 44.1 kHz, and 64 ms
        behind at 16 kHz, which is past where people notice.
        """
        return (self.frames_emitted - 1) * encoder.frame_duration


# One entry per live stream, keyed by the stream's playlist path. The component
# instance is shared by every session, so it cannot hold these.
_stream_states: dict[str, _VideoStream] = {}


@document()
class Video(StreamingOutput, Component):
    """
    Creates a video component that can be used to upload/record videos (as an input) or display videos (as an output).
    For the video to be playable in the browser it must have a compatible container and codec combination. Allowed
    combinations are .mp4 with h264 codec, .ogg with theora codec, and .webm with vp9 codec. If the component detects
    that the output video would not be playable in the browser it will attempt to convert it to a playable mp4 video.
    If the conversion fails, the original video is returned.

    Demos: video_identity_2
    Guides: streaming-inputs, streaming-outputs, object-detection-from-video
    """

    data_model = FileData

    EVENTS = [
        Events.change,
        Events.clear,
        Events.start_recording,
        Events.stop_recording,
        Events.stop,
        Events.play,
        Events.pause,
        Events.end,
        Events.upload,
        Events.input,
    ]

    def __init__(
        self,
        value: (str | Path | Callable | None) = None,
        *,
        format: str | None = None,
        sources: (
            list[Literal["upload", "webcam"]] | Literal["upload", "webcam"] | None
        ) = None,
        height: int | str | None = None,
        width: int | str | None = None,
        label: str | I18nData | None = None,
        every: Timer | float | None = None,
        inputs: Component | Sequence[Component] | set[Component] | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool | Literal["hidden"] = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        webcam_options: WebcamOptions | None = None,
        include_audio: bool | None = None,
        autoplay: bool = False,
        buttons: list[Literal["download", "share"] | Button] | None = None,
        loop: bool = False,
        streaming: bool = False,
        watermark: WatermarkOptions | None = None,
        subtitles: str | Path | list[dict[str, Any]] | None = None,
        playback_position: float = 0,
    ):
        """
        Parameters:
            value: path or URL for the default value that Video component is going to take. Or can be callable, in which case the function will be called whenever the app loads to set the initial value of the component.
            format: the file extension with which to save video, such as 'avi' or 'mp4'. This parameter applies both when this component is used as an input to determine which file format to convert user-provided video to, and when this component is used as an output to determine the format of video returned to the user. If None, no file format conversion is done and the video is kept as is. Use 'mp4' to ensure browser playability.
            sources: list of sources permitted for video. "upload" creates a box where user can drop a video file, "webcam" allows user to record a video from their webcam. If None, defaults to both ["upload, "webcam"].
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed video file, but will affect the displayed video.
            width: The width of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed video file, but will affect the displayed video.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: continuously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload a video; if False, can only be used to display videos. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden. If "hidden", component will be visually hidden and not take up space in the layout but still exist in the DOM
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: an optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            include_audio: whether the component should record/retain the audio track for a video. By default, audio is excluded for webcam videos and included for uploaded videos.
            autoplay: whether to automatically play the video when the component is used as an output. Note: browsers will not autoplay video files if the user has not interacted with the page yet.
            buttons: A list of buttons to show in the top right corner of the component. Valid options are "download", "share", or a gr.Button() instance. The "download" button allows the user to save the video to their device. The "share" button allows the user to share the video via Hugging Face Spaces Discussions. Custom gr.Button() instances will appear in the toolbar with their configured icon and/or label, and clicking them will trigger any .click() events registered on the button. By default, no buttons are shown if the component is interactive and both buttons are shown if the component is not interactive.
            loop: if True, the video will loop when it reaches the end and continue playing from the beginning.
            streaming: when used set as an output, takes video chunks yielded from the backend and combines them into one streaming video output. Each chunk should be a video file with a .ts extension using an h.264 encoding. Mp4 files are also accepted but they will be converted to h.264 encoding.
            watermark: A `gr.WatermarkOptions` instance that includes an image file and position to be used as a watermark on the video. The image is not scaled and is displayed on the provided position on the video. Valid formats for the image are: jpeg, png.
            webcam_options: A `gr.WebcamOptions` instance that allows developers to specify custom media constraints for the webcam stream. This parameter provides flexibility to control the video stream's properties, such as resolution and front or rear camera on mobile devices. See $demo/webcam_constraints
            subtitles: A subtitle file (srt, vtt, or json) for the video, or a list of subtitle dictionaries in the format [{"text": str, "timestamp": [start, end]}] where timestamps are in seconds. JSON files should contain an array of subtitle objects.
            playback_position: The starting playback position in seconds. This value is also updated as the video plays, reflecting the current playback position.
        """
        valid_sources: list[Literal["upload", "webcam"]] = ["upload", "webcam"]
        if sources is None:
            self.sources = valid_sources
        elif isinstance(sources, str) and sources in valid_sources:
            self.sources = [sources]
        elif isinstance(sources, list) and all(s in valid_sources for s in sources):
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
        self.format = format
        self.autoplay = autoplay
        self.height = height
        self.width = width
        self.loop = loop
        self.webcam_options = (
            webcam_options if webcam_options is not None else WebcamOptions()
        )

        self.watermark = (
            watermark if isinstance(watermark, WatermarkOptions) else WatermarkOptions()
        )

        if isinstance(watermark, (str, Path)):
            self.watermark.watermark = watermark

        self.include_audio = (
            include_audio if include_audio is not None else "upload" in self.sources
        )
        self.buttons = set_default_buttons(buttons, ["download"])
        self.streaming = streaming
        self.playback_position = playback_position
        self.subtitles = None
        if subtitles is not None:
            if isinstance(subtitles, list):
                self.subtitles = handle_file(
                    self._process_json_subtitles(subtitles).path
                )
            else:
                self.subtitles = self._format_subtitles(subtitles)
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
        self._value_description = "a string filepath to a video"

    @traced_sync("preprocess_video")
    def preprocess(self, payload: FileData | None) -> str | None:
        """
        Parameters:
            payload: An instance of FileData containing the video file.
        Returns:
            Passes the uploaded video as a `str` filepath or URL whose extension can be modified by `format`.
        """
        if payload is None:
            return None
        if not payload.path:
            raise ValueError("Payload path missing")
        file_name = Path(payload.path)
        uploaded_format = file_name.suffix.replace(".", "")
        needs_formatting = self.format is not None and uploaded_format != self.format
        flip = self.sources == ["webcam"] and self.webcam_options.mirror
        # TODO: Check other image extensions to see if they work.
        valid_watermark_extensions = [".png", ".jpg", ".jpeg"]
        if self.watermark.watermark is not None:
            if not isinstance(self.watermark.watermark, (str, Path)):
                raise ValueError(
                    f"Provided watermark file not an expected file type. "
                    f"Received: {self.watermark.watermark}"
                )
            if Path(self.watermark.watermark).suffix not in valid_watermark_extensions:
                raise ValueError(
                    f"Watermark file does not have a supported extension. "
                    f"Expected one of {','.join(valid_watermark_extensions)}. "
                    f"Received: {Path(self.watermark.watermark).suffix}."
                )
        if needs_formatting or flip:
            format = f".{self.format if needs_formatting else uploaded_format}"
            output_options = ["-vf", "hflip", "-c:a", "copy"] if flip else []
            output_options += ["-an"] if not self.include_audio else []
            flip_suffix = "_flip" if flip else ""
            output_file_name = str(
                file_name.with_name(f"{file_name.stem}{flip_suffix}{format}")
            )
            output_filepath = Path(output_file_name)
            if output_filepath.exists():
                return str(output_filepath.resolve())

            ff = FFmpeg(  # type: ignore
                inputs={str(file_name): None},
                outputs={output_file_name: output_options},
            )
            ff.run()
            return str(output_filepath.resolve())
        elif not self.include_audio:
            output_file_name = str(file_name.with_name(f"muted_{file_name.name}"))
            if Path(output_file_name).exists():
                return output_file_name

            ff = FFmpeg(  # type: ignore
                inputs={str(file_name): None},
                outputs={output_file_name: ["-an"]},
            )
            ff.run()
            return output_file_name
        else:
            return str(file_name)

    @traced_sync("postprocess_video")
    def postprocess(self, value: str | Path | None) -> FileData | None:
        """
        Parameters:
            value: Expects one of either:
            - a {str} or {pathlib.Path} filepath to a video which is displayed
            - a {Tuple[str | pathlib.Path, str | pathlib.Path | None]} where the first element is a filepath to a video and the second element is an optional filepath to a subtitle file.
        Returns:
            FileData object containing the video file.
        """
        if self.streaming:
            return value  # type: ignore
        if value is None or value in ([None, None], (None, None)):
            return None
        if isinstance(value, (str, Path)):
            processed_video = self._format_video(value)
        return processed_video

    def _format_video(self, video: str | Path | None) -> FileData | None:
        """
        Processes a video to ensure that it is in the correct format
        and adds a watermark if requested.
        """

        if video is None:
            return None
        video = str(video)
        returned_format = video.split(".")[-1].lower()
        if self.format is None or returned_format == self.format:
            conversion_needed = False
        else:
            conversion_needed = True

        is_url = client_utils.is_http_url_like(video)

        # For cases where the video is a URL and does not need to be converted
        # to another format and have a watermark added, we can just return the URL
        if not self.watermark.watermark and (is_url and not conversion_needed):
            return FileData(path=video)

        # For cases where the video needs to be converted to another format
        # or have a watermark added.
        if is_url:
            video = processing_utils.save_url_to_cache(
                video, cache_dir=self.GRADIO_CACHE
            )
        if (
            processing_utils.ffmpeg_installed()
            and not processing_utils.video_is_playable(video)
        ):
            warnings.warn(
                "Video does not have browser-compatible container or codec. Converting to mp4."
            )
            with trace_phase_sync("postprocess_video_convert_video_to_playable_mp4"):
                video = processing_utils.convert_video_to_playable_mp4(
                    video, cache_dir=self.GRADIO_CACHE
                )
        # Recalculate the format in case convert_video_to_playable_mp4 already made it the selected format
        returned_format = utils.get_extension_from_file_path_or_url(video).lower()
        if (
            self.format is not None and returned_format != self.format
        ) or self.watermark.watermark:
            global_option_list = ["-y"]
            inputs_dict = {video: None}
            output_file_name = video[0 : video.rindex(".") + 1]
            if self.format is not None:
                output_file_name += self.format
            else:
                output_file_name += returned_format
            if self.watermark.watermark:
                inputs_dict[str(self.watermark.watermark)] = None
                pos = self.watermark.position
                margin = 5

                if isinstance(pos, tuple):
                    x, y = pos
                    watermark_cmd = f"overlay={x}:{y}"
                elif pos == "top-left":
                    watermark_cmd = f"overlay={margin}:{margin}"
                elif pos == "top-right":
                    watermark_cmd = f"overlay=W-w-{margin}:{margin}"
                elif pos == "bottom-left":
                    watermark_cmd = f"overlay={margin}:H-h-{margin}"
                elif pos == "bottom-right":
                    watermark_cmd = f"overlay=W-w-{margin}:H-h-{margin}"
                else:
                    watermark_cmd = "overlay=W-w-5:H-h-5"

                global_option_list += ["-filter_complex", watermark_cmd]
                output_file_name = (
                    Path(output_file_name).stem
                    + "_watermarked"
                    + Path(output_file_name).suffix
                )
            ff = FFmpeg(  # type: ignore
                inputs=inputs_dict,
                outputs={output_file_name: None},
                global_options=global_option_list,
            )
            ff.run()
            video = output_file_name

        return FileData(path=video, orig_name=Path(video).name)

    def _process_json_subtitles(self, subtitles: list[dict[str, Any]]) -> FileData:
        """Convert JSON subtitles to VTT format."""

        def seconds_to_vtt_timestamp(seconds: float) -> str:
            """Convert seconds to VTT timestamp format (HH:MM:SS.mmm)"""
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            secs = seconds % 60
            return f"{hours:02d}:{minutes:02d}:{secs:06.3f}"

        # Validate input
        for i, subtitle in enumerate(subtitles):
            if not isinstance(subtitle, dict):
                raise ValueError(f"Subtitle at index {i} must be a dictionary")
            if "text" not in subtitle:
                raise ValueError(f"Subtitle at index {i} missing required 'text' field")
            if "timestamp" not in subtitle:
                raise ValueError(
                    f"Subtitle at index {i} missing required 'timestamp' field"
                )
            if (
                not isinstance(subtitle["timestamp"], (list, tuple))
                or len(subtitle["timestamp"]) != 2
            ):
                raise ValueError(
                    f"Subtitle at index {i} 'timestamp' must be a list/tuple of [start, end]"
                )

        # Create VTT file
        temp_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".vtt",
            dir=get_upload_folder(),
            mode="w",
            encoding="utf-8",
        )

        try:
            temp_file.write("WEBVTT\n\n")
            for subtitle in subtitles:
                start_time = seconds_to_vtt_timestamp(subtitle["timestamp"][0])
                end_time = seconds_to_vtt_timestamp(subtitle["timestamp"][1])
                text = subtitle["text"]
                temp_file.write(f"{start_time} --> {end_time}\n")
                temp_file.write(f"{text}\n\n")
            temp_file.close()
            return FileData(path=str(temp_file.name))
        except Exception as e:
            temp_file.close()
            raise ValueError(f"Error creating VTT file from JSON subtitles: {e}") from e

    def _format_subtitles(self, subtitle: str | Path | None) -> FileData | None:
        """
        Convert subtitle format to VTT and process the video to ensure it meets the HTML5 requirements.
        """

        def srt_to_vtt(srt_file_path, vtt_file_path):
            """Convert an SRT subtitle file to a VTT subtitle file"""
            with (
                open(srt_file_path, encoding="utf-8") as srt_file,
                open(vtt_file_path, "w", encoding="utf-8") as vtt_file,
            ):
                vtt_file.write("WEBVTT\n\n")
                for subtitle_block in srt_file.read().strip().split("\n\n"):
                    subtitle_lines = subtitle_block.split("\n")
                    subtitle_timing = subtitle_lines[1].replace(",", ".")
                    subtitle_text = "\n".join(subtitle_lines[2:])
                    vtt_file.write(f"{subtitle_timing} --> {subtitle_timing}\n")
                    vtt_file.write(f"{subtitle_text}\n\n")

        file_path = Path(subtitle)  # type: ignore
        if file_path.suffix.lower() == ".json":
            try:
                with open(file_path, encoding="utf-8") as f:
                    json_data = json.load(f)
                if isinstance(json_data, list):
                    return handle_file(self._process_json_subtitles(json_data).path)
                else:
                    raise ValueError(
                        "JSON subtitle file must contain a list of subtitle objects"
                    ) from None

            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON format in subtitle file: {e}") from e
            except Exception as e:
                raise ValueError(f"Error reading JSON subtitle file: {e}") from e

        if subtitle is None:
            return None

        valid_extensions = (".srt", ".vtt", ".json")

        if Path(subtitle).suffix not in valid_extensions:
            raise ValueError(
                f"Invalid value for parameter `subtitle`: {subtitle}. Please choose a file with one of these extensions: {valid_extensions}"
            )

        # HTML5 only support vtt format
        if Path(subtitle).suffix == ".srt":
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, suffix=".vtt", dir=get_upload_folder()
            )

            srt_to_vtt(subtitle, temp_file.name)
            subtitle = temp_file.name

        return handle_file(subtitle)

    def example_payload(self) -> Any:
        return handle_file(
            "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/videos/world.mp4"
        )

    def example_value(self) -> Any:
        return "https://github.com/gradio-app/gradio/raw/main/gradio/media_assets/videos/world.mp4"

    @staticmethod
    def probe_chunk(path: str) -> dict[str, Any]:
        """What the muxer needs to know about one chunk, in one call.

        The video track's own duration is what the timeline advances by, and
        the two obvious alternatives are both wrong. The audio's length is
        short of it whenever a `-c copy` split cuts on a keyframe, which
        overlaps the next chunk's video and walks its timestamps backwards.
        `format.duration` runs long, by the encoder padding on mp4 and by the
        muxer's own 1.4 s head start on `.ts`.

        `start_time` comes back for the same reason. A chunk need not begin at
        zero - an mp4's edit list and an MPEG-TS chunk's mux delay both push it
        - and `-copyts` would carry that straight into the output, leaving the
        video that far behind the audio in every segment.
        """
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-print_format", "json",
             "-show_format", "-show_streams", path],
            capture_output=True,
            check=False,
        )  # fmt: skip
        if result.returncode != 0:
            detail = result.stderr.decode(errors="replace").strip()
            raise RuntimeError(f"Could not read the streamed video chunk: {detail}")
        data = json.loads(result.stdout)
        streams = data.get("streams", [])
        audio = next((s for s in streams if s.get("codec_type") == "audio"), None)
        video = next((s for s in streams if s.get("codec_type") == "video"), None)
        durations = [
            float(stream["duration"])
            for stream in (video, audio, data.get("format"))
            if stream is not None and "duration" in stream
        ]
        if not durations:
            raise RuntimeError("Cannot determine video chunk duration")
        return {
            "duration": durations[0],
            "video_start": float(video["start_time"])
            if video and "start_time" in video
            else 0.0,
            "sample_rate": int(audio["sample_rate"]) if audio else None,
            "channels": int(audio["channels"]) if audio else None,
            "video_codec": video["codec_name"] if video else None,
        }

    @staticmethod
    def mux_segment(
        path: str | None,
        video_codec: str | None,
        adts: bytes,
        video_time: float,
        audio_time: float,
        video_start: float = 0.0,
        counters: dict[int, int] | None = None,
    ) -> bytes:
        """One `.ts` holding the chunk's own video and the encoder's own audio.

        Neither track is encoded here. The video is copied when the browser can
        play it as it stands, and the audio arrives already encoded by the
        stream's single AAC encoder, so the only work is placing both on the
        stream's timeline.

        That placement cannot be asked of the ADTS input: whichever of its
        frames ffmpeg reads while probing keeps the timestamp it had before the
        offset was applied, so a segment carrying one frame - which the first
        one usually does, the encoder having just started - puts it at zero.
        The audio therefore keeps its own zero, the video is placed relative to
        it, and a single `-output_ts_offset` lifts the segment onto the
        timeline at the muxer, which runs once probing is over.
        """
        base = audio_time if adts else video_time
        args = ["ffmpeg", "-v", "error", "-nostdin", "-copyts"]
        maps: list[str] = []
        # Every segment has to name its tracks the same way. Left to itself the
        # muxer numbers them in the order they are mapped, so the audio-only
        # segment the flush produces would put audio on the id the other
        # segments use for H.264, and anything reading the segments as one
        # stream takes those packets for video and drops the lot.
        pids: list[str] = []
        index = 0
        if video_codec is not None and path is not None:
            offset = video_time - base - video_start
            args += ["-itsoffset", f"{offset:.6f}", "-i", path]
            maps += ["-map", f"{index}:v:0"]
            maps += (
                ["-c:v", "copy", "-bsf:v", "h264_mp4toannexb"]
                if video_codec == "h264"
                # Anything else would reach the browser in a codec hls.js will
                # not play, so it is encoded, as every chunk used to be.
                else ["-c:v", "libx264"]
            )
            pids += ["-streamid", f"{len(pids) // 2}:256"]
            index += 1
        if adts:
            args += ["-f", "aac", "-i", "pipe:0"]
            maps += ["-map", f"{index}:a:0", "-c:a", "copy"]
            pids += ["-streamid", f"{len(pids) // 2}:257"]
        args += maps + pids + [
            "-output_ts_offset", f"{STREAM_PTS_BASE + base:.6f}",
            "-muxdelay", "0", "-muxpreload", "0", "-f", "mpegts", "pipe:1",
        ]  # fmt: skip
        result = subprocess.run(args, input=adts, capture_output=True, check=False)
        if result.returncode != 0:
            detail = result.stderr.decode(errors="replace").strip()
            raise RuntimeError(f"FFmpeg command failed: {detail}")
        return _continue_counters(result.stdout, counters)

    async def combine_stream(
        self,
        stream: list[bytes],
        desired_output_format: str | None = None,  # noqa: ARG002
        only_file=False,
    ) -> FileData:
        """Combine video chunks into a single video file.

        Do not take desired_output_format into consideration as
        mp4 is a safe format for playing in browser.
        """

        # Use an mp4 extension here so that the cached example
        # is playable in the browser
        output_file = tempfile.NamedTemporaryFile(
            delete=False, suffix=".mp4", dir=self.GRADIO_CACHE
        )

        ts_files = [
            processing_utils.save_bytes_to_cache(
                s, "video_chunk.ts", cache_dir=self.GRADIO_CACHE
            )
            for s in stream
        ]

        command = [
            "ffmpeg",
            "-i",
            f"concat:{'|'.join(ts_files)}",
            "-y",
            "-safe",
            "0",
            "-c",
            "copy",
            output_file.name,
        ]
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,  # type: ignore
            stderr=asyncio.subprocess.PIPE,  # type: ignore
        )

        _, stderr = await process.communicate()

        if process.returncode != 0:
            error_message = stderr.decode().strip()
            raise RuntimeError(f"FFmpeg command failed: {error_message}")
        video = FileData(
            path=output_file.name,
            is_stream=False,
            orig_name="video-stream.mp4",
        )
        if only_file:
            return video

        return video

    def _encode_chunk(self, output_id: str, path: str) -> MediaStreamChunk | None:
        state = _stream_states.get(output_id)
        if state is None:
            # Ended while this chunk was in flight, by a disconnect or a
            # cancel. The run is over and nothing will play this.
            return None
        info = self.probe_chunk(path)
        frames: list[bytes] = []
        encoder = state.slot.encoder
        if info["sample_rate"] is not None:
            if encoder is None:
                encoder = AacStreamEncoder(info["sample_rate"], info["channels"])
                if not state.slot.attach(encoder):
                    encoder.close()
                    return None
            pcm = state.catch_up(encoder) + decode_file_to_pcm(
                path, encoder.sample_rate, encoder.channels
            )
            encoder.feed(pcm)
            state.samples_written += len(pcm) // (encoder.channels * 2)
            frames = encoder.take()
            # `take` returns what the encoder has got round to emitting and no
            # more, which for audio alone is the right trade: a segment that is
            # a few frames short is made up by the next one. Here the audio has
            # to sit alongside the chunk's video, and a segment whose audio
            # starts a third of a second before the playlist says it does stops
            # hls.js dead, so the stragglers are worth waiting for.
            wanted = int(
                state.samples_written / encoder.sample_rate / encoder.frame_duration
            )
            deadline = time.monotonic() + DRAIN_TIMEOUT
            while (
                state.frames_emitted + len(frames) < wanted
                and time.monotonic() < deadline
            ):
                frames += encoder.take()
        audio_time = state.audio_time(encoder) if encoder else 0.0
        data = self.mux_segment(
            path,
            info["video_codec"],
            b"".join(frames),
            state.video_time,
            audio_time,
            info["video_start"],
            state.counters,
        )
        state.frames_emitted += len(frames)
        state.video_time += info["duration"]
        return {"data": data, "duration": info["duration"], "extension": ".ts"}

    async def stream_output(
        self,
        value: str | Path | None,
        output_id: str,
        first_chunk: bool,
    ) -> tuple[MediaStreamChunk | None, FileDataDict]:
        output_file: FileDataDict = {
            "path": output_id,
            "is_stream": True,
            "orig_name": "video-stream.mp4",
            "meta": {"_type": "gradio.FileData"},
        }
        if first_chunk:
            # Made here, on the event loop, so that a cancel landing while the
            # thread runs has something to end, and made whether or not this
            # chunk carries video, since a stream may open on a None. A key is
            # never shared by two live streams, so anything already here was
            # left behind.
            stale = _stream_states.pop(output_id, None)
            if stale is not None:
                stale.slot.end()
            _stream_states[output_id] = _VideoStream()
        try:
            if value is None:
                return None, output_file
            value = str(value)
            if not value.endswith((".mp4", ".ts")):
                raise RuntimeError(
                    "Video must be in .mp4 or .ts format to be streamed as chunks",
                )
            chunk = await anyio.to_thread.run_sync(self._encode_chunk, output_id, value)
        except BaseException:
            # Until this returns and the stream exists, nothing else holds the
            # state.
            if first_chunk:
                self.end_stream_output(output_id)
            raise
        return chunk, output_file

    async def flush_stream_output(self, output_id: str) -> MediaStreamChunk | None:
        state = _stream_states.pop(output_id, None)
        encoder = state.slot.detach() if state is not None else None
        if state is None or encoder is None:
            return None
        audio_time = state.audio_time(encoder)

        def flush_and_release() -> MediaStreamChunk | None:
            frames = encoder.flush()
            if not frames:
                return None
            # No video is left to go with it, so the stream ends on a segment
            # carrying only the frames the encoder was still holding.
            return {
                "data": self.mux_segment(
                    None, None, b"".join(frames), 0.0, audio_time, 0.0, state.counters
                ),
                "duration": len(frames) * encoder.frame_duration,
                "extension": ".ts",
            }

        try:
            return await anyio.to_thread.run_sync(flush_and_release)
        except BaseException:
            # The encoder is out of the registry and the slot, so nothing else
            # can release it: not after a flush that raised, and not after a
            # cancel that landed before the thread was dispatched.
            encoder.close()
            raise

    def end_stream_output(self, output_id: str) -> None:
        state = _stream_states.pop(output_id, None)
        if state is not None:
            state.slot.end()
