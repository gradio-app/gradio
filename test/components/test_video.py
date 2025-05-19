import os
import shutil
import tempfile
from copy import deepcopy
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from gradio_client import media_data

import gradio as gr
from gradio import processing_utils
from gradio.components.video import VideoData
from gradio.data_classes import FileData


class TestVideo:
    @pytest.mark.asyncio
    async def test_component_functions(self):
        """
        Preprocess, serialize, deserialize, get_config
        """
        x_video = VideoData(
            video=FileData(path=deepcopy(media_data.BASE64_VIDEO)["path"])
        )
        video_input = gr.Video()

        x_video = await processing_utils.async_move_files_to_cache(
            [x_video], video_input
        )
        x_video = x_video[0]

        output1 = video_input.preprocess(x_video)
        assert isinstance(output1, str)
        output2 = video_input.preprocess(x_video)
        assert output1 == output2

        video_input = gr.Video(include_audio=False)
        output1 = video_input.preprocess(x_video)
        output2 = video_input.preprocess(x_video)
        assert output1 == output2

        video_input = gr.Video(label="Upload Your Video")
        assert video_input.get_config() == {
            "autoplay": False,
            "sources": ["upload", "webcam"],
            "name": "video",
            "show_share_button": False,
            "show_label": True,
            "label": "Upload Your Video",
            "container": True,
            "min_width": 160,
            "scale": None,
            "show_download_button": None,
            "height": None,
            "width": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "webcam_options": {"constraints": None, "mirror": True},
            "include_audio": True,
            "format": None,
            "min_length": None,
            "max_length": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "loop": False,
            "streaming": False,
            "watermark": None,
        }
        assert video_input.preprocess(None) is None
        video_input = gr.Video(format="avi")
        output_video = video_input.preprocess(x_video)
        assert output_video
        assert output_video[-3:] == "avi"
        assert "flip" not in output_video

        # Output functionalities
        y_vid_path = "test/test_files/video_sample.mp4"
        subtitles_path = "test/test_files/s1.srt"
        video_output = gr.Video()
        output1 = video_output.postprocess(y_vid_path)
        assert output1
        output1 = output1.model_dump()["video"]["path"]
        assert output1.endswith("mp4")
        output2 = video_output.postprocess(y_vid_path)
        assert output2
        output2 = output2.model_dump()["video"]["path"]
        assert output1 == output2
        output3 = video_output.postprocess(y_vid_path)
        assert output3
        assert output3.model_dump()["video"]["orig_name"] == "video_sample.mp4"
        output_with_subtitles = video_output.postprocess((y_vid_path, subtitles_path))
        assert output_with_subtitles
        output_with_subtitles = output_with_subtitles.model_dump()
        assert output_with_subtitles["subtitles"]["path"].endswith(".vtt")

        video = gr.Video(format="wav")
        video_url_with_query_param = "https://github.com/gradio-app/gradio/raw/refs/heads/main/test/test_files/playable_but_bad_container.mp4?query=fake"
        postprocessed_video_with_query_param = video.postprocess(
            video_url_with_query_param
        )
        assert postprocessed_video_with_query_param
        assert postprocessed_video_with_query_param.model_dump()["video"][
            "path"
        ].endswith("playable_but_bad_container.wav")

        p_video = gr.Video()
        video_with_subtitle = gr.Video()
        postprocessed_video = p_video.postprocess(Path(y_vid_path))
        assert postprocessed_video

        postprocessed_video = postprocessed_video.model_dump()
        postprocessed_video_with_subtitle = video_with_subtitle.postprocess(
            (Path(y_vid_path), Path(subtitles_path))
        )
        assert postprocessed_video_with_subtitle
        postprocessed_video_with_subtitle = (
            postprocessed_video_with_subtitle.model_dump()
        )

        processed_video = {
            "video": {
                "path": "video_sample.mp4",
                "orig_name": "video_sample.mp4",
                "mime_type": None,
                "size": None,
                "url": None,
                "is_stream": False,
                "meta": {"_type": "gradio.FileData"},
            },
            "subtitles": None,
        }

        processed_video_with_subtitle = {
            "video": {
                "path": "video_sample.mp4",
                "orig_name": "video_sample.mp4",
                "mime_type": None,
                "size": None,
                "url": None,
                "is_stream": False,
                "meta": {"_type": "gradio.FileData"},
            },
            "subtitles": {
                "path": "s1.srt",
                "mime_type": None,
                "orig_name": None,
                "size": None,
                "url": None,
                "is_stream": False,
                "meta": {"_type": "gradio.FileData"},
            },
        }
        postprocessed_video["video"]["path"] = os.path.basename(
            postprocessed_video["video"]["path"]
        )
        assert processed_video == postprocessed_video
        postprocessed_video_with_subtitle["video"]["path"] = os.path.basename(
            postprocessed_video_with_subtitle["video"]["path"]
        )
        if postprocessed_video_with_subtitle["subtitles"]["path"]:
            postprocessed_video_with_subtitle["subtitles"]["path"] = "s1.srt"
        assert processed_video_with_subtitle == postprocessed_video_with_subtitle

    def test_in_interface(self):
        """
        Interface, process
        """
        x_video = media_data.BASE64_VIDEO["path"]
        iface = gr.Interface(lambda x: x, "video", "playable_video")
        assert iface({"video": x_video})["video"].endswith(".mp4")

    def test_video_postprocess_converts_to_playable_format(self):
        test_file_dir = Path(__file__).parent.parent / "test_files"
        # This file has a playable container but not playable codec
        with tempfile.NamedTemporaryFile(
            suffix="bad_video.mp4", delete=False
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "bad_video_sample.mp4")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            output = gr.Video().postprocess(tmp_not_playable_vid.name)
            assert output
            output = output.model_dump()
            assert processing_utils.video_is_playable(output["video"]["path"])

        # This file has a playable codec but not a playable container
        with tempfile.NamedTemporaryFile(
            suffix="playable_but_bad_container.mkv", delete=False
        ) as tmp_not_playable_vid:
            bad_vid = str(test_file_dir / "playable_but_bad_container.mkv")
            assert not processing_utils.video_is_playable(bad_vid)
            shutil.copy(bad_vid, tmp_not_playable_vid.name)
            output = gr.Video().postprocess(tmp_not_playable_vid.name)
            assert output
            output = output.model_dump()
            assert processing_utils.video_is_playable(output["video"]["path"])

    @patch("pathlib.Path.exists", MagicMock(return_value=False))
    @patch("gradio.components.video.FFmpeg")
    def test_video_preprocessing_flips_video_for_webcam(self, mock_ffmpeg):
        # Ensures that the cached temp video file is not used so that ffmpeg is called for each test
        x_video = VideoData(video=FileData(path=media_data.BASE64_VIDEO["path"]))
        video_input = gr.Video(sources=["webcam"])
        _ = video_input.preprocess(x_video)

        # Dict mapping filename to FFmpeg options
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert "hflip" in list(output_params.values())[0]
        assert "flip" in list(output_params.keys())[0]

        mock_ffmpeg.reset_mock()
        _ = gr.Video(
            sources=["webcam"],
            webcam_options=gr.WebcamOptions(mirror=False),
            include_audio=True,
        ).preprocess(x_video)
        mock_ffmpeg.assert_not_called()

        mock_ffmpeg.reset_mock()
        _ = gr.Video(sources=["upload"], format="mp4", include_audio=True).preprocess(
            x_video
        )
        mock_ffmpeg.assert_not_called()

        mock_ffmpeg.reset_mock()
        output_file = gr.Video(
            sources=["webcam"],
            webcam_options=gr.WebcamOptions(mirror=True),
            format="avi",
        ).preprocess(x_video)
        assert output_file
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert "hflip" in list(output_params.values())[0]
        assert "flip" in list(output_params.keys())[0]
        assert ".avi" in list(output_params.keys())[0]
        assert ".avi" in output_file

        mock_ffmpeg.reset_mock()
        output_file = gr.Video(
            sources=["webcam"],
            webcam_options=gr.WebcamOptions(mirror=False),
            format="avi",
            include_audio=False,
        ).preprocess(x_video)
        assert output_file
        output_params = mock_ffmpeg.call_args_list[0][1]["outputs"]
        assert list(output_params.values())[0] == ["-an"]
        assert "flip" not in Path(list(output_params.keys())[0]).name
        assert ".avi" in list(output_params.keys())[0]
        assert ".avi" in output_file
