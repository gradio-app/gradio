import asyncio
import filecmp
import io
import math
import threading
import time
import wave
from copy import deepcopy
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np
import pytest
from gradio_client import utils as client_utils

import gradio as gr
from gradio import processing_utils, utils
from gradio.audio_stream_encoder import (
    ADTS_SAMPLE_RATES,
    AacStreamEncoder,
    nearest_adts_rate,
    parse_adts_frames,
)
from gradio.components.audio import _stream_encoders
from gradio.data_classes import FileData
from gradio.media import get_audio


class TestAudio:
    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    @pytest.mark.parametrize("sample_rate", [16000, 20000])
    async def test_streamed_audio_is_one_continuous_aac_stream(self, sample_rate):
        """Chunks share one encoder, so only the stream gets a priming frame.

        20 kHz is not a rate ADTS can declare, so the encoder resamples it to
        22.05 kHz, and the durations have to be the frames' at that rate.
        """
        chunk_samples, chunk_count = 4000, 8

        def wav_chunk() -> bytes:
            buffer = io.BytesIO()
            with wave.open(buffer, "wb") as writer:
                writer.setnchannels(1)
                writer.setsampwidth(2)
                writer.setframerate(sample_rate)
                writer.writeframes(np.zeros(chunk_samples, dtype=np.int16).tobytes())
            return buffer.getvalue()

        audio = gr.Audio(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        segments = []
        try:
            for index in range(chunk_count):
                segment, _ = await audio.stream_output(
                    wav_chunk(), stream_id, index == 0
                )
                if segment:
                    segments.append(segment)
            if final_segment := await audio.flush_stream_output(stream_id):
                segments.append(final_segment)
        finally:
            audio.end_stream_output(stream_id)

        data = b"".join(segment["data"] for segment in segments)
        frames, consumed = parse_adts_frames(data)
        assert consumed == len(data)
        # bits 2-5 of the third header byte index ADTS_SAMPLE_RATES
        declared = {ADTS_SAMPLE_RATES[(frame[2] >> 2) & 0x0F] for frame in frames}
        assert declared == {nearest_adts_rate(sample_rate)}
        (output_rate,) = declared
        total = sum(segment["duration"] for segment in segments)
        assert total == pytest.approx(len(frames) * 1024 / output_rate)
        # the input, plus the priming frame and the resampler's tail
        assert total == pytest.approx(
            chunk_count * chunk_samples / sample_rate, abs=3 * 1024 / output_rate
        )
        if output_rate == sample_rate:
            # every 1024 samples, plus the stream's single priming frame
            assert len(frames) == math.ceil(chunk_count * chunk_samples / 1024) + 1

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_a_failed_first_chunk_releases_its_encoder(self, monkeypatch):
        """Until `stream_output` returns, nothing else holds the encoder."""
        audio = gr.Audio(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"

        def fail(self, pcm):  # noqa: ARG001
            raise RuntimeError("the encoder died mid-chunk")

        monkeypatch.setattr(AacStreamEncoder, "feed", fail)
        with pytest.raises(RuntimeError, match="died mid-chunk"):
            await audio.stream_output(
                Path(get_audio("audio_sample.wav")).read_bytes(), stream_id, True
            )

        assert stream_id not in _stream_encoders

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    @pytest.mark.parametrize("gate", ["__init__", "feed"])
    async def test_a_cancelled_first_chunk_releases_its_encoder(
        self, monkeypatch, gate
    ):
        """Cancelling the await does not stop the thread, which may not even
        have made its encoder yet; whichever order they finish in, the encoder
        has to be released."""
        audio = gr.Audio(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        reached, proceed = threading.Event(), threading.Event()
        encoders: list[AacStreamEncoder] = []
        original = getattr(AacStreamEncoder, gate)

        def gated(self, *args, **kwargs):
            reached.set()
            proceed.wait(timeout=5)
            result = original(self, *args, **kwargs)
            encoders.append(self)
            return result

        monkeypatch.setattr(AacStreamEncoder, gate, gated)
        task = asyncio.ensure_future(
            audio.stream_output(
                Path(get_audio("audio_sample.wav")).read_bytes(), stream_id, True
            )
        )
        while not reached.is_set():
            await asyncio.sleep(0.001)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert stream_id not in _stream_encoders

        proceed.set()
        deadline = time.monotonic() + 5
        while not (encoders and encoders[0].process.poll() is not None):
            assert time.monotonic() < deadline, "the encoder was never released"
            await asyncio.sleep(0.005)

    @pytest.mark.requires_ffmpeg
    def test_a_closed_encoder_stays_quiet(self):
        """`close()` is a teardown, not a failure, so a chunk that was in
        flight when it landed must not turn into an error."""
        encoder = AacStreamEncoder(16000, 1)
        encoder.close()

        encoder.feed(bytes(2 * 1024))
        assert encoder.take() == []
        assert encoder.flush() == []

    @pytest.mark.requires_ffmpeg
    def test_flush_keeps_its_frames_when_it_has_to_kill_the_encoder(self, caplog):
        encoder = AacStreamEncoder(16000, 1)
        encoder.feed(bytes(2 * 16000))
        encoder.take()

        # A zero timeout is a process that is still running when the wait ends.
        frames = encoder.flush(timeout=0)

        assert isinstance(frames, list)
        assert encoder.process.poll() is not None
        assert "was killed" in caplog.text

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_an_empty_chunk_mid_stream_is_not_an_error(self):
        """A tick that produced no audio yields `(rate, np.zeros(0))`."""
        audio = gr.Audio(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        chunks = [
            np.zeros(4000, np.int16),
            np.zeros(0, np.int16),
            np.zeros(4000, np.int16),
        ]
        segments = []
        try:
            for index, samples in enumerate(chunks):
                value = audio.postprocess((16000, samples))
                assert isinstance(value, FileData)
                segment, _ = await audio.stream_output(
                    value.model_dump(), stream_id, index == 0
                )
                if segment:
                    segments.append(segment)
            if final_segment := await audio.flush_stream_output(stream_id):
                segments.append(final_segment)
        finally:
            audio.end_stream_output(stream_id)

        assert sum(segment["duration"] for segment in segments) == pytest.approx(
            8000 / 16000, abs=3 * 1024 / 16000
        )

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_a_chunk_that_is_not_audio_says_why(self):
        audio = gr.Audio(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        try:
            value = audio.postprocess((16000, np.zeros(4000, np.int16)))
            assert isinstance(value, FileData)
            await audio.stream_output(value.model_dump(), stream_id, True)
            with pytest.raises(RuntimeError, match="Could not decode.*Invalid data"):
                await audio.stream_output(b"not audio", stream_id, False)
        finally:
            audio.end_stream_output(stream_id)

    @pytest.mark.asyncio
    async def test_component_functions(self, gradio_temp_dir, media_data):
        """
        Preprocess, postprocess serialize, get_config, deserialize
        type: filepath, numpy, file
        """
        x_wav = FileData(path=media_data.BASE64_AUDIO["path"])
        audio_input = gr.Audio()
        output1 = audio_input.preprocess(x_wav)
        assert isinstance(output1, tuple)
        assert output1[0] == 8000
        assert output1[1].shape == (8046,)

        x_wav = await processing_utils.async_move_files_to_cache([x_wav], audio_input)
        x_wav = x_wav[0]
        audio_input = gr.Audio(type="filepath")
        output1 = audio_input.preprocess(x_wav)
        assert isinstance(output1, str)
        assert Path(output1).name.endswith("audio_sample.wav")

        audio_input = gr.Audio(label="Upload Your Audio")
        assert audio_input.get_config() == {
            "autoplay": False,
            "sources": ["upload", "microphone"],
            "name": "audio",
            "buttons": ["download", "share"],
            "streaming": False,
            "show_label": True,
            "label": "Upload Your Audio",
            "container": True,
            "editable": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "playback_position": 0,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "type": "numpy",
            "format": None,
            "recording": False,
            "streamable": False,
            "waveform_options": {
                "sample_rate": 44100,
                "show_recording_waveform": True,
                "skip_length": 5,
                "waveform_color": None,
                "waveform_progress_color": None,
                "trim_region_color": None,
            },
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "loop": False,
            "subtitles": None,
        }
        assert audio_input.preprocess(None) is None

        audio_input = gr.Audio(type="filepath")
        assert isinstance(audio_input.preprocess(x_wav), str)
        with pytest.raises(ValueError):
            gr.Audio(type="unknown")  # type: ignore

        rng = np.random.default_rng()
        # Confirm Audio can be instantiated with a numpy array
        gr.Audio((100, rng.random(size=(1000, 2))), label="Play your audio")

        # Output functionalities
        y_audio = client_utils.decode_base64_to_file(
            deepcopy(media_data.BASE64_AUDIO)["data"]
        )
        audio_output = gr.Audio(type="filepath")
        assert filecmp.cmp(
            y_audio.name,
            audio_output.postprocess(y_audio.name).model_dump()["path"],  # type: ignore
        )
        assert audio_output.get_config() == {
            "autoplay": False,
            "name": "audio",
            "buttons": ["download", "share"],
            "streaming": False,
            "show_label": True,
            "label": None,
            "container": True,
            "editable": True,
            "min_width": 160,
            "recording": False,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "playback_position": 0,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "type": "filepath",
            "format": None,
            "streamable": False,
            "sources": ["upload", "microphone"],
            "waveform_options": {
                "sample_rate": 44100,
                "show_recording_waveform": True,
                "skip_length": 5,
                "waveform_color": None,
                "waveform_progress_color": None,
                "trim_region_color": None,
            },
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "loop": False,
            "subtitles": None,
        }

        output1 = audio_output.postprocess(y_audio.name).model_dump()  # type: ignore
        output2 = audio_output.postprocess(Path(y_audio.name)).model_dump()  # type: ignore
        assert output1 == output2

    def test_default_value_postprocess(self, media_data):
        x_wav = deepcopy(media_data.BASE64_AUDIO)
        audio = gr.Audio(value=x_wav["path"])
        assert utils.is_in_or_equal(audio.value["path"], audio.GRADIO_CACHE)

    def test_in_interface(self, media_data):
        def reverse_audio(audio):
            sr, data = audio
            return (sr, np.flipud(data))

        iface = gr.Interface(reverse_audio, "audio", "audio")
        reversed_file = iface(get_audio("audio_sample.wav"))
        reversed_reversed_file = iface(reversed_file)
        reversed_reversed_data = client_utils.encode_url_or_file_to_base64(
            reversed_reversed_file
        )
        similarity = SequenceMatcher(
            a=reversed_reversed_data, b=media_data.BASE64_AUDIO["data"]
        ).ratio()
        assert similarity > 0.99

    def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(duration):
            return 48000, np.random.randint(-256, 256, (duration, 3)).astype(np.int16)

        iface = gr.Interface(generate_noise, "slider", "audio")
        assert iface(100).endswith(".wav")

    def test_prepost_process_to_mp3(self, gradio_temp_dir, media_data):
        x_wav = FileData(
            path=processing_utils.save_base64_to_cache(
                media_data.BASE64_MICROPHONE["data"], cache_dir=gradio_temp_dir
            )
        )
        audio_input = gr.Audio(type="filepath", format="mp3")
        output = audio_input.preprocess(x_wav)
        assert isinstance(output, str)
        assert output.endswith("mp3")
        output = audio_input.postprocess(
            (48000, np.random.randint(-256, 256, (5, 3)).astype(np.int16))
        ).model_dump()  # type: ignore
        assert output["path"].endswith("mp3")

    def test_postprocess_http_url_like(self):
        audio = gr.Audio()
        output = audio.postprocess("https://test.com/test.mp3?token=123")
        assert isinstance(output, FileData) and output.path.endswith(
            "test.mp3?token=123"
        )

    @pytest.mark.asyncio
    async def test_combine_stream_audio(self, gradio_temp_dir, media_data):
        x_wav = FileData(
            path=processing_utils.save_base64_to_cache(
                media_data.BASE64_MICROPHONE["data"], cache_dir=gradio_temp_dir
            )
        )
        bytes_output = [Path(x_wav.path).read_bytes()] * 2
        output = await gr.Audio().combine_stream(
            bytes_output, desired_output_format="wav"
        )
        assert str(output.path).endswith("wav")

        output = await gr.Audio().combine_stream(
            bytes_output, desired_output_format=None
        )
        assert str(output.path).endswith("mp3")


def test_duration_validator():
    assert gr.validators.is_audio_correct_length((8000, np.zeros((8000,))), 1, 2)[
        "is_valid"
    ]
    assert not gr.validators.is_audio_correct_length((8000, np.zeros((8000,))), 2, 3)[
        "is_valid"
    ]
    assert not gr.validators.is_audio_correct_length(
        (8000, np.zeros((8000,))), 0.25, 0.75
    )["is_valid"]
