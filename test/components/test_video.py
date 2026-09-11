import asyncio
import json
import os
import shutil
import subprocess
import tempfile
import threading
from copy import deepcopy
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

import gradio as gr
from gradio import processing_utils
from gradio.audio_stream_encoder import AacStreamEncoder
from gradio.components.video import _stream_states
from gradio.data_classes import FileData

AUDIO_RATE = 44100
VIDEO_FPS = 15


def tone_chunks(
    directory: Path, chunk_seconds: float = 0.25, count: int = 8, extension: str = "mp4"
):
    """Pieces of one continuous encode carrying an unbroken 440 Hz tone.

    This is what a generator that splits a file yields. `-c copy` can only cut
    on a keyframe, so the source is encoded with one at every cut, and the cut
    still trims the audio short of the video, which is the case that catches a
    video clock advanced by the audio's length.
    """
    seconds = chunk_seconds * count
    source = directory / "source.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-v", "error",
        "-f", "lavfi", "-i",
        f"testsrc=size=320x240:rate={VIDEO_FPS}:duration={seconds}",
        "-f", "lavfi", "-i",
        f"sine=frequency=440:sample_rate={AUDIO_RATE}:duration={seconds}",
        "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
        "-force_key_frames", f"expr:gte(t,n_forced*{chunk_seconds})",
        "-c:a", "aac", "-shortest", str(source),
    ], check=True)  # fmt: skip
    chunk_dir = directory / "chunks"
    chunk_dir.mkdir()
    subprocess.run([
        "ffmpeg", "-y", "-v", "error", "-i", str(source),
        "-c", "copy", "-f", "segment", "-segment_time", str(chunk_seconds),
        "-reset_timestamps", "1", str(chunk_dir / f"chunk%03d.{extension}"),
    ], check=True)  # fmt: skip
    return sorted(chunk_dir.glob(f"chunk*.{extension}"))


def rendered_chunks(directory: Path, chunk_seconds: float = 0.25, count: int = 24):
    """What a generator that renders its own frames yields: each chunk encoded
    on its own, carrying its share of one continuous tone."""
    out = directory / "rendered"
    out.mkdir()
    for index in range(count):
        start = index * chunk_seconds
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-f", "lavfi", "-i",
            f"testsrc=size=320x240:rate={VIDEO_FPS}:duration={chunk_seconds}",
            "-f", "lavfi", "-i",
            f"aevalsrc='0.8*sin(2*PI*440*(t+{start}))'"
            f":s={AUDIO_RATE}:d={chunk_seconds}",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-shortest", str(out / f"chunk{index:03d}.mp4"),
        ], check=True)  # fmt: skip
    return sorted(out.glob("chunk*.mp4"))


def decode_mono(payload: bytes | Path) -> np.ndarray:
    args = ["ffmpeg", "-v", "quiet", "-nostdin"]
    stdin: bytes | None = None
    if isinstance(payload, Path):
        args += ["-i", str(payload)]
    else:
        args += ["-f", "mpegts", "-i", "pipe:0"]
        stdin = payload
    args += [
        "-vn", "-f", "s16le", "-acodec", "pcm_s16le",
        "-ar", str(AUDIO_RATE), "-ac", "1", "pipe:1",
    ]  # fmt: skip
    result = subprocess.run(args, input=stdin, capture_output=True, check=True)
    return np.frombuffer(result.stdout, dtype="<i2").astype(np.float32) / 32767.0


def silence_ratio(pcm: np.ndarray) -> float:
    """How much of the tone decoded as near-silence, gaps of 2 ms and up."""
    quiet = np.abs(pcm) < 0.02
    edges = np.flatnonzero(np.diff(quiet.astype(np.int8)))
    bounds = np.concatenate(([0], edges + 1, [len(quiet)]))
    runs = [
        stop - start
        for start, stop in zip(bounds[:-1], bounds[1:], strict=False)
        if quiet[start] and (stop - start) / AUDIO_RATE > 0.002
    ]
    return sum(runs) / max(len(pcm), 1)


def packet_timestamps(
    data: bytes, kind: str, directory: Path, entry: str = "dts_time"
) -> list[float]:
    joined = directory / f"joined-{kind}.ts"
    joined.write_bytes(data)
    result = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", kind, "-show_packets",
        "-show_entries", f"packet={entry}", "-of", "json", str(joined),
    ], capture_output=True, check=True)  # fmt: skip
    return [
        float(packet[entry])
        for packet in json.loads(result.stdout)["packets"]
        if packet.get(entry) not in (None, "N/A")
    ]


class TestVideo:
    @pytest.mark.asyncio
    async def test_component_functions(self, media_data):
        """
        Preprocess, serialize, deserialize, get_config
        """
        x_video = FileData(path=deepcopy(media_data.BASE64_VIDEO)["path"])
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
            "buttons": ["download"],
            "show_label": True,
            "label": "Upload Your Video",
            "container": True,
            "min_width": 160,
            "scale": None,
            "height": None,
            "width": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "playback_position": 0,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "webcam_options": {"constraints": None, "mirror": True},
            "include_audio": True,
            "format": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "loop": False,
            "streaming": False,
            "watermark": {"watermark": None, "position": "bottom-right"},
            "subtitles": None,
        }
        assert video_input.preprocess(None) is None
        video_input = gr.Video(format="avi")
        output_video = video_input.preprocess(x_video)
        assert output_video
        assert output_video[-3:] == "avi"
        assert "flip" not in output_video

        # Output functionalities
        y_vid_path = "test/test_files/video_sample.mp4"
        video_output = gr.Video()
        output1 = video_output.postprocess(y_vid_path)
        assert output1
        output1 = output1.model_dump()["path"]
        assert output1.endswith("mp4")
        output2 = video_output.postprocess(y_vid_path)
        assert output2
        output2 = output2.model_dump()["path"]
        assert output1 == output2
        output3 = video_output.postprocess(y_vid_path)
        assert output3
        assert output3.model_dump()["orig_name"] == "video_sample.mp4"

        video = gr.Video(format="wav")
        video_url_with_query_param = "https://github.com/gradio-app/gradio/raw/refs/heads/main/test/test_files/playable_but_bad_container.mp4?query=fake"
        postprocessed_video_with_query_param = video.postprocess(
            video_url_with_query_param
        )
        assert postprocessed_video_with_query_param
        assert postprocessed_video_with_query_param.model_dump()["path"].endswith(
            "playable_but_bad_container.wav"
        )

        p_video = gr.Video()
        postprocessed_video = p_video.postprocess(Path(y_vid_path))
        assert postprocessed_video

        postprocessed_video = postprocessed_video.model_dump()

        processed_video = {
            "path": "video_sample.mp4",
            "orig_name": "video_sample.mp4",
            "mime_type": None,
            "size": None,
            "url": None,
            "is_stream": False,
            "meta": {"_type": "gradio.FileData"},
        }

        postprocessed_video["path"] = os.path.basename(postprocessed_video["path"])
        assert processed_video == postprocessed_video

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_stream_output_returns_a_flat_payload_and_chunk(self, tmp_path):
        component = gr.Video(streaming=True)
        (source,) = tone_chunks(tmp_path, count=1)
        stream_id = "sess/0/1/playlist.m3u8"

        try:
            chunk, output_file = await component.stream_output(
                str(source), stream_id, first_chunk=True
            )
        finally:
            component.end_stream_output(stream_id)

        assert output_file == {
            "path": stream_id,
            "is_stream": True,
            "orig_name": "video-stream.mp4",
            "meta": {"_type": "gradio.FileData"},
        }
        assert chunk is not None
        assert chunk["extension"] == ".ts"
        assert chunk["duration"] == pytest.approx(0.25, abs=0.05)
        assert chunk["data"].startswith(b"\x47")  # an MPEG-TS sync byte

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    @pytest.mark.parametrize("extension", ["mp4", "ts"])
    async def test_streamed_video_keeps_the_audio_in_one_encode(
        self, tmp_path, extension
    ):
        """One AAC encoder for the stream, and timestamps that never restart.

        Re-encoding each chunk gave every one of them its own priming frame,
        which decodes as a gap at each boundary, and left each segment starting
        at the muxer's own zero so the playlist had to mark a discontinuity. A
        chunk that arrived as `.ts` was passed through untouched and so carried
        both problems too.
        """
        chunks = tone_chunks(tmp_path, extension=extension)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        segments = []
        try:
            for index, chunk in enumerate(chunks):
                segment, _ = await video.stream_output(chunk, stream_id, index == 0)
                if segment:
                    segments.append(segment)
            final_segment = await video.flush_stream_output(stream_id)
        finally:
            video.end_stream_output(stream_id)

        assert final_segment is not None
        body = b"".join(segment["data"] for segment in segments)
        served = body + final_segment["data"]
        # Against the chunks as they were handed over, not against the source:
        # the `-c copy` split trims audio at every cut all by itself.
        supplied = silence_ratio(np.concatenate([decode_mono(c) for c in chunks]))
        assert silence_ratio(decode_mono(served)) < supplied + 0.02

        # The flush segment carries only audio, so the muxer would give it the
        # stream id the others use for H.264 and a player reading the segments
        # in sequence would take it for video and drop it, losing the last
        # third of a second every time.
        tail = len(decode_mono(served)) - len(decode_mono(body))
        assert tail > 0.9 * len(decode_mono(final_segment["data"]))

        for kind in ("v", "a"):
            stamps = packet_timestamps(served, kind, tmp_path)
            assert stamps == sorted(stamps)

        # A chunk need not start at zero, and carrying its own start through
        # would leave the video that far behind the audio and stretch the
        # timeline by the same amount at every boundary. `.ts` chunks make it
        # obvious, the mpegts muxer starting them 1.4 s in.
        # The audio sits one AAC frame ahead of the video to cancel the
        # encoder's own delay, which MPEG-TS cannot record the way mp4 can.
        video_pts = packet_timestamps(served, "v", tmp_path, "pts_time")
        audio_pts = packet_timestamps(served, "a", tmp_path, "pts_time")
        assert video_pts[0] - audio_pts[0] == pytest.approx(
            1024 / AUDIO_RATE, abs=0.005
        )
        assert max(video_pts) - min(video_pts) == pytest.approx(
            2.0 - 1 / VIDEO_FPS, abs=0.05
        )

        # The download button and cached examples concatenate the same
        # segments, including the audio-only one the flush leaves at the end.
        combined = await video.combine_stream(
            [segment["data"] for segment in segments], only_file=True
        )
        assert silence_ratio(decode_mono(Path(combined.path))) < supplied + 0.02

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_streamed_video_does_not_drift_out_of_sync(self, tmp_path):
        """The audio sets the pace, so it cannot fall behind as the stream runs.

        A chunk asking for 0.25 s at 15 fps carries four frames, which is
        16.7 ms more video than audio, every time. Advancing the timeline by
        the video's length would bank that difference on every chunk and walk
        the two tracks apart for as long as the generator keeps yielding.
        """
        chunks = rendered_chunks(tmp_path)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        segments = []
        try:
            for index, chunk in enumerate(chunks):
                segment, _ = await video.stream_output(chunk, stream_id, index == 0)
                if segment:
                    segments.append(segment)
            if final_segment := await video.flush_stream_output(stream_id):
                segments.append(final_segment)
        finally:
            video.end_stream_output(stream_id)

        served = b"".join(segment["data"] for segment in segments)
        video_pts = packet_timestamps(served, "v", tmp_path, "pts_time")
        audio_pts = packet_timestamps(served, "a", tmp_path, "pts_time")
        # What separates the ends is the encoder's unflushed tail plus the last
        # frame, both fixed; drift would add 16.7 ms per chunk on top.
        apart = (max(video_pts) - min(video_pts)) - (max(audio_pts) - min(audio_pts))
        assert apart < 0.35

        # And the video is evenly paced, not stretched to follow the audio.
        steps = [b - a for a, b in zip(video_pts[:-1], video_pts[1:], strict=False)]
        assert max(steps) == pytest.approx(1 / VIDEO_FPS, abs=0.005)

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_a_failed_first_chunk_releases_its_encoder(
        self, tmp_path, monkeypatch
    ):
        """Until `stream_output` returns, nothing else holds the encoder."""
        (chunk,) = tone_chunks(tmp_path, count=1)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"

        def fail(self, pcm):  # noqa: ARG001
            raise RuntimeError("the encoder died mid-chunk")

        monkeypatch.setattr(AacStreamEncoder, "feed", fail)
        with pytest.raises(RuntimeError, match="died mid-chunk"):
            await video.stream_output(str(chunk), stream_id, True)

        assert stream_id not in _stream_states

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    @pytest.mark.parametrize("gate", ["__init__", "feed"])
    async def test_a_cancelled_first_chunk_releases_its_encoder(
        self, tmp_path, monkeypatch, gate
    ):
        """Cancelling the await does not stop the thread, which may not even
        have made its encoder yet; whichever order they finish in, the encoder
        has to be released."""
        (chunk,) = tone_chunks(tmp_path, count=1)
        video = gr.Video(streaming=True)
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
        task = asyncio.ensure_future(video.stream_output(str(chunk), stream_id, True))
        while not reached.is_set():
            await asyncio.sleep(0.001)
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        assert stream_id not in _stream_states
        proceed.set()
        # The worker thread runs on and may publish an encoder after the
        # coroutine is gone; the slot has to refuse it and close it.
        for _ in range(500):
            if encoders:
                break
            await asyncio.sleep(0.01)
        assert encoders, "the thread never got as far as an encoder"
        for encoder in encoders:
            assert encoder.process.poll() is not None

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_streamed_video_segments_read_as_one_stream(self, tmp_path):
        """The segments have to follow each other, not just line up in time.

        Each is muxed by its own ffmpeg, so each restarts the MPEG-TS
        continuity counter every PID carries, and a player reading them in
        sequence takes that for packet loss and throws the packets away.
        """
        chunks = rendered_chunks(tmp_path, count=8)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        segments = []
        try:
            for index, chunk in enumerate(chunks):
                segment, _ = await video.stream_output(chunk, stream_id, index == 0)
                if segment:
                    segments.append(segment)
            if final_segment := await video.flush_stream_output(stream_id):
                segments.append(final_segment)
        finally:
            video.end_stream_output(stream_id)

        served = tmp_path / "served.ts"
        served.write_bytes(b"".join(segment["data"] for segment in segments))
        result = subprocess.run(
            [
                "ffmpeg",
                "-v",
                "warning",
                "-nostdin",
                "-i",
                str(served),
                "-f",
                "null",
                "-",
            ],
            capture_output=True,
            check=True,
        )
        assert result.stderr.decode() == ""

    def test_in_interface(self, media_data):
        """
        Interface, process
        """
        x_video = media_data.BASE64_VIDEO["path"]
        iface = gr.Interface(lambda x: x, "video", "playable_video")
        assert iface(x_video).endswith(".mp4")

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
            assert processing_utils.video_is_playable(output["path"])

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
            assert processing_utils.video_is_playable(output["path"])

    @patch("pathlib.Path.exists", MagicMock(return_value=False))
    @patch("gradio.components.video.FFmpeg")
    def test_video_preprocessing_flips_video_for_webcam(self, mock_ffmpeg, media_data):
        # Ensures that the cached temp video file is not used so that ffmpeg is called for each test
        x_video = FileData(path=media_data.BASE64_VIDEO["path"])
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


def test_is_video_correct_length():
    test_file_dir = Path(__file__).parent.parent / "test_files"
    video_path = str(test_file_dir / "muted_video_sample.mp4")
    assert (
        gr.validators.is_video_correct_length(video_path, None, None)["is_valid"]
        is True
    )
    assert (
        gr.validators.is_video_correct_length(video_path, 1, None)["is_valid"] is True
    )
    assert (
        gr.validators.is_video_correct_length(video_path, 1000, None)["is_valid"]
        is False
    )
    assert (
        gr.validators.is_video_correct_length(video_path, None, 1000)["is_valid"]
        is True
    )
    assert (
        gr.validators.is_video_correct_length(video_path, None, 1)["is_valid"] is False
    )
    assert (
        gr.validators.is_video_correct_length(video_path, 1, 1000)["is_valid"] is True
    )
    assert gr.validators.is_video_correct_length(video_path, 1, 5)["is_valid"] is True
    assert gr.validators.is_video_correct_length(video_path, 1, 2)["is_valid"] is False
