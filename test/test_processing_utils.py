import base64
import io
import logging
import os
import shutil
import tempfile
from copy import deepcopy
from pathlib import Path
from unittest.mock import patch

import ffmpy
import numpy as np
import pytest
from gradio_client import media_data
from PIL import Image, ImageCms

from gradio import components, processing_utils, utils


class TestImagePreprocessing:
    def test_decode_base64_to_image(self):
        output_image = processing_utils.decode_base64_to_image(
            deepcopy(media_data.BASE64_IMAGE)
        )
        assert isinstance(output_image, Image.Image)

        b64_img_without_header = deepcopy(media_data.BASE64_IMAGE).split(",")[1]
        output_image_without_header = processing_utils.decode_base64_to_image(
            b64_img_without_header
        )

        assert output_image == output_image_without_header

    def test_encode_plot_to_base64(self):
        with utils.MatplotlibBackendMananger():
            import matplotlib.pyplot as plt

            plt.plot([1, 2, 3, 4])
            output_base64 = processing_utils.encode_plot_to_base64(plt)
        assert output_base64.startswith(
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAo"
        )

    def test_encode_array_to_base64(self):
        img = Image.open("gradio/test_data/test_image.png")
        img = img.convert("RGB")
        numpy_data = np.asarray(img, dtype=np.uint8)
        output_base64 = processing_utils.encode_array_to_base64(numpy_data)
        assert output_base64 == deepcopy(media_data.ARRAY_TO_BASE64_IMAGE)

    def test_encode_pil_to_base64(self):
        img = Image.open("gradio/test_data/test_image.png")
        img = img.convert("RGB")
        img.info = {}  # Strip metadata
        output_base64 = processing_utils.encode_pil_to_base64(img)
        assert output_base64 == deepcopy(media_data.ARRAY_TO_BASE64_IMAGE)

    def test_save_pil_to_file_keeps_pnginfo(self, tmp_path):
        input_img = Image.open("gradio/test_data/test_image.png")
        input_img = input_img.convert("RGB")
        input_img.info = {"key1": "value1", "key2": "value2"}

        file_obj = components.Image().pil_to_temp_file(input_img, dir=tmp_path)
        output_img = Image.open(file_obj)

        assert output_img.info == input_img.info

    def test_np_pil_encode_to_the_same(self, tmp_path):
        arr = np.random.randint(0, 255, size=(100, 100, 3), dtype=np.uint8)
        pil = Image.fromarray(arr)
        comp = components.Image()
        assert comp.pil_to_temp_file(pil, dir=tmp_path) == comp.img_array_to_temp_file(
            arr, dir=tmp_path
        )

    def test_encode_pil_to_temp_file_metadata_color_profile(self, tmp_path):
        # Read image
        img = Image.open("gradio/test_data/test_image.png")
        img_metadata = Image.open("gradio/test_data/test_image.png")
        img_metadata.info = {"key1": "value1", "key2": "value2"}

        # Creating sRGB profile
        profile = ImageCms.createProfile("sRGB")
        profile2 = ImageCms.ImageCmsProfile(profile)
        img.save(tmp_path / "img_color_profile.png", icc_profile=profile2.tobytes())
        img_cp1 = Image.open(str(tmp_path / "img_color_profile.png"))

        # Creating XYZ profile
        profile = ImageCms.createProfile("XYZ")
        profile2 = ImageCms.ImageCmsProfile(profile)
        img.save(tmp_path / "img_color_profile_2.png", icc_profile=profile2.tobytes())
        img_cp2 = Image.open(str(tmp_path / "img_color_profile_2.png"))

        comp = components.Image()
        img_path = comp.pil_to_temp_file(img, dir=tmp_path)
        img_metadata_path = comp.pil_to_temp_file(img_metadata, dir=tmp_path)
        img_cp1_path = comp.pil_to_temp_file(img_cp1, dir=tmp_path)
        img_cp2_path = comp.pil_to_temp_file(img_cp2, dir=tmp_path)
        assert len({img_path, img_metadata_path, img_cp1_path, img_cp2_path}) == 4

    def test_encode_pil_to_base64_keeps_pnginfo(self):
        input_img = Image.open("gradio/test_data/test_image.png")
        input_img = input_img.convert("RGB")
        input_img.info = {"key1": "value1", "key2": "value2"}

        encoded_image = processing_utils.encode_pil_to_base64(input_img)
        decoded_image = processing_utils.decode_base64_to_image(encoded_image)

        assert decoded_image.info == input_img.info

    @patch("PIL.Image.Image.getexif", return_value={274: 3})
    @patch("PIL.ImageOps.exif_transpose")
    def test_base64_to_image_does_rotation(self, mock_rotate, mock_exif):
        input_img = Image.open("gradio/test_data/test_image.png")
        base64 = processing_utils.encode_pil_to_base64(input_img)
        processing_utils.decode_base64_to_image(base64)
        mock_rotate.assert_called_once()

    def test_resize_and_crop(self):
        img = Image.open("gradio/test_data/test_image.png")
        new_img = processing_utils.resize_and_crop(img, (20, 20))
        assert new_img.size == (20, 20)
        with pytest.raises(ValueError):
            processing_utils.resize_and_crop(
                **{"img": img, "size": (20, 20), "crop_type": "test"}
            )


class TestAudioPreprocessing:
    def test_audio_from_file(self):
        audio = processing_utils.audio_from_file("gradio/test_data/test_audio.wav")
        assert audio[0] == 22050
        assert isinstance(audio[1], np.ndarray)

    def test_audio_to_file(self):
        audio = processing_utils.audio_from_file("gradio/test_data/test_audio.wav")
        processing_utils.audio_to_file(audio[0], audio[1], "test_audio_to_file")
        assert os.path.exists("test_audio_to_file")
        os.remove("test_audio_to_file")

    def test_convert_to_16_bit_wav(self):
        # Generate a random audio sample and set the amplitude
        audio = np.random.randint(-100, 100, size=(100), dtype="int16")
        audio[0] = -32767
        audio[1] = 32766

        audio_ = audio.astype("float64")
        audio_ = processing_utils.convert_to_16_bit_wav(audio_)
        assert np.allclose(audio, audio_)
        assert audio_.dtype == "int16"

        audio_ = audio.astype("float32")
        audio_ = processing_utils.convert_to_16_bit_wav(audio_)
        assert np.allclose(audio, audio_)
        assert audio_.dtype == "int16"

        audio_ = processing_utils.convert_to_16_bit_wav(audio)
        assert np.allclose(audio, audio_)
        assert audio_.dtype == "int16"


class TestOutputPreprocessing:
    float_dtype_list = [
        float,
        float,
        np.double,
        np.single,
        np.float32,
        np.float64,
        "float32",
        "float64",
    ]

    def test_float_conversion_dtype(self):
        """Test any conversion from a float dtype to an other."""

        x = np.array([-1, 1])
        # Test all combinations of dtypes conversions
        dtype_combin = np.array(
            np.meshgrid(
                TestOutputPreprocessing.float_dtype_list,
                TestOutputPreprocessing.float_dtype_list,
            )
        ).T.reshape(-1, 2)

        for dtype_in, dtype_out in dtype_combin:
            x = x.astype(dtype_in)
            y = processing_utils._convert(x, dtype_out)
            assert y.dtype == np.dtype(dtype_out)

    def test_subclass_conversion(self):
        """Check subclass conversion behavior"""
        x = np.array([-1, 1])
        for dtype in TestOutputPreprocessing.float_dtype_list:
            x = x.astype(dtype)
            y = processing_utils._convert(x, np.floating)
            assert y.dtype == x.dtype


class TestVideoProcessing:
    def test_video_has_playable_codecs(self, test_file_dir):
        assert processing_utils.video_is_playable(
            str(test_file_dir / "video_sample.mp4")
        )
        assert processing_utils.video_is_playable(
            str(test_file_dir / "video_sample.ogg")
        )
        assert processing_utils.video_is_playable(
            str(test_file_dir / "video_sample.webm")
        )
        assert not processing_utils.video_is_playable(
            str(test_file_dir / "bad_video_sample.mp4")
        )

    def raise_ffmpy_runtime_exception(*args, **kwargs):
        raise ffmpy.FFRuntimeError("", "", "", "")

    @pytest.mark.parametrize(
        "exception_to_raise", [raise_ffmpy_runtime_exception, KeyError(), IndexError()]
    )
    def test_video_has_playable_codecs_catches_exceptions(
        self, exception_to_raise, test_file_dir
    ):
        with patch(
            "ffmpy.FFprobe.run", side_effect=exception_to_raise
        ), tempfile.NamedTemporaryFile(
            suffix="out.avi", delete=False
        ) as tmp_not_playable_vid:
            shutil.copy(
                str(test_file_dir / "bad_video_sample.mp4"),
                tmp_not_playable_vid.name,
            )
            assert processing_utils.video_is_playable(tmp_not_playable_vid.name)

    def test_convert_video_to_playable_mp4(self, test_file_dir):
        with tempfile.NamedTemporaryFile(
            suffix="out.avi", delete=False
        ) as tmp_not_playable_vid:
            shutil.copy(
                str(test_file_dir / "bad_video_sample.mp4"), tmp_not_playable_vid.name
            )
            with patch("os.remove", wraps=os.remove) as mock_remove:
                playable_vid = processing_utils.convert_video_to_playable_mp4(
                    tmp_not_playable_vid.name
                )
            # check tempfile got deleted
            assert not Path(mock_remove.call_args[0][0]).exists()
            assert processing_utils.video_is_playable(playable_vid)

    @patch("ffmpy.FFmpeg.run", side_effect=raise_ffmpy_runtime_exception)
    def test_video_conversion_returns_original_video_if_fails(
        self, mock_run, test_file_dir
    ):
        with tempfile.NamedTemporaryFile(
            suffix="out.avi", delete=False
        ) as tmp_not_playable_vid:
            shutil.copy(
                str(test_file_dir / "bad_video_sample.mp4"), tmp_not_playable_vid.name
            )
            playable_vid = processing_utils.convert_video_to_playable_mp4(
                tmp_not_playable_vid.name
            )
            # If the conversion succeeded it'd be .mp4
            assert Path(playable_vid).suffix == ".avi"


def test_decode_base64_to_image_does_not_crash_when_image_has_bogus_exif_data(caplog):
    from PIL.PngImagePlugin import PngInfo

    caplog.set_level(logging.WARNING)
    i = Image.new("RGB", (32, 32), "orange")
    bio = io.BytesIO()
    # since `exif` is the `.info` key for EXIF data parsed from a JPEG,
    # adding an iTXt chunk with the same name should trigger the warning
    pi = PngInfo()
    pi.add_text("exif", "bogus")
    i.save(bio, format="png", pnginfo=pi)
    bio.seek(0)
    encoded = base64.b64encode(bio.getvalue()).decode()
    assert processing_utils.decode_base64_to_image(encoded).size == (32, 32)
    assert "Failed to transpose image" in caplog.text
