import hashlib
import json
import os
import shutil
import subprocess
import tempfile
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch

import httpx
import numpy as np
import pytest
from PIL import Image, ImageCms
from pydantic import BaseModel
from pydub import AudioSegment

import gradio as gr
from gradio import components, data_classes, processing_utils, utils
from gradio._vendor import ffmpy
from gradio.context import LocalContext
from gradio.exceptions import InvalidPathError
from gradio.route_utils import API_PREFIX


class TestTempFileManagement:
    def test_hash_file(self):
        from gradio.media import get_image

        h1 = processing_utils.hash_file(get_image("cheetah1.jpg"))
        h2 = processing_utils.hash_file(get_image("cheetah1.jpg"))
        h3 = processing_utils.hash_file("gradio/test_data/cheetah2.jpg")
        assert h1 == h2
        assert h1 != h3

    def test_make_temp_copy_if_needed(self, gradio_temp_dir):
        from gradio.media import get_image

        cheetah_path = get_image("cheetah1.jpg")
        f = processing_utils.save_file_to_cache(cheetah_path, cache_dir=gradio_temp_dir)
        try:  # Delete if already exists from before this test
            os.remove(f)
        except OSError:
            pass

        f = processing_utils.save_file_to_cache(cheetah_path, cache_dir=gradio_temp_dir)
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        assert Path(f).name == "cheetah1.jpg"

        f = processing_utils.save_file_to_cache(cheetah_path, cache_dir=gradio_temp_dir)
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 1

        f = processing_utils.save_file_to_cache(
            "gradio/test_data/cheetah1-copy.jpg", cache_dir=gradio_temp_dir
        )
        assert len([f for f in gradio_temp_dir.glob("**/*") if f.is_file()]) == 2
        assert Path(f).name == "cheetah1-copy.jpg"

    def test_save_b64_to_cache(self, gradio_temp_dir, media_data):
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
    def test_ssrf_protected_download(self, gradio_temp_dir):
        url1 = "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/test_image.png"
        url2 = "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/media_assets/images/cheetah1.jpg"

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
    def test_ssrf_protected_download_with_redirect(self, gradio_temp_dir):
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

    def test_save_pil_to_file_keeps_all_gif_frames(self, gradio_temp_dir):
        input_img = Image.open("gradio/test_data/rectangles.gif")
        file_obj = processing_utils.save_pil_to_cache(
            input_img, cache_dir=gradio_temp_dir, format="gif"
        )
        output_img = Image.open(file_obj)
        assert output_img.n_frames == input_img.n_frames == 3  # type: ignore

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
            processing_utils.resize_and_crop(  # type: ignore
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

    @pytest.mark.parametrize("fmt", ["wav", "mp3", "flac"])
    def test_audio_to_file_float32_non_wav(self, fmt, tmp_path):
        # Regression test for #13364: audio_to_file produced static noise for
        # non-WAV formats because float32 samples were not converted to int16
        # before being handed to pydub (which then treated the 4-byte values
        # as int32 PCM). Round-tripping a sine through audio_to_file and
        # decoding it back should preserve the waveform shape for every
        # supported format, not just "wav".
        sr = 24000
        t = np.arange(sr) / sr  # 1 second
        sine = np.sin(2 * np.pi * 440 * t).astype(np.float32)
        out_path = tmp_path / f"sine.{fmt}"

        processing_utils.audio_to_file(sr, sine, str(out_path), format=fmt)
        assert out_path.exists()

        decoded = AudioSegment.from_file(str(out_path), format=fmt)
        samples = np.array(decoded.get_array_of_samples(), dtype=np.float64)
        n = min(len(samples), len(sine))
        samples = samples[:n]
        reference = sine[:n].astype(np.float64)
        if np.abs(samples).max() > 0:
            samples = samples / np.abs(samples).max()
        # Lossy codecs (mp3) blur the waveform but preserve overall shape;
        # the int32-misinterpretation bug produced noise with RMS error
        # ~0.3+, so 0.1 cleanly separates "encoded correctly" from "noise".
        rms_error = float(np.sqrt(np.mean((samples - reference) ** 2)))
        assert rms_error < 0.1, (
            f"audio_to_file produced noise for format={fmt!r} "
            f"(RMS error {rms_error:.3f} vs sine input)"
        )

    def test_save_audio_to_cache_uses_audio_metadata_in_cache_key(
        self, gradio_temp_dir
    ):
        data = np.array([0, 1, 2, 3], dtype=np.int16)
        data_with_different_dtype = np.array([0, 1, 2, 3], dtype=np.uint16)
        data_with_different_shape = np.array([[0, 1], [2, 3]], dtype=np.int16)

        with patch("gradio.processing_utils.audio_to_file"):
            path_8000 = processing_utils.save_audio_to_cache(
                data, 8000, "wav", cache_dir=gradio_temp_dir
            )
            path_16000 = processing_utils.save_audio_to_cache(
                data, 16000, "wav", cache_dir=gradio_temp_dir
            )
            path_mp3 = processing_utils.save_audio_to_cache(
                data, 8000, "mp3", cache_dir=gradio_temp_dir
            )
            path_uint16 = processing_utils.save_audio_to_cache(
                data_with_different_dtype, 8000, "wav", cache_dir=gradio_temp_dir
            )
            path_stereo = processing_utils.save_audio_to_cache(
                data_with_different_shape, 8000, "wav", cache_dir=gradio_temp_dir
            )

        assert Path(path_8000).parent != Path(path_16000).parent
        assert Path(path_8000).parent != Path(path_mp3).parent
        assert Path(path_8000).parent != Path(path_uint16).parent
        assert Path(path_8000).parent != Path(path_stereo).parent

    def test_save_audio_to_cache_accepts_numpy_sample_rate(self, gradio_temp_dir):
        data = np.array([0, 1, 2, 3], dtype=np.int16)
        with patch("gradio.processing_utils.audio_to_file"):
            path_py_int = processing_utils.save_audio_to_cache(
                data, 8000, "wav", cache_dir=gradio_temp_dir
            )
            path_np_int = processing_utils.save_audio_to_cache(
                data, np.int64(8000), "wav", cache_dir=gradio_temp_dir
            )
        assert Path(path_py_int).parent == Path(path_np_int).parent

    def test_convert_to_16_bit_audio(self):
        # Generate a random audio sample and set the amplitude
        audio = np.random.randint(-100, 100, size=(100), dtype="int16")
        audio[0] = -32767
        audio[1] = 32766

        audio_ = audio.astype("float64")
        audio_ = processing_utils.convert_to_16_bit_audio(audio_)
        assert np.allclose(audio, audio_)
        assert audio_.dtype == "int16"

        audio_ = audio.astype("float32")
        audio_ = processing_utils.convert_to_16_bit_audio(audio_)
        assert np.allclose(audio, audio_)
        assert audio_.dtype == "int16"

        audio_ = processing_utils.convert_to_16_bit_audio(audio)
        assert np.allclose(audio, audio_)
        assert audio_.dtype == "int16"

    def test_convert_to_16_bit_audio_silence(self):
        # Regression test: all-zero float input has a peak of 0, which used to
        # divide by zero and produce NaNs that cast to nonzero int16 garbage,
        # turning silence into noise. Silence must stay silent.
        for dtype in ("float16", "float32", "float64"):
            silence = np.zeros(100, dtype=dtype)
            converted = processing_utils.convert_to_16_bit_audio(silence)
            assert converted.dtype == "int16"
            assert np.all(converted == 0)

    def test_convert_to_16_bit_wav_alias(self):
        # `convert_to_16_bit_wav` is kept as a backwards-compatible alias.
        assert (
            processing_utils.convert_to_16_bit_wav
            is processing_utils.convert_to_16_bit_audio
        )


class TestAudioPlayability:
    """Covers the browser-playability checks behind #10153."""

    @staticmethod
    def _transcode(source: Path, destination: Path, options: str | None = None) -> None:
        ffmpy.FFmpeg(
            inputs={str(source): None},
            outputs={str(destination): options},
            global_options="-y -loglevel quiet",
        ).run()

    @staticmethod
    def _audio_stream_md5(path: str) -> str:
        """Checksum of the encoded audio stream, ignoring the container."""
        output = subprocess.run(
            ["ffmpeg", "-v", "quiet", "-i", path, "-map", "0:a:0", "-f", "md5", "-"],
            capture_output=True,
            text=True,
            check=True,
        )
        return output.stdout.strip()

    def test_audio_is_playable(self, test_file_dir, tmp_path):
        assert processing_utils.audio_is_playable(
            str(test_file_dir / "audio_sample.wav")
        )

        # AIFF holds ordinary PCM but no browser can decode the container
        aiff = tmp_path / "sample.aiff"
        self._transcode(test_file_dir / "audio_sample.wav", aiff)
        assert not processing_utils.audio_is_playable(str(aiff))

        # A file ffprobe cannot read is assumed playable so that we never
        # convert on a guess
        unreadable = tmp_path / "unreadable.wav"
        unreadable.write_bytes(b"not audio")
        assert processing_utils.audio_is_playable(str(unreadable))

    def test_convert_audio_remuxes_already_playable_codec(
        self, test_file_dir, tmp_path
    ):
        """Only the container is wrong, so the stream is kept as it is."""
        mka = tmp_path / "aac.mka"
        self._transcode(test_file_dir / "audio_sample.wav", mka, "-c:a aac")

        converted = processing_utils.convert_audio_to_playable(
            str(mka), cache_dir=str(tmp_path / "cache")
        )

        assert Path(converted).suffix == ".m4a"
        assert processing_utils.audio_is_playable(converted)
        # Still AAC rather than the PCM a re-encode would have produced, and
        # byte-for-byte the original stream.
        assert processing_utils._first_audio_codec(converted) == "aac"
        assert self._audio_stream_md5(converted) == self._audio_stream_md5(str(mka))

    def test_convert_audio_reencodes_undecodable_codec(self, test_file_dir, tmp_path):
        """Big-endian PCM cannot be copied into a wav, so it must be re-encoded."""
        aiff = tmp_path / "sample.aiff"
        self._transcode(test_file_dir / "audio_sample.wav", aiff)
        assert processing_utils._first_audio_codec(str(aiff)) == "pcm_s16be"

        converted = processing_utils.convert_audio_to_playable(
            str(aiff), cache_dir=str(tmp_path / "cache")
        )

        assert Path(converted).suffix == ".wav"
        assert processing_utils.audio_is_playable(converted)
        assert processing_utils._first_audio_codec(converted) == "pcm_s16le"
        # The conversion must not be written next to the source
        assert Path(converted).parent != aiff.parent
        # The audio itself survived the round trip
        sample_rate, data = processing_utils.audio_from_file(converted)
        original_rate, original_data = processing_utils.audio_from_file(str(aiff))
        assert sample_rate == original_rate
        assert np.array_equal(data, original_data)


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
            np.meshgrid(  # type: ignore
                TestOutputPreprocessing.float_dtype_list,  # type: ignore
                TestOutputPreprocessing.float_dtype_list,  # type: ignore
            )  # type: ignore
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
        raise ffmpy.FFRuntimeError("", "", "", "")  # type: ignore

    @pytest.mark.parametrize(
        "exception_to_raise", [raise_ffmpy_runtime_exception, KeyError(), IndexError()]
    )
    def test_video_has_playable_codecs_catches_exceptions(
        self, exception_to_raise, test_file_dir
    ):
        with (
            patch(
                "gradio._vendor.ffmpy.FFprobe.run",
                side_effect=exception_to_raise,
            ),
            tempfile.NamedTemporaryFile(
                suffix="out.avi", delete=False
            ) as tmp_not_playable_vid,
        ):
            shutil.copy(
                str(test_file_dir / "bad_video_sample.mp4"),
                tmp_not_playable_vid.name,
            )
            assert processing_utils.video_is_playable(tmp_not_playable_vid.name)

    @staticmethod
    def _as_mkv(source: Path, destination: Path) -> None:
        """Rewrap a video into a Matroska container without touching the streams."""
        ffmpy.FFmpeg(
            inputs={str(source): None},
            outputs={str(destination): "-c copy"},
            global_options="-y -loglevel quiet",
        ).run()

    def test_can_remux_to_mp4(self, test_file_dir, tmp_path):
        # h264 + aac, only the container is wrong
        mkv = tmp_path / "h264.mkv"
        self._as_mkv(test_file_dir / "video_sample.mp4", mkv)
        assert processing_utils._can_remux_to_mp4(str(mkv))

        # theora + vorbis cannot live in an mp4
        assert not processing_utils._can_remux_to_mp4(
            str(test_file_dir / "playable_but_bad_container.mkv")
        )
        # mpeg4 is not browser-playable
        assert not processing_utils._can_remux_to_mp4(
            str(test_file_dir / "bad_video_sample.mp4")
        )
        # a file ffprobe cannot read at all
        unreadable = tmp_path / "unreadable.mkv"
        unreadable.write_bytes(b"not a video")
        assert not processing_utils._can_remux_to_mp4(str(unreadable))

    @staticmethod
    def _streams(path: str) -> list[dict]:
        """The stream descriptors ffprobe reports for a file."""
        output = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_streams", "-print_format", "json", path],
            capture_output=True,
            text=True,
            check=True,
        )
        return json.loads(output.stdout)["streams"]

    @staticmethod
    def _video_stream_md5(path: str) -> str:
        """Checksum of the encoded video stream, ignoring the container."""
        output = subprocess.run(
            ["ffmpeg", "-v", "quiet", "-i", path, "-map", "0:v:0", "-f", "md5", "-"],
            capture_output=True,
            text=True,
            check=True,
        )
        return output.stdout.strip()

    def test_convert_video_copies_already_compatible_streams(
        self, test_file_dir, tmp_path
    ):
        """A browser-playable codec in a bad container only needs remuxing (#13527)."""
        mkv = tmp_path / "h264.mkv"
        self._as_mkv(test_file_dir / "video_sample.mp4", mkv)

        playable_vid = processing_utils.convert_video_to_playable_mp4(str(mkv))

        assert processing_utils.video_is_playable(playable_vid)
        # The stream came through untouched, which a re-encode could not manage
        assert self._video_stream_md5(playable_vid) == self._video_stream_md5(str(mkv))

    def test_convert_video_reencodes_incompatible_streams(
        self, test_file_dir, tmp_path
    ):
        """theora/vorbis cannot be copied into an mp4, so it must be re-encoded."""
        mkv = tmp_path / "theora.mkv"
        shutil.copy(test_file_dir / "playable_but_bad_container.mkv", mkv)
        assert processing_utils._first_stream_codecs(str(mkv)) == ("theora", "vorbis")

        playable_vid = processing_utils.convert_video_to_playable_mp4(str(mkv))

        assert processing_utils.video_is_playable(playable_vid)
        # theora has no place in an mp4, so the streams must have been rebuilt
        codecs = processing_utils._first_stream_codecs(playable_vid)
        assert codecs is not None
        video_codec, audio_codec = codecs
        assert video_codec == "h264"
        assert audio_codec != "vorbis"

    def test_convert_video_to_playable_mp4(self, test_file_dir):
        with tempfile.NamedTemporaryFile(
            suffix="out.avi", delete=False
        ) as tmp_not_playable_vid:
            shutil.copy(
                str(test_file_dir / "bad_video_sample.mp4"), tmp_not_playable_vid.name
            )
            playable_vid = processing_utils.convert_video_to_playable_mp4(
                tmp_not_playable_vid.name
            )
            assert processing_utils.video_is_playable(playable_vid)

    def test_convert_video_copies_only_the_validated_audio_track(
        self, test_file_dir, tmp_path
    ):
        """Extra audio tracks are not vetted by `_can_remux_to_mp4`, so they are dropped."""
        mkv = tmp_path / "two_audio.mkv"
        ffmpy.FFmpeg(
            inputs={
                str(test_file_dir / "video_sample.mp4"): None,
                "sine=duration=2": "-f lavfi",
            },
            outputs={
                str(mkv): "-map 0:v:0 -map 0:a:0 -map 1:a:0 "
                "-c:v copy -c:a:0 copy -c:a:1 libopus"
            },
            global_options="-y -loglevel quiet",
        ).run()

        playable_vid = processing_utils.convert_video_to_playable_mp4(str(mkv))

        assert processing_utils.video_is_playable(playable_vid)
        codecs = [
            stream["codec_name"]
            for stream in self._streams(playable_vid)
            if stream["codec_type"] == "audio"
        ]
        assert codecs == ["aac"], "the unchecked opus track should not be carried over"

    def test_convert_video_creates_the_cache_root(self, test_file_dir, tmp_path):
        """The cache directory is only a name until something creates it."""
        mkv = tmp_path / "h264.mkv"
        self._as_mkv(test_file_dir / "video_sample.mp4", mkv)
        missing_cache = tmp_path / "not" / "created" / "yet"

        playable_vid = processing_utils.convert_video_to_playable_mp4(
            str(mkv), cache_dir=str(missing_cache)
        )

        assert processing_utils.video_is_playable(playable_vid)
        assert missing_cache.exists()

    def test_convert_video_cleans_up_after_a_failed_conversion(
        self, test_file_dir, tmp_path
    ):
        """A failed conversion must not leave a directory nothing can reach."""
        cache = tmp_path / "cache"
        with patch(
            "gradio._vendor.ffmpy.FFmpeg.run",
            side_effect=ffmpy.FFRuntimeError("", "", "", ""),  # type: ignore
        ):
            returned = processing_utils.convert_video_to_playable_mp4(
                str(test_file_dir / "bad_video_sample.mp4"), cache_dir=str(cache)
            )

        assert returned == str(test_file_dir / "bad_video_sample.mp4")
        assert list(cache.iterdir()) == []

    def test_convert_video_does_not_write_next_to_the_source(
        self, test_file_dir, tmp_path
    ):
        """The conversion must not touch anything in the source directory.

        `Path(video_path).with_suffix(".mp4")` overwrote an unrelated file of the
        same stem, and for a non-playable `.mp4` it resolved to the input itself.
        """
        mkv = tmp_path / "clip.mkv"
        self._as_mkv(test_file_dir / "video_sample.mp4", mkv)
        neighbour = tmp_path / "clip.mp4"
        neighbour.write_bytes(b"an unrelated file that happens to share a stem")

        playable_vid = processing_utils.convert_video_to_playable_mp4(str(mkv))

        assert processing_utils.video_is_playable(playable_vid)
        assert Path(playable_vid).parent != tmp_path
        assert (
            neighbour.read_bytes() == b"an unrelated file that happens to share a stem"
        )

        # A `.mp4` that is not playable would otherwise be rewritten in place.
        source = tmp_path / "user_video.mp4"
        shutil.copy(test_file_dir / "bad_video_sample.mp4", source)
        digest = hashlib.md5(source.read_bytes()).hexdigest()

        playable_vid = processing_utils.convert_video_to_playable_mp4(str(source))

        assert processing_utils.video_is_playable(playable_vid)
        assert hashlib.md5(source.read_bytes()).hexdigest() == digest

    @patch(
        "gradio._vendor.ffmpy.FFmpeg.run",
        side_effect=raise_ffmpy_runtime_exception,
    )
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
            "url": f"{API_PREFIX}/file=path",
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
            "url": f"{root_url}{API_PREFIX}/file=path",
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
            "url": f"{new_root_url}{API_PREFIX}/file=path",
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


@pytest.mark.asyncio
async def test_json_data_not_moved_to_cache():
    data = data_classes.JsonData(
        root={
            "file": {
                "path": "path",
                "url": f"{API_PREFIX}/file=path",
                "meta": {"_type": "gradio.FileData"},
            }
        }
    )
    assert (
        processing_utils.move_files_to_cache(data, components.Number(), False) == data
    )
    assert processing_utils.move_files_to_cache(data, components.Number(), True) == data
    assert (
        await processing_utils.async_move_files_to_cache(
            data, components.Number(), False
        )
        == data
    )
    assert (
        await processing_utils.async_move_files_to_cache(
            data, components.Number(), True
        )
        == data
    )


@contextmanager
def launched_blocks_context():
    """Set up a Blocks instance that looks launched, with LocalContext wired up."""
    blocks = gr.Blocks()
    blocks.has_launched = True
    blocks.allowed_paths = []
    blocks.blocked_paths = []
    token = LocalContext.blocks.set(blocks)
    try:
        yield blocks
    finally:
        LocalContext.blocks.reset(token)


def _make_file_data_dict(path: str) -> dict:
    return {
        "path": path,
        "url": None,
        "size": None,
        "orig_name": None,
        "mime_type": None,
        "is_stream": False,
        "meta": {"_type": "gradio.FileData"},
    }


class TestMoveFilesToCacheSecurity:
    """Verify that move_files_to_cache rejects arbitrary file paths."""

    def test_filedata_with_disallowed_path_raises(self):
        data = _make_file_data_dict("/etc/passwd")
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(data, gr.File(), postprocess=True)

    def test_path_traversal_raises(self):
        data = _make_file_data_dict("../../../etc/passwd")
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(data, gr.File(), postprocess=True)

    def test_nested_filedata_with_disallowed_path_raises(self):
        data = {
            "chatbot": [
                {
                    "role": "assistant",
                    "content": _make_file_data_dict("/etc/shadow"),
                }
            ]
        }
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(
                    data, gr.Chatbot(), postprocess=True
                )


class TestBrowserStatePydanticNoFileCaching:
    """Ensure Pydantic model_dump() in BrowserState doesn't trick file caching."""

    def test_model_with_path_field_not_treated_as_file(self):
        """model_dump() won't produce the FileData meta signature."""

        class Config(BaseModel):
            path: str
            name: str

        state = gr.BrowserState()
        result = state.postprocess(Config(path="/etc/passwd", name="secret"))
        assert result == {"path": "/etc/passwd", "name": "secret"}

        cached = processing_utils.move_files_to_cache(result, state, postprocess=True)
        assert cached == result

    def test_model_with_filedata_signature_blocked(self):
        """Even if model_dump() matches FileData shape, _check_allowed blocks it."""

        class MaliciousModel(BaseModel):
            path: str
            url: str | None = None
            size: int | None = None
            orig_name: str | None = None
            mime_type: str | None = None
            is_stream: bool = False
            meta: dict = {"_type": "gradio.FileData"}

        state = gr.BrowserState()
        result = state.postprocess(MaliciousModel(path="/etc/passwd"))

        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(result, state, postprocess=True)

    def test_nested_model_with_path_not_treated_as_file(self):
        class FileRef(BaseModel):
            path: str
            label: str

        class Report(BaseModel):
            title: str
            files: list[FileRef]

        state = gr.BrowserState()
        report = Report(
            title="Test",
            files=[
                FileRef(path="/etc/passwd", label="passwords"),
                FileRef(path="/etc/shadow", label="shadow"),
            ],
        )
        result = state.postprocess(report)

        cached = processing_utils.move_files_to_cache(result, state, postprocess=True)
        assert cached == result


@pytest.mark.flaky
def test_public_request_pass():
    tempdir = tempfile.TemporaryDirectory()
    file = processing_utils.ssrf_protected_download(
        "https://huggingface.co/datasets/freddyaboulton/bucket/resolve/main/Hugging%20Face%20x%20Cloudflare.png",
        tempdir.name,
    )
    assert os.path.exists(file)


@pytest.mark.asyncio
@pytest.mark.flaky
async def test_async_public_request_pass():
    tempdir = tempfile.TemporaryDirectory()
    file = await processing_utils.async_ssrf_protected_download(
        "https://huggingface.co/datasets/freddyaboulton/bucket/resolve/main/Hugging%20Face%20x%20Cloudflare.png",
        tempdir.name,
    )
    assert os.path.exists(file)


def test_private_request_fail():
    with pytest.raises(ValueError, match="failed validation"):
        tempdir = tempfile.TemporaryDirectory()
        processing_utils.ssrf_protected_download(
            "http://192.168.1.250.nip.io/image.png", tempdir.name
        )


@pytest.mark.asyncio
async def test_async_private_request_fail():
    with pytest.raises(ValueError, match="failed validation"):
        tempdir = tempfile.TemporaryDirectory()
        await processing_utils.async_ssrf_protected_download(
            "http://192.168.1.250.nip.io/image.png", tempdir.name
        )


@pytest.mark.asyncio
async def test_async_get_private_request_fail():
    with pytest.raises(ValueError, match="failed validation"):
        await processing_utils.async_ssrf_protected_get(
            "http://192.168.1.250.nip.io/image.png"
        )


@pytest.mark.asyncio
async def test_async_get_redirect_without_location_returns_response(monkeypatch):
    expected = httpx.Response(
        302, request=httpx.Request("GET", "https://example.com/image.png")
    )

    async def mock_get(*args, **kwargs):
        return expected

    monkeypatch.setattr(processing_utils.sh, "get", mock_get)

    response = await processing_utils.async_ssrf_protected_get(
        "https://example.com/image.png"
    )

    assert response is expected


class TestAudioFormatDetection:
    @pytest.mark.parametrize(
        "file_path,expected",
        [
            ("gradio/media_assets/audio/audio_sample.wav", ".wav"),
            ("gradio/test_data/test_audio.mp3", ".mp3"),
        ],
    )
    def test_detect_audio_format_files(self, file_path, expected):
        with open(file_path, "rb") as f:
            assert processing_utils.detect_audio_format(f.read()) == expected

    @pytest.mark.parametrize(
        "data,expected",
        [
            (b"\x00\x00\x00\x00\x00\x00\x00\x00", ""),  # Unknown format
            (b"\xff\xff", ""),  # Too short
            (b"", ""),  # Empty
        ],
    )
    def test_detect_audio_format_edge_cases(self, data, expected):
        assert processing_utils.detect_audio_format(data) == expected
