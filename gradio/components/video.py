"""gr.Video() component."""

from __future__ import annotations

import tempfile
import warnings
from pathlib import Path
from typing import Callable, Literal

from gradio_client import utils as client_utils
from gradio_client.data_classes import FileData
from gradio_client.documentation import document, set_documentation_group
from gradio_client.serializing import VideoSerializable

from gradio import processing_utils, utils, wasm_utils
from gradio.components.base import IOComponent, _Keywords
from gradio.deprecation import warn_style_method_deprecation
from gradio.events import Changeable, Clearable, Playable, Recordable, Uploadable

if not wasm_utils.IS_WASM:
    # TODO: Support ffmpeg on Wasm
    from ffmpy import FFmpeg

set_documentation_group("component")


@document()
class Video(
    Changeable,
    Clearable,
    Playable,
    Recordable,
    Uploadable,
    IOComponent,
    VideoSerializable,
):
    """
    Creates a video component that can be used to upload/record videos (as an input) or display videos (as an output).
    For the video to be playable in the browser it must have a compatible container and codec combination. Allowed
    combinations are .mp4 with h264 codec, .ogg with theora codec, and .webm with vp9 codec. If the component detects
    that the output video would not be playable in the browser it will attempt to convert it to a playable mp4 video.
    If the conversion fails, the original video is returned.
    Preprocessing: passes the uploaded video as a {str} filepath or URL whose extension can be modified by `format`.
    Postprocessing: expects a {str} or {pathlib.Path} filepath to a video which is displayed, or a {Tuple[str | pathlib.Path, str | pathlib.Path | None]} where the first element is a filepath to a video and the second element is an optional filepath to a subtitle file.
    Examples-format: a {str} filepath to a local file that contains the video, or a {Tuple[str, str]} where the first element is a filepath to a video file and the second element is a filepath to a subtitle file.
    Demos: video_identity, video_subtitle
    """

    def __init__(
        self,
        value: str
        | Path
        | tuple[str | Path, str | Path | None]
        | Callable
        | None = None,
        *,
        format: str | None = None,
        source: Literal["upload", "webcam"] = "upload",
        height: int | None = None,
        width: int | None = None,
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
        mirror_webcam: bool = True,
        include_audio: bool | None = None,
        autoplay: bool = False,
        show_share_button: bool | None = None,
        **kwargs,
    ):
        """
        Parameters:
            value: A path or URL for the default value that Video component is going to take. Can also be a tuple consisting of (video filepath, subtitle filepath). If a subtitle file is provided, it should be of type .srt or .vtt. Or can be callable, in which case the function will be called whenever the app loads to set the initial value of the component.
            format: Format of video format to be returned by component, such as 'avi' or 'mp4'. Use 'mp4' to ensure browser playability. If set to None, video will keep uploaded format.
            source: Source of video. "upload" creates a box where user can drop an video file, "webcam" allows user to record a video from their webcam.
            height: Height of the displayed video in pixels.
            width: Width of the displayed video in pixels.
            label: component name in interface.
            every: If `value` is a callable, run the function 'every' number of seconds while the client connection is open. Has no effect otherwise. Queue must be enabled. The event can be accessed (e.g. to cancel it) via this component's .load_event attribute.
            show_label: if True, will display label.
            container: If True, will place the component in a container - providing some extra padding around the border.
            scale: relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.
            min_width: minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.
            interactive: if True, will allow users to upload a video; if False, can only be used to display videos. If not provided, this is inferred based on whether the component is used as an input or output.
            visible: If False, component will be hidden.
            elem_id: An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.
            elem_classes: An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.
            mirror_webcam: If True webcam will be mirrored. Default is True.
            include_audio: Whether the component should record/retain the audio track for a video. By default, audio is excluded for webcam videos and included for uploaded videos.
            autoplay: Whether to automatically play the video when the component is used as an output. Note: browsers will not autoplay video files if the user has not interacted with the page yet.
            show_share_button: If True, will show a share icon in the corner of the component that allows user to share outputs to Hugging Face Spaces Discussions. If False, icon does not appear. If set to None (default behavior), then the icon appears if this Gradio app is launched on Spaces, but not otherwise.
        """
        self.format = format
        self.autoplay = autoplay
        valid_sources = ["upload", "webcam"]
        if source not in valid_sources:
            raise ValueError(
                f"Invalid value for parameter `source`: {source}. Please choose from one of: {valid_sources}"
            )
        self.source = source
        self.height = height
        self.width = width
        self.mirror_webcam = mirror_webcam
        self.include_audio = (
            include_audio if include_audio is not None else source == "upload"
        )
        self.show_share_button = (
            (utils.get_space() is not None)
            if show_share_button is None
            else show_share_button
        )
        IOComponent.__init__(
            self,
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

    def get_config(self):
        return {
            "source": self.source,
            "value": self.value,
            "height": self.height,
            "width": self.width,
            "mirror_webcam": self.mirror_webcam,
            "include_audio": self.include_audio,
            "autoplay": self.autoplay,
            "show_share_button": self.show_share_button,
            **IOComponent.get_config(self),
        }

    @staticmethod
    def update(
        value: str
        | tuple[str, str | None]
        | Literal[_Keywords.NO_VALUE]
        | None = _Keywords.NO_VALUE,
        source: Literal["upload", "webcam"] | None = None,
        height: int | None = None,
        width: int | None = None,
        label: str | None = None,
        show_label: bool | None = None,
        container: bool | None = None,
        scale: int | None = None,
        min_width: int | None = None,
        interactive: bool | None = None,
        visible: bool | None = None,
        autoplay: bool | None = None,
        show_share_button: bool | None = None,
    ):
        return {
            "source": source,
            "height": height,
            "width": width,
            "label": label,
            "show_label": show_label,
            "container": container,
            "scale": scale,
            "min_width": min_width,
            "interactive": interactive,
            "visible": visible,
            "value": value,
            "autoplay": autoplay,
            "show_share_button": show_share_button,
            "__type__": "update",
        }

    def preprocess(
        self, x: tuple[FileData, FileData | None] | FileData | None
    ) -> str | None:
        """
        Parameters:
            x: A tuple of (video file data, subtitle file data) or just video file data.
        Returns:
            A string file path or URL to the preprocessed video. Subtitle file data is ignored.
        """
        if x is None:
            return None
        elif isinstance(x, dict):
            video = x
        else:
            video = x[0]

        file_name, file_data, is_file = (
            video.get("name"),
            video["data"],
            video.get("is_file", False),
        )

        if is_file:
            assert file_name is not None, "Received file data without a file name."
            if client_utils.is_http_url_like(file_name):
                fn = self.download_temp_copy_if_needed
            else:
                fn = self.make_temp_copy_if_needed
            file_name = Path(fn(file_name))
        else:
            assert file_data is not None, "Received empty file data."
            file_name = Path(self.base64_to_temp_file_if_needed(file_data, file_name))

        uploaded_format = file_name.suffix.replace(".", "")
        needs_formatting = self.format is not None and uploaded_format != self.format
        flip = self.source == "webcam" and self.mirror_webcam

        if needs_formatting or flip:
            format = f".{self.format if needs_formatting else uploaded_format}"
            output_options = ["-vf", "hflip", "-c:a", "copy"] if flip else []
            output_options += ["-an"] if not self.include_audio else []
            flip_suffix = "_flip" if flip else ""
            output_file_name = str(
                file_name.with_name(f"{file_name.stem}{flip_suffix}{format}")
            )
            if Path(output_file_name).exists():
                return output_file_name
            if wasm_utils.IS_WASM:
                raise wasm_utils.WasmUnsupportedError(
                    "Video formatting is not supported in the Wasm mode."
                )
            ff = FFmpeg(
                inputs={str(file_name): None},
                outputs={output_file_name: output_options},
            )
            ff.run()
            return output_file_name
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
        self, y: str | Path | tuple[str | Path, str | Path | None] | None
    ) -> tuple[FileData | None, FileData | None] | None:
        """
        Processes a video to ensure that it is in the correct format before returning it to the front end.
        Parameters:
            y: video data in either of the following formats: a tuple of (video filepath, optional subtitle filepath), or just a filepath or URL to an video file, or None.
        Returns:
            a tuple with the two dictionary, reresent to video and (optional) subtitle, which following formats:
            - The first dictionary represents the video file and contains the following keys:
                - 'name': a file path to a temporary copy of the processed video.
                - 'data': None
                - 'is_file': True
            - The second dictionary represents the subtitle file and contains the following keys:
                - 'name': None
                - 'data': Base64 encode the processed subtitle data.
                - 'is_file': False
            - If subtitle is None, returns (video, None).
            - If both video and subtitle are None, returns None.
        """

        if y is None or y == [None, None] or y == (None, None):
            return None
        if isinstance(y, (str, Path)):
            processed_files = (self._format_video(y), None)
        elif isinstance(y, (tuple, list)):
            assert (
                len(y) == 2
            ), f"Expected lists of length 2 or tuples of length 2. Received: {y}"
            assert isinstance(y[0], (str, Path)) and isinstance(
                y[1], (str, Path)
            ), f"If a tuple is provided, both elements must be strings or Path objects. Received: {y}"
            video = y[0]
            subtitle = y[1]
            processed_files = (
                self._format_video(video),
                self._format_subtitle(subtitle),
            )
        else:
            raise Exception(f"Cannot process type as video: {type(y)}")

        return processed_files

    def _format_video(self, video: str | Path | None) -> FileData | None:
        """
        Processes a video to ensure that it is in the correct format.
        Parameters:
            video: video data in either of the following formats: a string filepath or URL to an video file, or None.
        Returns:
            a dictionary with the following keys:

            - 'name': a file path to a temporary copy of the processed video.
            - 'data': None
            - 'is_file': True
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
            return {"name": video, "data": None, "is_file": True}

        # For cases where the video needs to be converted to another format
        if is_url:
            video = self.download_temp_copy_if_needed(video)
        if (
            processing_utils.ffmpeg_installed()
            and not processing_utils.video_is_playable(video)
        ):
            warnings.warn(
                "Video does not have browser-compatible container or codec. Converting to mp4"
            )
            video = processing_utils.convert_video_to_playable_mp4(video)
        # Recalculate the format in case convert_video_to_playable_mp4 already made it the
        # selected format
        returned_format = video.split(".")[-1].lower()
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

        video = self.make_temp_copy_if_needed(video)

        return {
            "name": video,
            "data": None,
            "is_file": True,
            "orig_name": Path(video).name,
        }

    def _format_subtitle(self, subtitle: str | Path | None) -> FileData | None:
        """
        Convert subtitle format to VTT and process the video to ensure it meets the HTML5 requirements.
        Parameters:
            subtitle: subtitle path in either of the VTT and SRT format.
        Returns:
            a dictionary with the following keys:
            - 'name': None
            - 'data': base64-encoded subtitle data.
            - 'is_file': False
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
                delete=False, suffix=".vtt", dir=self.DEFAULT_TEMP_DIR
            )

            srt_to_vtt(subtitle, temp_file.name)
            subtitle = temp_file.name

        subtitle_data = client_utils.encode_url_or_file_to_base64(subtitle)
        return {"name": None, "data": subtitle_data, "is_file": False}

    def style(self, *, height: int | None = None, width: int | None = None, **kwargs):
        """
        This method is deprecated. Please set these arguments in the constructor instead.
        """
        warn_style_method_deprecation()
        if height is not None:
            self.height = height
        if width is not None:
            self.width = width
        return self
