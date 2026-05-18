from pathlib import Path

import numpy as np
import PIL.Image
import pytest

from gradio.components.video_editor import VideoEditor, VideoEditorData
from gradio.data_classes import FileData
from gradio.exceptions import Error


VIDEO_PATH = "test/test_files/playable_but_bad_container.mp4"
MASK_PNG = "test/test_files/bus.png"


class TestVideoEditor:
    def test_data_model_video_required(self):
        data = VideoEditorData(video=FileData(path="video.mp4"))
        assert data.video.path == "video.mp4"
        assert data.mask is None

    def test_data_model_with_mask(self):
        data = VideoEditorData(
            video=FileData(path="video.mp4"),
            mask=FileData(path="mask.png"),
        )
        assert data.mask is not None
        assert data.mask.path == "mask.png"

    def test_default_init(self):
        comp = VideoEditor()
        assert comp.brush_color == "rgba(255, 0, 0, 0.5)"
        assert comp.brush_size == 20
        assert comp.height is None
        assert comp.sources == ["upload"]

    def test_custom_brush(self):
        comp = VideoEditor(brush_color="rgba(0,255,0,0.8)", brush_size=40)
        assert comp.brush_color == "rgba(0,255,0,0.8)"
        assert comp.brush_size == 40

    def test_events(self):
        comp = VideoEditor()
        event_names = [e.event_name for e in comp.EVENTS]
        assert event_names == ["change", "upload", "clear"]

    def test_get_config(self):
        comp = VideoEditor(brush_color="rgba(0,0,255,1)", brush_size=15, height=480)
        config = comp.get_config()
        assert config["brush_color"] == "rgba(0,0,255,1)"
        assert config["brush_size"] == 15
        assert config["height"] == 480
        assert config["name"] == "videoeditor"

    def test_preprocess_none(self):
        assert VideoEditor().preprocess(None) is None

    def test_preprocess_video_only(self):
        result = VideoEditor().preprocess(
            VideoEditorData(video=FileData(path=VIDEO_PATH))
        )
        assert result == {"video": VIDEO_PATH, "mask": None}

    def test_preprocess_video_with_mask(self):
        payload = VideoEditorData(
            video=FileData(path=VIDEO_PATH),
            mask=FileData(path=MASK_PNG),
        )
        result = VideoEditor().preprocess(payload)
        assert result["video"] == VIDEO_PATH
        assert isinstance(result["mask"], np.ndarray)
        assert result["mask"].shape[2] == 4  # RGBA

    def test_preprocess_invalid_mask_file_raises_error(self, tmp_path):
        bad_mask = tmp_path / "not_an_image.png"
        bad_mask.write_bytes(b"this is not a PNG")
        payload = VideoEditorData(
            video=FileData(path=VIDEO_PATH),
            mask=FileData(path=str(bad_mask)),
        )
        with pytest.raises(Error, match="Could not read mask image"):
            VideoEditor().preprocess(payload)

    def test_preprocess_missing_mask_file_raises_error(self):
        payload = VideoEditorData(
            video=FileData(path=VIDEO_PATH),
            mask=FileData(path="/nonexistent/path/mask.png"),
        )
        with pytest.raises(Error, match="Could not read mask image"):
            VideoEditor().preprocess(payload)

    def test_postprocess_none(self):
        assert VideoEditor().postprocess(None) is None

    def test_postprocess_string_path(self):
        result = VideoEditor().postprocess(VIDEO_PATH)
        assert isinstance(result, VideoEditorData)
        assert result.video.path == VIDEO_PATH
        assert result.mask is None

    def test_postprocess_path_object(self):
        result = VideoEditor().postprocess(Path(VIDEO_PATH))
        assert result.video.path == VIDEO_PATH

    def test_postprocess_dict_video_only(self):
        result = VideoEditor().postprocess({"video": VIDEO_PATH})
        assert result.video.path == VIDEO_PATH
        assert result.mask is None

    def test_postprocess_dict_missing_video(self):
        assert VideoEditor().postprocess({"video": None}) is None

    def test_postprocess_numpy_mask(self):
        mask = np.zeros((100, 100, 4), dtype=np.uint8)
        mask[40:60, 40:60] = [255, 0, 0, 180]
        result = VideoEditor().postprocess({"video": VIDEO_PATH, "mask": mask})
        assert result.mask is not None
        assert result.mask.path.endswith(".png")

    def test_postprocess_pil_mask(self):
        img = PIL.Image.fromarray(np.zeros((50, 50, 4), dtype=np.uint8), "RGBA")
        result = VideoEditor().postprocess({"video": VIDEO_PATH, "mask": img})
        assert result.mask.path.endswith(".png")

    def test_postprocess_path_mask_is_reused(self):
        result = VideoEditor().postprocess(
            {"video": VIDEO_PATH, "mask": MASK_PNG}
        )
        assert result.mask.path == MASK_PNG

    def test_roundtrip(self):
        comp = VideoEditor()
        mask = np.zeros((100, 200, 4), dtype=np.uint8)
        mask[20:80, 50:150] = [255, 0, 0, 255]
        post = comp.postprocess({"video": VIDEO_PATH, "mask": mask})
        pre = comp.preprocess(post)
        assert pre["video"] == VIDEO_PATH
        assert isinstance(pre["mask"], np.ndarray)
        assert pre["mask"].shape[2] == 4

    def test_example_payload(self):
        payload = VideoEditor().example_payload()
        assert isinstance(payload["video"], dict)
        assert payload["video"].get("meta", {}).get("_type") == "gradio.FileData"
        assert payload["mask"] is None

    def test_example_value(self):
        value = VideoEditor().example_value()
        assert isinstance(value["video"], str)
        assert value["mask"] is None
