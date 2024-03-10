"""gr.Video() component."""

from __future__ import annotations

import tempfile
import warnings
from pathlib import Path
from typing import Any, Callable, Literal, Optional

from gradio_client import file
from gradio_client import utils as client_utils
from gradio_client.documentation import document

import gradio as gr
from gradio import processing_utils, utils, wasm_utils
from gradio.components.base import Component
from gradio.data_classes import FileData, GradioModel
from gradio.events import Events

if not wasm_utils.IS_WASM:
    # TODO: Support ffmpeg on Wasm
    from ffmpy import FFmpeg


class VideoData(GradioModel):
    video: FileData
    subtitles: Optional[FileData] = None


@document()
class Video(Component):
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
        value: str
        | Path
        | tuple[str | Path, str | Path | None]
        | Callable
        | None = None,
        *,
        format: str | None = None,
        sources: list[Literal["upload", "webcam"]] | None = None,
        height: int | str | None = None,
        width: int | str | None = None,
        label: str | None = None,
        every: float | None = None,
        show_label: bool | None = None,
        container: bool = True,
        scale: int | None = None,
        min_width: int = 160,
        interactive: bool | None = None,
        visible: bool = True,
        elem_id: str | None = None,
        elem_classes: list[str] | str | None = None,
        render: bool = True,
        mirror_webcam: bool = True,
        include_audio: bool | None = None,
        autoplay: bool = False,
        show_share_button: bool | None = None,
        show_download_button: bool | None = None,
        min_length: int | None = None,
        max_length: int | None = None,
    ):
        """
        Parameters:
            value: A path or URL for the default value that Video component is going to take. Can also be a tuple consisting of (video filepath, subtitle filepath). If a subtitle file is provided, it should be of type .srt or .vtt. Or can be callable, in which case the function will be called whenever the app loads to set the initial value of the component.
            format: Format of video format to be returned by component, such as 'avi' or 'mp4'. Use 'mp4' to ensure browser playability. If set to None, video will keep uploaded format.
            sources: A list of sources permitted for video. "upload" creates a box where user can drop an video file, "webcam" allows user to record a video from their webcam. If None, defaults to ["upload, "webcam"].
            height: The height of the displayed video, specified in pixels if a number is passed, or in CSS units if a string is passed.
            width: The width of the displayed video, specified in pixels if a number is passed, or in CSS units if a string is passed.
            label: The label for this component. Appears above the component and is also used as the header if there are a table of examples for this component. If None and used in a `gr.Interface`, the label will be the name of the parameter this component is assigned to.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative size compared to adjacent Components. For example if Components A and B are in a Row, and A has scale=2, and B has scale=1, A will be twice as wide as B. Should be an integer. scale applies in Rows, and to top-level Components in Blocks where fill_height=True.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload a video; if False, can only be used to display videos. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            render: If False, component will not render be rendered in the Blocks context. Should be used if the intention is to assign event listeners now but render the component later.
            mirror_webcam: If True webcam will be mirrored. Default is True.
            include_audio: Whether the component should record/retain the audio track for a video. By default, audio is excluded for webcam videos and included for uploaded videos.
            autoplay: Whether to automatically play the video when the component is used as an output. Note: browsers will not autoplay video files if the user has not interacted with the page yet.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
            show_download_button: If True, will show a download icon in the corner of the component that allows user to download the output. If False, icon does not appear. By default, it will be True for output components and False for input components.
            min_length: The minimum length of video (in seconds) that the user can pass into the prediction function. If None, there is no minimum length.
            max_length: The maximum length of video (in seconds) that the user can pass into the prediction function. If None, there is no maximum length.
        """
        valid_sources: list[Literal["upload", "webcam"]] = ["upload", "webcam"]
        if sources is None:
            self.sources = valid_sources
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
        self.format = format
        self.autoplay = autoplay
        self.height = height
        self.width = width
        self.mirror_webcam = mirror_webcam
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
            render=render,
            value=value,
        )

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
        flip = self.sources == ["webcam"] and self.mirror_webcam

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
            ff = FFmpeg(
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
            ff = FFmpeg(
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
        if value is None or value == [None, None] or value == (None, None):
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
        Processes a video to ensure that it is in the correct format.
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

        # For cases where the video is a URL and does not need to be converted to another format, we can just return the URL
        if is_url and not (conversion_needed):
            return FileData(path=video)

        # For cases where the video needs to be converted to another format
        if is_url:
            video = processing_utils.save_url_to_cache(
                video, cache_dir=self.GRADIO_CACHE
            )
        if (
            processing_utils.ffmpeg_installed()
            and not processing_utils.video_is_playable(video)
        ):
            warnings.warn(
                "Video does not have browser-compatible container or codec. Converting to mp4"
            )
            video = processing_utils.convert_video_to_playable_mp4(video)
        # Recalculate the format in case convert_video_to_playable_mp4 already made it the selected format
        returned_format = utils.get_extension_from_file_path_or_url(video).lower()
        if self.format is not None and returned_format != self.format:
            if wasm_utils.IS_WASM:
                raise wasm_utils.WasmUnsupportedError(
                    "Returning a video in a different format is not supported in the Wasm mode."
                )
            output_file_name = video[0 : video.rindex(".") + 1] + self.format
            ff = FFmpeg(
                inputs={video: None},
                outputs={output_file_name: None},
                global_options="-y",
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
            with open(srt_file_path, encoding="utf-8") as srt_file, open(
                vtt_file_path, "w", encoding="utf-8"
            ) as vtt_file:
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
            "video": file(
                "https://github.com/gradio-app/gradio/raw/main/demo/video_component/files/world.mp4"
            ),
        }

    def example_value(self) -> Any:
        return "https://github.com/gradio-app/gradio/raw/main/demo/video_component/files/world.mp4"
