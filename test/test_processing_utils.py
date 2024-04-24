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

from gradio import processing_utils, utils


class TestTempFileManagement:
    def test_hash_file(self):
        h1 = processing_utils.hash_file("gradio/test_data/cheetah1.jpg")
        h2 = processing_utils.hash_file("gradio/test_data/cheetah1-copy.jpg")
        h3 = processing_utils.hash_file("gradio/test_data/cheetah2.jpg")
        assert h1 == h2
        assert h1 != h3

    def test_make_temp_copy_if_needed(self, gradio_temp_dir):
        f = processing_utils.save_file_to_cache(
            "gradio/test_data/cheetah1.jpg", cache_dir=gradio_temp_dir
        )
        try:  # Delete if already exists from before this test
            os.remove(f)
        except OSError:
            pass

        f = processing_utils.save_file_to_cache(
            "gradio/test_data/cheetah1.jpg", cache_dir=gradio_temp_dir
        )
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        assert Path(f).name == "cheetah1.jpg"

        f = processing_utils.save_file_to_cache(
            "gradio/test_data/cheetah1.jpg", cache_dir=gradio_temp_dir
        )
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        f = processing_utils.save_file_to_cache(
            "gradio/test_data/cheetah1-copy.jpg", cache_dir=gradio_temp_dir
        )
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 2
        assert Path(f).name == "cheetah1-copy.jpg"

    def test_save_b64_to_cache(self, gradio_temp_dir):
        base64_file_1 = media_data.BASE64_IMAGE
        base64_file_2 = media_data.BASE64_AUDIO["data"]

        f = processing_utils.save_base64_to_cache(
            base64_file_1, cache_dir=gradio_temp_dir
        )
        try:  # Delete if already exists from before this test
            os.remove(f)
        except OSError:
            pass

        f = processing_utils.save_base64_to_cache(
            base64_file_1, cache_dir=gradio_temp_dir
        )
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        f = processing_utils.save_base64_to_cache(
            base64_file_1, cache_dir=gradio_temp_dir
        )
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        f = processing_utils.save_base64_to_cache(
            base64_file_2, cache_dir=gradio_temp_dir
        )
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 2

    @pytest.mark.flaky
    def test_save_url_to_cache(self, gradio_temp_dir):
        url1 = "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/test_image.png"
        url2 = "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/cheetah1.jpg"

        f = processing_utils.save_url_to_cache(url1, cache_dir=gradio_temp_dir)
        try:  # Delete if already exists from before this test
            os.remove(f)
        except OSError:
            pass

        f = processing_utils.save_url_to_cache(url1, cache_dir=gradio_temp_dir)
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        f = processing_utils.save_url_to_cache(url1, cache_dir=gradio_temp_dir)
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        f = processing_utils.save_url_to_cache(url2, cache_dir=gradio_temp_dir)
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 2

    @pytest.mark.flaky
    def test_save_url_to_cache_with_redirect(self, gradio_temp_dir):
        url = "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/bread_small.png"
        processing_utils.save_url_to_cache(url, cache_dir=gradio_temp_dir)
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1


class TestImagePreprocessing:
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

    def test_save_pil_to_file_keeps_pnginfo(self, gradio_temp_dir):
        input_img = Image.open("gradio/test_data/test_image.png")
        input_img = input_img.convert("RGB")
        input_img.info = {"key1": "value1", "key2": "value2"}
        input_img.save(gradio_temp_dir / "test_test_image.png")

        file_obj = processing_utils.save_pil_to_cache(
            input_img, cache_dir=gradio_temp_dir, format="png"
        )
        output_img = Image.open(file_obj)

        assert output_img.info == input_img.info

    def test_np_pil_encode_to_the_same(self, gradio_temp_dir):
        arr = np.random.randint(0, 255, size=(100, 100, 3), dtype=np.uint8)
        pil = Image.fromarray(arr)
        assert processing_utils.save_pil_to_cache(
            pil, cache_dir=gradio_temp_dir
        ) == processing_utils.save_img_array_to_cache(arr, cache_dir=gradio_temp_dir)

    def test_encode_pil_to_temp_file_metadata_color_profile(self, gradio_temp_dir):
        # Read image
        img = Image.open("gradio/test_data/test_image.png")
        img_metadata = Image.open("gradio/test_data/test_image.png")
        img_metadata.info = {"key1": "value1", "key2": "value2"}

        # Creating sRGB profile
        profile = ImageCms.createProfile("sRGB")
        profile2 = ImageCms.ImageCmsProfile(profile)
        img.save(
            gradio_temp_dir / "img_color_profile.png", icc_profile=profile2.tobytes()
        )
        img_cp1 = Image.open(str(gradio_temp_dir / "img_color_profile.png"))

        # Creating XYZ profile
        profile = ImageCms.createProfile("XYZ")
        profile2 = ImageCms.ImageCmsProfile(profile)
        img.save(
            gradio_temp_dir / "img_color_profile_2.png", icc_profile=profile2.tobytes()
        )
        img_cp2 = Image.open(str(gradio_temp_dir / "img_color_profile_2.png"))

        img_path = processing_utils.save_pil_to_cache(
            img, cache_dir=gradio_temp_dir, format="png"
        )
        img_metadata_path = processing_utils.save_pil_to_cache(
            img_metadata, cache_dir=gradio_temp_dir, format="png"
        )
        img_cp1_path = processing_utils.save_pil_to_cache(
            img_cp1, cache_dir=gradio_temp_dir, format="png"
        )
        img_cp2_path = processing_utils.save_pil_to_cache(
            img_cp2, cache_dir=gradio_temp_dir, format="png"
        )

        assert len({img_path, img_metadata_path, img_cp1_path, img_cp2_path}) == 4

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


def test_add_root_url():
    data = {
        "file": {
            "path": "path",
            "url": "/file=path",
            "meta": {"_type": "gradio.FileData"},
        },
        "file2": {
            "path": "path2",
            "url": "https://www.gradio.app",
            "meta": {"_type": "gradio.FileData"},
        },
    }
    root_url = "http://localhost:7860"
    expected = {
        "file": {
            "path": "path",
            "url": f"{root_url}/file=path",
            "meta": {"_type": "gradio.FileData"},
        },
        "file2": {
            "path": "path2",
            "url": "https://www.gradio.app",
            "meta": {"_type": "gradio.FileData"},
        },
    }
    assert processing_utils.add_root_url(data, root_url, None) == expected
    new_root_url = "https://1234.gradio.live"
    new_expected = {
        "file": {
            "path": "path",
            "url": f"{new_root_url}/file=path",
            "meta": {"_type": "gradio.FileData"},
        },
        "file2": {
            "path": "path2",
            "url": "https://www.gradio.app",
            "meta": {"_type": "gradio.FileData"},
        },
    }
    assert (
        processing_utils.add_root_url(expected, new_root_url, root_url) == new_expected
    )


def test_hash_url_encodes_url():
    assert processing_utils.hash_url(
        "https://www.gradio.app/image 1.jpg"
    ) == processing_utils.hash_bytes(b"https://www.gradio.app/image 1.jpg")
