"""gr.Video() component."""

from __future__ import annotations

import asyncio
import json
import subprocess
import tempfile
import warnings
from collections.abc import Callable, Sequence
from pathlib import Path
from typing import TYPE_CHECKING, Any, Literal, Optional

from gradio_client import handle_file
from gradio_client import utils as client_utils
from gradio_client.documentation import document

import gradio as gr
from gradio import processing_utils, utils, wasm_utils
from gradio.components.base import Component, StreamingOutput
from gradio.components.image_editor import WebcamOptions
from gradio.data_classes import FileData, GradioModel, MediaStreamChunk
from gradio.events import Events
from gradio.i18n import I18nData

if TYPE_CHECKING:
    from gradio.components import Timer


if not wasm_utils.IS_WASM:
    # TODO: Support ffmpeg on Wasm
    from ffmpy import FFmpeg


class VideoData(GradioModel):
    video: FileData
    subtitles: Optional[FileData] = None


@document()
class Video(StreamingOutput, Component):
    """
    Creates a video component that can be used to upload/record videos (as an input) or display videos (as an output).
    For the video to be playable in the browser it must have a compatible container and codec combination. Allowed
    combinations are .mp4 with h264 codec, .ogg with theora codec, and .webm with vp9 codec. If the component detects
    that the output video would not be playable in the browser it will attempt to convert it to a playable mp4 video.
    If the conversion fails, the original video is returned.

    Demos: video_identity_2
    """

    data_model = VideoData

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
    ]

    def __init__(
        self,
        value: (
            str | Path | tuple[str | Path, str | Path | None] | Callable | None
        ) = None,
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
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        key: int | str | tuple[int | str, ...] | None = None,
        preserved_by_key: list[str] | str | None = "value",
        mirror_webcam: bool | None = None,
        webcam_options: WebcamOptions | None = None,
        include_audio: bool | None = None,
        autoplay: bool = False,
        show_share_button: bool | None = None,
        show_download_button: bool | None = None,
        min_length: int | None = None,
        max_length: int | None = None,
        loop: bool = False,
        streaming: bool = False,
        watermark: str | Path | None = None,
        webcam_constraints: dict[str, Any] | None = None,
    ):
        """
        Parameters:
            value: path or URL for the default value that Video component is going to take. Can also be a tuple consisting of (video filepath, subtitle filepath). If a subtitle file is provided, it should be of type .srt or .vtt. Or can be callable, in which case the function will be called whenever the app loads to set the initial value of the component.
            format: the file extension with which to save video, such as 'avi' or 'mp4'. This parameter applies both when this component is used as an input to determine which file format to convert user-provided video to, and when this component is used as an output to determine the format of video returned to the user. If None, no file format conversion is done and the video is kept as is. Use 'mp4' to ensure browser playability.
            sources: list of sources permitted for video. "upload" creates a box where user can drop a video file, "webcam" allows user to record a video from their webcam. If None, defaults to both ["upload, "webcam"].
            height: The height of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed video file, but will affect the displayed video.
            width: The width of the component, specified in pixels if a number is passed, or in CSS units if a string is passed. This has no effect on the preprocessed video file, but will affect the displayed video.
            label: the label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: continously calls `value` to recalculate it if `value` is a function (has no effect otherwise). Can provide a Timer whose tick resets `value`, or a float that provides the regular interval for the reset Timer.
            inputs: components that are used as inputs to calculate `value` if `value` is a function (has no effect otherwise). `value` is recalculated any time the inputs change.
            show_label: if True, will display label.
            container: if True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload a video; if False, can only be used to display videos. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: if False, component will be hidden.
            elem_id: an optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: an optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: if False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            key: in a gr.render, Components with the same key across re-renders are treated as the same component, not a new component. Properties set in 'preserved_by_key' are not reset across a re-render.
            preserved_by_key: A list of parameters from this component's constructor. Inside a gr.render() function, if a component is re-rendered with the same key, these (and only these) parameters will be preserved in the UI (if they have been changed by the user or an event listener) instead of re-rendered based on the values provided during constructor.
            include_audio: whether the component should record/retain the audio track for a video. By default, audio is excluded for webcam videos and included for uploaded videos.
            autoplay: whether to automatically play the video when the component is used as an output. Note: browsers will not autoplay video files if the user has not interacted with the page yet.
            show_share_button: if True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_download_button: if True, will show a download icon in the corner of the component that allows user to download the output. If False, icon does not appear. By default, it will be True for output components and False for input components.
            min_length: the minimum length of video (in seconds) that the user can pass into the prediction function. If None, there is no minimum length.
            max_length: the maximum length of video (in seconds) that the user can pass into the prediction function. If None, there is no maximum length.
            loop: if True, the video will loop when it reaches the end and continue playing from the beginning.
            streaming: when used set as an output, takes video chunks yielded from the backend and combines them into one streaming video output. Each chunk should be a video file with a .ts extension using an h.264 encoding. Mp4 files are also accepted but they will be converted to h.264 encoding.
            watermark: an image file to be included as a watermark on the video. The image is not scaled and is displayed on the bottom right of the video. Valid formats for the image are: jpeg, png.
            webcam_options: A `gr.WebcamOptions` instance that allows developers to specify custom media constraints for the webcam stream. This parameter provides flexibility to control the video stream's properties, such as resolution and front or rear camera on mobile devices. See $demo/webcam_constraints
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

        if mirror_webcam is not None:
            warnings.warn(
                "The `mirror_webcam` parameter is deprecated. Please use the `webcam_options` parameter with a `gr.WebcamOptions` instance instead."
            )
            self.webcam_options.mirror = mirror_webcam

        if webcam_constraints is not None:
            self.webcam_options.constraints = webcam_constraints

        self.include_audio = (
            include_audio if include_audio is not None else "upload" in self.sources
        )
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        self.show_download_button = show_download_button
        self.min_length = min_length
        self.max_length = max_length
        self.streaming = streaming
        self.watermark = watermark
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

    def preprocess(self, payload: VideoData | None) -> str | None:
        """
        Parameters:
            payload: An instance of VideoData containing the video and subtitle files.
        Returns:
            Passes the uploaded video as a `str` filepath or URL whose extension can be modified by `format`.
        """
        if payload is None:
            return None
        if not payload.video.path:
            raise ValueError("Payload path missing")
        file_name = Path(payload.video.path)
        uploaded_format = file_name.suffix.replace(".", "")
        needs_formatting = self.format is not None and uploaded_format != self.format
        flip = self.sources == ["webcam"] and self.webcam_options.mirror

        if self.min_length is not None or self.max_length is not None:
            # With this if-clause, avoid unnecessary execution of `processing_utils.get_video_length`.
            # This is necessary for the Wasm-mode, because it uses ffprobe, which is not available in the browser.
            duration = processing_utils.get_video_length(file_name)
            if self.min_length is not None and duration < self.min_length:
                raise gr.Error(
                    f"Video is too short, and must be at least {self.min_length} seconds"
                )
            if self.max_length is not None and duration > self.max_length:
                raise gr.Error(
                    f"Video is too long, and must be at most {self.max_length} seconds"
                )
        # TODO: Check other image extensions to see if they work.
        valid_watermark_extensions = [".png", ".jpg", ".jpeg"]
        if self.watermark is not None:
            if not isinstance(self.watermark, (str, Path)):
                raise ValueError(
                    f"Provided watermark file not an expected file type. "
                    f"Received: {self.watermark}"
                )
            if Path(self.watermark).suffix not in valid_watermark_extensions:
                raise ValueError(
                    f"Watermark file does not have a supported extension. "
                    f"Expected one of {','.join(valid_watermark_extensions)}. "
                    f"Received: {Path(self.watermark).suffix}."
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
            if wasm_utils.IS_WASM:
                raise wasm_utils.WasmUnsupportedError(
                    "Video formatting is not supported in the Wasm mode."
                )
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
            if wasm_utils.IS_WASM:
                raise wasm_utils.WasmUnsupportedError(
                    "include_audio=False is not supported in the Wasm mode."
                )
            ff = FFmpeg(  # type: ignore
                inputs={str(file_name): None},
                outputs={output_file_name: ["-an"]},
            )
            ff.run()
            return output_file_name
        else:
            return str(file_name)

    def postprocess(
        self, value: str | Path | tuple[str | Path, str | Path | None] | None
    ) -> VideoData | None:
        """
        Parameters:
            value: Expects a {str} or {pathlib.Path} filepath to a video which is displayed, or a {Tuple[str | pathlib.Path, str | pathlib.Path | None]} where the first element is a filepath to a video and the second element is an optional filepath to a subtitle file.
        Returns:
            VideoData object containing the video and subtitle files.
        """
        if self.streaming:
            return value  # type: ignore
        if value is None or value in ([None, None], (None, None)):
            return None
        if isinstance(value, (str, Path)):
            processed_files = (self._format_video(value), None)

        elif isinstance(value, (tuple, list)):
            if len(value) != 2:
                raise ValueError(
                    f"Expected lists of length 2 or tuples of length 2. Received: {value}"
                )

            if not (
                isinstance(value[0], (str, Path)) and isinstance(value[1], (str, Path))
            ):
                raise TypeError(
                    f"If a tuple is provided, both elements must be strings or Path objects. Received: {value}"
                )
            video = value[0]
            subtitle = value[1]
            processed_files = (
                self._format_video(video),
                self._format_subtitle(subtitle),
            )

        else:
            raise Exception(f"Cannot process type as video: {type(value)}")
        if not processed_files[0]:
            raise ValueError("Video data missing")
        return VideoData(video=processed_files[0], subtitles=processed_files[1])

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
        if not self.watermark and (is_url and not conversion_needed):
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
            video = processing_utils.convert_video_to_playable_mp4(video)
        # Recalculate the format in case convert_video_to_playable_mp4 already made it the selected format
        returned_format = utils.get_extension_from_file_path_or_url(video).lower()
        if (
            self.format is not None and returned_format != self.format
        ) or self.watermark:
            if wasm_utils.IS_WASM:
                raise wasm_utils.WasmUnsupportedError(
                    "Modifying a video is not supported in the Wasm mode."
                )
            global_option_list = ["-y"]
            inputs_dict = {video: None}
            output_file_name = video[0 : video.rindex(".") + 1]
            if self.format is not None:
                output_file_name += self.format
            else:
                output_file_name += returned_format
            if self.watermark:
                inputs_dict[str(self.watermark)] = None
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

    def _format_subtitle(self, subtitle: str | Path | None) -> FileData | None:
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

        if subtitle is None:
            return None

        valid_extensions = (".srt", ".vtt")

        if Path(subtitle).suffix not in valid_extensions:
            raise ValueError(
                f"Invalid value for parameter `subtitle`: {subtitle}. Please choose a file with one of these extensions: {valid_extensions}"
            )

        # HTML5 only support vtt format
        if Path(subtitle).suffix == ".srt":
            temp_file = tempfile.NamedTemporaryFile(
                delete=False, suffix=".vtt", dir=self.GRADIO_CACHE
            )

            srt_to_vtt(subtitle, temp_file.name)
            subtitle = temp_file.name

        return FileData(path=str(subtitle))

    def example_payload(self) -> Any:
        return {
            "video": handle_file(
                "https://github.com/gradio-app/gradio/raw/main/demo/video_component/files/world.mp4"
            ),
        }

    def example_value(self) -> Any:
        return "https://github.com/gradio-app/gradio/raw/main/demo/video_component/files/world.mp4"

    @staticmethod
    def get_video_duration_ffprobe(filename: str):
        if wasm_utils.IS_WASM:
            raise wasm_utils.WasmUnsupportedError(
                "ffprobe is not supported in the Wasm mode."
            )

        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "quiet",
                "-print_format",
                "json",
                "-show_format",
                "-show_streams",
                filename,
            ],
            capture_output=True,
            check=True,
        )

        data = json.loads(result.stdout)

        duration = None
        if "format" in data and "duration" in data["format"]:
            duration = float(data["format"]["duration"])
        else:
            for stream in data.get("streams", []):
                if "duration" in stream:
                    duration = float(stream["duration"])
                    break

        return duration

    @staticmethod
    async def async_convert_mp4_to_ts(mp4_file, ts_file):
        if wasm_utils.IS_WASM:
            raise wasm_utils.WasmUnsupportedError(
                "Streaming is not supported in the Wasm mode."
            )

        ff = FFmpeg(  # type: ignore
            inputs={mp4_file: None},
            outputs={
                ts_file: "-c:v libx264 -c:a aac -f mpegts -bsf:v h264_mp4toannexb -bsf:a aac_adtstoasc"
            },
            global_options=["-y"],
        )

        command = ff.cmd.split(" ")
        process = await asyncio.create_subprocess_exec(
            *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )

        _, stderr = await process.communicate()

        if process.returncode != 0:
            error_message = stderr.decode().strip()
            raise RuntimeError(f"FFmpeg command failed: {error_message}")

        return ts_file

    async def combine_stream(
        self,
        stream: list[bytes],
        desired_output_format: str | None = None,  # noqa: ARG002
        only_file=False,
    ) -> VideoData | FileData:
        """Combine video chunks into a single video file.

        Do not take desired_output_format into consideration as
        mp4 is a safe format for playing in browser.
        """
        if wasm_utils.IS_WASM:
            raise wasm_utils.WasmUnsupportedError(
                "Streaming is not supported in the Wasm mode."
            )

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
            *command, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
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

        output = VideoData(video=video)
        return output

    async def stream_output(
        self,
        value: str | None,
        output_id: str,
        first_chunk: bool,  # noqa: ARG002
    ) -> tuple[MediaStreamChunk | None, dict]:
        output_file = {
            "video": {
                "path": output_id,
                "is_stream": True,
                # Need to set orig_name so that downloaded file has correct
                # extension
                "orig_name": "video-stream.mp4",
                "meta": {"_type": "gradio.FileData"},
            }
        }
        if value is None:
            return None, output_file

        ts_file = value
        if not value.endswith(".ts"):
            if not value.endswith(".mp4"):
                raise RuntimeError(
                    "Video must be in .mp4 or .ts format to be streamed as chunks",
                )
            ts_file = value.replace(".mp4", ".ts")
            await self.async_convert_mp4_to_ts(value, ts_file)

        duration = self.get_video_duration_ffprobe(ts_file)
        if not duration:
            raise RuntimeError("Cannot determine video chunk duration")
        chunk: MediaStreamChunk = {
            "data": Path(ts_file).read_bytes(),
            "duration": duration,
            "extension": ".ts",
        }
        return chunk, output_file
