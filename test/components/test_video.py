import asyncio
import functools
import hashlib
import json
import logging
import math
import os
import platform
import shutil
import signal
import subprocess
import tempfile
import threading
import warnings
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace
from typing import cast
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

import gradio as gr
from gradio import processing_utils
from gradio.audio_stream_encoder import AAC_FRAME_SAMPLES, AacStreamEncoder
from gradio.components import video as video_module
from gradio.components.video import (
    _audio_lead_tolerance,
    _stream_states,
    _VideoStream,
)
from gradio.data_classes import FileData

AUDIO_RATE = 44100
VIDEO_FPS = 15


def tone_chunks(
    directory: Path, chunk_seconds: float = 0.25, count: int = 8, extension: str = "mp4"
):
    """Pieces of one continuous encode carrying an unbroken 440 Hz tone.

    What a generator that splits a file yields. `-c copy` cuts only on a
    keyframe, so the source carries one at every cut, and the cut still trims
    the audio short of the video.
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
    """What a generator that renders its own frames yields, each chunk encoded on
    its own. The video is asked for in whole frames, since `-shortest` leaves
    the count to the build and 7.0.2 disagrees with 4.4.2.
    """
    video_seconds = math.ceil(chunk_seconds * VIDEO_FPS) / VIDEO_FPS
    out = directory / "rendered"
    out.mkdir()
    for index in range(count):
        start = index * chunk_seconds
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-f", "lavfi", "-i",
            f"testsrc=size=320x240:rate={VIDEO_FPS}:duration={video_seconds}",
            "-f", "lavfi", "-i",
            f"aevalsrc='0.8*sin(2*PI*440*(t+{start}))'"
            f":s={AUDIO_RATE}:d={chunk_seconds}",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", str(out / f"chunk{index:03d}.mp4"),
        ], check=True)  # fmt: skip
    return sorted(out.glob("chunk*.mp4"))


def overrun_chunks(directory: Path, chunk_seconds: float = 0.25, count: int = 24):
    """Chunks whose audio outlasts their video, every one of them.

    The shape `-shortest` gives from ffmpeg 7 on: 0.2 s of video against 0.25 s
    of audio at 15 fps. Asked for outright here, video in whole frames and
    audio in seconds, so it does not depend on the build.
    """
    video_seconds = math.floor(chunk_seconds * VIDEO_FPS) / VIDEO_FPS
    out = directory / "overrun"
    out.mkdir()
    for index in range(count):
        start = index * chunk_seconds
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-f", "lavfi", "-i",
            f"testsrc=size=320x240:rate={VIDEO_FPS}:duration={video_seconds}",
            "-f", "lavfi", "-i",
            f"aevalsrc='0.8*sin(2*PI*440*(t+{start}))'"
            f":s={AUDIO_RATE}:d={chunk_seconds}",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", str(out / f"chunk{index:03d}.mp4"),
        ], check=True)  # fmt: skip
    return sorted(out.glob("chunk*.mp4"))


def per_frame_chunks(directory: Path, sample_rate: int, fps: int = 30, count: int = 6):
    """One video frame and its own audio per chunk, at a chosen sample rate.

    The shape that reaches `first_frame`: a frame at 30 fps carries less audio
    than the encoder holds back at any rate, so the first chunk completes no
    frame of its own.
    """
    seconds = 1 / fps
    out = directory / f"per_frame_{sample_rate}"
    out.mkdir()
    for index in range(count):
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-f", "lavfi", "-i", f"testsrc=size=160x120:rate={fps}",
            "-f", "lavfi", "-i",
            f"sine=frequency=440:sample_rate={sample_rate}",
            "-frames:v", "1", "-t", str(seconds),
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-ar", str(sample_rate),
            str(out / f"chunk{index:03d}.mp4"),
        ], check=True)  # fmt: skip
    return sorted(out.glob("chunk*.mp4"))


def lossless_chunks(directory: Path, chunk_seconds: float = 0.25, count: int = 8):
    """Chunks that carry no damage of their own, to measure what is added here.

    Two things have to go: AAC, which gives every chunk its own encoder edges,
    so the audio is ALAC and decodes back to the tone exactly; and the video
    overrunning the audio, so the chunk is a whole number of frames.
    """
    out = directory / "lossless"
    out.mkdir()
    fps = round(1 / chunk_seconds) * 4
    for index in range(count):
        start = index * chunk_seconds
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-f", "lavfi", "-i",
            f"testsrc=size=320x240:rate={fps}:duration={chunk_seconds}",
            "-f", "lavfi", "-i",
            f"aevalsrc='0.8*sin(2*PI*440*(t+{start}))'"
            f":s={AUDIO_RATE}:d={chunk_seconds}",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
            "-c:a", "alac", str(out / f"chunk{index:03d}.mp4"),
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


def silence_gaps(pcm: np.ndarray) -> list[tuple[float, float]]:
    """Every stretch of near-silence of 2 ms and up, as (start, length)."""
    quiet = np.abs(pcm) < 0.02
    edges = np.flatnonzero(np.diff(quiet.astype(np.int8)))
    bounds = np.concatenate(([0], edges + 1, [len(quiet)]))
    return [
        (start / AUDIO_RATE, (stop - start) / AUDIO_RATE)
        for start, stop in zip(bounds[:-1], bounds[1:], strict=False)
        if quiet[start] and (stop - start) / AUDIO_RATE > 0.002
    ]


def silence_ratio(pcm: np.ndarray) -> float:
    """How much of the tone decoded as near-silence."""
    return sum(length for _, length in silence_gaps(pcm)) / max(
        len(pcm) / AUDIO_RATE, 1e-9
    )


def tool_provenance(name: str) -> str:
    """Where a bare tool name resolves to, which build it is, and its hash.

    CI reaches its pinned ffmpeg through an Actions cache that no step
    re-checks on a hit, so "the workflow pins version X" and "this process ran
    version X" are two different claims, and only the second one can explain a
    crash. Nothing here may raise: it runs while a skip is being decided, and a
    diagnostic that turns a skip into an error is worse than no diagnostic.
    """
    path = shutil.which(name)
    if path is None:
        return f"{name} not on PATH"
    try:
        digest = f"sha256:{hashlib.sha256(Path(path).read_bytes()).hexdigest()[:16]}"
    except OSError as e:
        digest = f"unreadable ({e})"
    try:
        shown = subprocess.run(
            [path, "-version"], check=False, capture_output=True, timeout=60
        )
        first = shown.stdout.decode(errors="replace").strip().splitlines()
        banner = first[0] if first else f"no version output, exit {shown.returncode}"
    except (OSError, subprocess.SubprocessError) as e:
        banner = f"would not run ({e})"
    return f"{path} {digest} {banner}"


def host_cpu() -> str:
    """The CPU model, because this crash has been blamed on the machine before.

    #13848 saw the same segfault on two runner CPUs, and the build that
    replaced it was only ever proven on one of them.
    """
    try:
        for line in Path("/proc/cpuinfo").read_text().splitlines():
            if line.startswith("model name"):
                return line.split(":", 1)[1].strip()
    except OSError:
        pass
    return platform.processor() or "unknown CPU"


@functools.cache
def mpegts_readable() -> bool:
    """Whether the ffmpeg on PATH can read back an MPEG-TS file it just wrote.

    A build that dies on MPEG-TS says nothing about the streams these tests
    decode, so they skip on one rather than fail. Both tools are asked: the
    tests probe with ffprobe and decode with ffmpeg, and a build whose prober
    survives while its decoder dies would sail past a guard that only probed.
    """
    # Evaluated when the first gated test is set up, and then cached, so a run
    # that selects none of them never spawns a process for it. It still cannot
    # reach for a tool that may not be there: `check=False` covers an exit
    # code, not a missing executable.
    if not processing_utils.ffmpeg_installed() or shutil.which("ffprobe") is None:
        return True  # `requires_ffmpeg` skips these anyway
    with tempfile.TemporaryDirectory() as name:
        path = Path(name) / "probe.ts"
        steps = (
            ("ffmpeg writing", [
                "ffmpeg", "-y", "-v", "error",
                "-f", "lavfi", "-i", "testsrc=size=64x48:rate=10:duration=0.2",
                "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p",
                "-f", "mpegts", str(path),
            ]),
            ("ffprobe reading", ["ffprobe", "-v", "error", "-show_streams", str(path)]),
            ("ffmpeg decoding", ["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"]),
        )  # fmt: skip
        for step, args in steps:
            result = subprocess.run(args, check=False, capture_output=True)
            if result.returncode != 0:
                # CI prints no skip reasons, and a skip whose cause never
                # shows is one nobody fixes. It does print warnings.
                stderr = result.stderr.decode(errors="replace").strip()[-300:]
                warnings.warn(
                    f"{step} an MPEG-TS file exited {result.returncode}: "
                    f"{stderr or 'no stderr'}"
                    f"; ffmpeg {tool_provenance('ffmpeg')}"
                    f"; ffprobe {tool_provenance('ffprobe')}"
                    f"; on {host_cpu()}",
                    stacklevel=2,
                )
                return False
    return True


reads_mpegts = pytest.mark.skipif(
    "not mpegts_readable()",
    reason="this ffmpeg build cannot read MPEG-TS back",
)


def stream_kinds(data: bytes, directory: Path) -> list[str]:
    """Which tracks a segment actually carries."""
    path = directory / "kinds.ts"
    path.write_bytes(data)
    probed = subprocess.run([
        "ffprobe", "-v", "error", "-print_format", "json", "-show_streams", str(path),
    ], capture_output=True, check=True)  # fmt: skip
    return sorted(s["codec_type"] for s in json.loads(probed.stdout)["streams"])


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
    @reads_mpegts
    @pytest.mark.asyncio
    @pytest.mark.parametrize("extension", ["mp4", "ts"])
    async def test_streamed_video_keeps_the_audio_in_one_encode(
        self, tmp_path, extension
    ):
        """One AAC encoder for the stream, and timestamps that never restart.

        Re-encoding each chunk gave every one its own priming frame, which decodes
        as a gap at each boundary, and left each segment starting at the muxer's
        own zero. A chunk arriving as `.ts` was passed through untouched and
        carried both.
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
        # Loose deliberately: the `-c copy` split trims audio at every cut and
        # the trimmed time reappears as padding, so this measures the splitter
        # as much as the stream. It still separates a stream that re-encodes
        # every chunk, which ran to 16% on the same input.
        supplied = silence_ratio(np.concatenate([decode_mono(c) for c in chunks]))
        assert silence_ratio(decode_mono(served)) < supplied + 0.05

        # The flush segment carries only audio, so without a pinned stream id
        # the muxer gives it the one the others use for H.264 and a player
        # takes it for video and drops it.
        tail = len(decode_mono(served)) - len(decode_mono(body))
        assert tail > 0.9 * len(decode_mono(final_segment["data"]))

        for kind in ("v", "a"):
            stamps = packet_timestamps(served, kind, tmp_path)
            assert stamps == sorted(stamps)

        # A chunk need not start at zero, and carrying its own start through
        # would leave the video that far behind the audio at every boundary.
        # The audio then sits one AAC frame ahead, cancelling the encoder's own
        # delay, which MPEG-TS cannot record the way mp4 can.
        video_pts = packet_timestamps(served, "v", tmp_path, "pts_time")
        audio_pts = packet_timestamps(served, "a", tmp_path, "pts_time")
        assert video_pts[0] - audio_pts[0] == pytest.approx(
            1024 / AUDIO_RATE, abs=0.005
        )
        assert max(video_pts) - min(video_pts) == pytest.approx(
            2.0 - 1 / VIDEO_FPS, abs=0.05
        )

        # The download button and cached examples concatenate the same
        # segments, the audio-only flush one included.
        combined = await video.combine_stream(
            [segment["data"] for segment in segments] + [final_segment["data"]],
            only_file=True,
        )
        downloaded = decode_mono(Path(combined.path))
        assert silence_ratio(downloaded) < supplied + 0.05
        assert len(downloaded) == pytest.approx(len(decode_mono(served)), abs=1024)

    @pytest.mark.requires_ffmpeg
    @reads_mpegts
    @pytest.mark.asyncio
    async def test_streamed_video_adds_no_silence_of_its_own(self, tmp_path):
        """What the stream adds, measured against chunks that carry no damage.

        Both realistic ways of making chunks lose audio before gradio sees it, so
        ALAC chunks are used instead: they decode back to their source sample for
        sample, and any gap in what comes out was added here.
        """
        chunks = lossless_chunks(tmp_path)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/lossless.m3u8"
        served = b""
        try:
            for index, chunk in enumerate(chunks):
                segment, _ = await video.stream_output(chunk, stream_id, index == 0)
                if segment:
                    served += segment["data"]
            if final_segment := await video.flush_stream_output(stream_id):
                served += final_segment["data"]
        finally:
            video.end_stream_output(stream_id)

        supplied = np.concatenate([decode_mono(chunk) for chunk in chunks])
        assert silence_gaps(supplied) == []
        # The encoder's own priming opens the stream and its flush closes it,
        # both around 20 ms. Anything between the two is a chunk boundary, and
        # re-encoding every chunk left one at each of them, 8.4% of the stream.
        played = decode_mono(served)
        inside = [
            at
            for at, _ in silence_gaps(played)
            if 0.05 < at < len(played) / AUDIO_RATE - 0.05
        ]
        assert inside == []

    @pytest.mark.requires_ffmpeg
    @reads_mpegts
    @pytest.mark.asyncio
    async def test_streamed_video_is_one_continuous_stream(self, tmp_path):
        """The segments have to follow each other, not just line up in time.

        Each is muxed by its own ffmpeg, which restarts the MPEG-TS continuity
        counter every PID carries, and a player takes that for packet loss. The
        tracks also have to stay together: a chunk asking for 0.25 s at 15 fps
        carries 16.7 ms more video than audio, and banking that every chunk walks
        them apart.
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

        served = tmp_path / "served.ts"
        served.write_bytes(b"".join(segment["data"] for segment in segments))
        result = subprocess.run(
            ["ffmpeg", "-v", "warning", "-nostdin", "-i", str(served), "-f", "null", "-"],
            capture_output=True,
            check=True,
        )  # fmt: skip
        assert result.stderr.decode() == ""

        video_pts = packet_timestamps(served.read_bytes(), "v", tmp_path, "pts_time")
        audio_pts = packet_timestamps(served.read_bytes(), "a", tmp_path, "pts_time")
        # What separates the ends is the audio's one frame of lead and the last
        # video frame, both fixed, which comes to -0.075 s here. Banking the
        # per-chunk difference instead takes it to +0.203 s over these 24.
        apart = (max(video_pts) - min(video_pts)) - (max(audio_pts) - min(audio_pts))
        assert abs(apart) < 0.12
        # And the video is evenly paced, not stretched to follow the audio.
        steps = [b - a for a, b in zip(video_pts[:-1], video_pts[1:], strict=False)]
        assert max(steps) == pytest.approx(1 / VIDEO_FPS, abs=0.005)

        # A segment's audio also has to sit with its own video: one whose
        # audio starts a third of a second before its video stops hls.js dead.
        # Taking what has arrived rather than one burst's worth holds the lead
        # to 0.148 s idle against 0.394 s worst with none. The bound is 0.3
        # rather than the idle figure because the encoder emits later under
        # load.
        for segment in segments:
            within = [
                packet_timestamps(segment["data"], kind, tmp_path, "pts_time")
                for kind in ("v", "a")
            ]
            if all(within):
                assert min(within[0]) - min(within[1]) < 0.3

    @pytest.mark.requires_ffmpeg
    @reads_mpegts
    @pytest.mark.asyncio
    async def test_audio_that_outlasts_its_video_does_not_walk_ahead(self, tmp_path):
        """The other way round from the chunk `catch_up` pads.

        Audio outlasting the video was left where it fell, and a generator whose
        every chunk does that walks the sound ahead of the picture: 50 ms a chunk
        here, two seconds by the fortieth. Past a tolerance the next chunk's video
        is placed where the audio has reached, and the playlist reports the move.
        """
        chunks = overrun_chunks(tmp_path)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/overrun.m3u8"
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
        # Left alone, 24 chunks of 0.2 s of video against 0.25 s of audio end
        # with the sound 0.8 s or more past the picture.
        assert max(audio_pts) - max(video_pts) < 0.25
        # The playlist's durations add up to the timeline served, the video's
        # moves included, or a player has the stream shorter than it is.
        span = max(audio_pts) + 1024 / AUDIO_RATE - min(video_pts)
        assert sum(s["duration"] for s in segments) == pytest.approx(span, abs=0.25)
        for kind in ("v", "a"):
            stamps = packet_timestamps(served, kind, tmp_path)
            assert stamps == sorted(stamps)
        # Moving the video up puts a segment's picture after audio the encoder
        # is still holding, and a third of a second of that stops hls.js dead.
        for segment in segments:
            within = [
                packet_timestamps(segment["data"], kind, tmp_path, "pts_time")
                for kind in ("v", "a")
            ]
            if all(within):
                assert abs(min(within[0]) - min(within[1])) < 0.25

    @pytest.mark.requires_ffmpeg
    @reads_mpegts
    @pytest.mark.asyncio
    async def test_a_chunk_without_audio_keeps_the_stream_s_track(self, tmp_path):
        """A stream that has an audio track has to keep carrying one.

        Chunks bringing no audio of their own used to skip the encoder, so their
        segments went out with no audio track and the audio clock stood still
        while the video clock ran on. hls.js fixes its tracks on the first segment
        and will not take the transition.
        """
        out = tmp_path / "mixed"
        out.mkdir()
        chunks = []
        for index in range(6):
            path = out / f"chunk{index:02d}.mp4"
            args = [
                "ffmpeg", "-y", "-v", "error",
                "-f", "lavfi", "-i",
                f"testsrc=size=160x120:rate={VIDEO_FPS}:duration=0.25",
            ]  # fmt: skip
            # The first half carries sound, the second half is picture alone.
            if index < 3:
                args += ["-f", "lavfi", "-i",
                         f"aevalsrc='0.8*sin(2*PI*440*(t+{index * 0.25}))'"
                         f":s={AUDIO_RATE}:d=0.25", "-c:a", "aac"]  # fmt: skip
            args += [
                "-c:v", "libx264", "-preset", "ultrafast",
                "-pix_fmt", "yuv420p", str(path),
            ]  # fmt: skip
            subprocess.run(args, check=True)
            chunks.append(path)

        video = gr.Video(streaming=True)
        stream_id = "session/0/1/mixed.m3u8"
        segments = []
        try:
            for index, chunk in enumerate(chunks):
                segment, _ = await video.stream_output(chunk, stream_id, index == 0)
                if segment:
                    segments.append(segment)
            state = _stream_states[stream_id]
            encoder = state.slot.encoder
            assert encoder is not None
            apart = state.video_time - state.audio_time(encoder)
        finally:
            video.end_stream_output(stream_id)

        assert len(segments) == len(chunks)
        for segment in segments:
            assert "audio" in stream_kinds(segment["data"], tmp_path)
        # What the encoder is still holding back, and nothing else: 0.067 s
        # measured, against 0.346 closing only the distance behind and 0.903
        # not feeding the silent chunks at all.
        assert apart < 0.15

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_a_chunk_that_emits_nothing_does_not_move_the_clock(
        self, tmp_path, monkeypatch
    ):
        """Every advance of the video clock has to be billed to one `#EXTINF`.

        `catch_up` moves the clock up to the audio once the audio has led for long
        enough, and the segment's duration reports the move. A chunk that leaves
        without a segment has no duration to report it in, so the jump is billed
        to nobody and the playlist ends up shorter than its segments cover.
        """
        (first,) = tone_chunks(tmp_path, count=1)
        audio_only = tmp_path / "audio_only.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-f", "lavfi", "-i", f"aevalsrc='0':s={AUDIO_RATE}:d=0.05",
            "-c:a", "aac", str(audio_only),
        ], check=True)  # fmt: skip

        video = gr.Video(streaming=True)
        stream_id = "session/0/1/unbilled.m3u8"
        try:
            await video.stream_output(first, stream_id, True)
            state = _stream_states[stream_id]
            encoder = state.slot.encoder
            assert encoder is not None
            assert state.frames_emitted > 0
            # Put the audio a clear `MAX_AUDIO_LEAD` ahead so the next chunk
            # snaps, and stop the encoder handing anything back so that chunk
            # leaves without a segment.
            state.samples_written = round(
                (state.video_time + 0.5) * encoder.sample_rate
            )
            monkeypatch.setattr(AacStreamEncoder, "take", lambda self, timeout=None: [])
            before = state.video_time
            segment, _ = await video.stream_output(audio_only, stream_id, False)
        finally:
            video.end_stream_output(stream_id)

        assert segment is None
        assert state.video_time == pytest.approx(before)

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_the_first_frame_wait_is_paid_once_for_the_stream(
        self, tmp_path, monkeypatch
    ):
        """An encoder that declines the first frame declines it every time.

        A failed attempt leaves `frames_emitted` at zero, so the condition guarding
        the wait stays true and every later empty chunk paid `FIRST_FRAME_WAIT`
        again: three chunks, six seconds of a blocked worker thread.
        """
        monkeypatch.setattr(AacStreamEncoder, "take", lambda self, timeout=None: [])
        calls = []
        real_first_frame = _VideoStream.first_frame

        def counted(self, encoder):
            calls.append(1)
            return real_first_frame(self, encoder)

        monkeypatch.setattr(_VideoStream, "first_frame", counted)
        monkeypatch.setattr(video_module, "FIRST_FRAME_WAIT", 0.05)
        chunks = tone_chunks(tmp_path, count=3)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/oncewait.m3u8"
        try:
            for index, chunk in enumerate(chunks):
                await video.stream_output(chunk, stream_id, index == 0)
        finally:
            video.end_stream_output(stream_id)

        assert len(calls) == 1

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_a_first_segment_going_out_without_audio_is_logged(
        self, tmp_path, monkeypatch, caplog
    ):
        """An encoder that gives nothing in time costs the stream its audio in
        hls.js, and a silent video with a clean log is not something anyone
        can diagnose."""
        monkeypatch.setattr(AacStreamEncoder, "take", lambda self, timeout=None: [])
        (source,) = tone_chunks(tmp_path, count=1)
        video = gr.Video(streaming=True)
        stream_id = "session/0/1/silent.m3u8"
        try:
            with caplog.at_level(logging.WARNING, logger="gradio.components.video"):
                segment, _ = await video.stream_output(str(source), stream_id, True)
        finally:
            video.end_stream_output(stream_id)

        assert segment is not None
        assert "carries no audio" in caplog.text

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
    async def test_chunks_with_nothing_to_mux_are_passed_over(self, tmp_path):
        """ffmpeg refuses a command with no input, and it took the run with it.

        A run of audio-only chunks too short to complete a frame leaves the muxer
        no video and the encoder still holding its audio. One such chunk is
        survivable; a few in a row are not.
        """
        source = tmp_path / "chunks"
        source.mkdir()
        paths = []
        for index in range(5):
            path = source / f"chunk{index}.mp4"
            args = ["ffmpeg", "-y", "-v", "error"]
            if index == 0:
                args += ["-f", "lavfi", "-i",
                         f"testsrc=size=160x120:rate={VIDEO_FPS}:duration=0.25"]  # fmt: skip
            seconds = 0.25 if index == 0 else 0.01
            args += ["-f", "lavfi", "-i",
                     f"sine=frequency=440:sample_rate={AUDIO_RATE}:duration={seconds}"]  # fmt: skip
            if index == 0:
                args += ["-c:v", "libx264", "-preset", "ultrafast",
                         "-pix_fmt", "yuv420p"]  # fmt: skip
            args += ["-c:a", "aac", "-shortest", str(path)]
            subprocess.run(args, check=True)
            paths.append(path)

        video = gr.Video(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        segments = []
        try:
            for index, path in enumerate(paths):
                segment, _ = await video.stream_output(str(path), stream_id, index == 0)
                segments.append(segment)
        finally:
            video.end_stream_output(stream_id)

        # The first chunk still gets a segment; the rest simply have none, and
        # their audio goes out with whatever segment comes next.
        assert segments[0] is not None

    @pytest.mark.requires_ffmpeg
    @reads_mpegts
    @pytest.mark.asyncio
    @pytest.mark.parametrize("hold_up", [True, False])
    async def test_the_first_segment_carries_the_audio_it_was_given(
        self, tmp_path, monkeypatch, hold_up
    ):
        """Or the stream loses its audio, not just its opening.

        hls.js settles its SourceBuffers on the first segment and refuses the
        transition when a later one arrives with audio. Two ways to get a silent
        one: `hold_up` starves the first `take` the way a loaded box does, or the
        chunk is 10 ms, short of the 23 ms a frame needs at 44.1 kHz.
        """
        seconds = 0.25 if hold_up else 0.01
        chunks = rendered_chunks(tmp_path, chunk_seconds=seconds, count=2)
        if hold_up:
            first = AacStreamEncoder.take
            calls = {"n": 0}

            def starve(self, timeout=None):
                calls["n"] += 1
                # Every take the chunk makes on its own, but not the deliberate
                # wait the fix adds.
                return (
                    [] if timeout is None and calls["n"] <= 2 else first(self, timeout)
                )

            monkeypatch.setattr(AacStreamEncoder, "take", starve)

        video = gr.Video(streaming=True)
        stream_id = "session/0/1/playlist.m3u8"
        segments = []
        try:
            for index, chunk in enumerate(chunks):
                segment, _ = await video.stream_output(
                    str(chunk), stream_id, index == 0
                )
                if segment:
                    segments.append(segment)
        finally:
            video.end_stream_output(stream_id)

        assert segments
        assert "audio" in stream_kinds(segments[0]["data"], tmp_path)

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    @pytest.mark.parametrize("sample_rate", [16000, 22050, 44100])
    async def test_the_first_segment_s_padding_stays_inside_the_lead_tolerance(
        self, tmp_path, sample_rate
    ):
        """What the first segment is topped up with must not snap the clock.

        The top-up is counted in frames, but what a frame costs is seconds. Feeding
        the largest count at every rate put in more silence than
        `_audio_lead_tolerance` allows below 32 kHz, so the chunk after the first
        found the audio leading and froze the opening picture for as long as the
        padding. Both halves are needed: the top-up stops at what the encoder
        actually holds back, and the tolerance never goes under two frames.
        """
        # 8 kHz is not here: one frame is 0.128 s, so a chunk this short
        # carries no encodable audio at all and ffmpeg drops the track.
        # Two chunks, so what this measures is the top-up alone.
        chunks = per_frame_chunks(tmp_path, sample_rate, count=2)
        video = gr.Video(streaming=True)
        stream_id = f"session/0/1/lookahead-{sample_rate}.m3u8"
        try:
            first, _ = await video.stream_output(str(chunks[0]), stream_id, True)
            state = _stream_states[stream_id]
            encoder = state.slot.encoder
            assert encoder is not None
            padded_lead = state.samples_written / encoder.sample_rate - state.video_time
            tolerance = _audio_lead_tolerance(encoder)
            second, _ = await video.stream_output(str(chunks[1]), stream_id, False)
        finally:
            video.end_stream_output(stream_id)

        # The first segment still carries audio, which is what the top-up is
        # for; a silent one costs the stream its audio track in hls.js.
        assert first is not None
        assert "audio" in stream_kinds(first["data"], tmp_path)
        # The silence it took to get that left the audio inside the tolerance,
        # so the chunk after it is not billed for a clock the top-up moved.
        assert padded_lead <= tolerance
        # Which shows as the second segment carrying its own frame and nothing
        # else, a snap being billed to the segment that follows it.
        assert second is not None
        assert second["duration"] == pytest.approx(1 / 30, abs=0.005)

    @pytest.mark.parametrize(
        ("output_rate", "expected"),
        [(8000, 0.256), (11025, 0.1858), (16000, 0.128), (22050, 0.1), (44100, 0.1)],
    )
    def test_the_lead_tolerance_is_never_under_two_frames(self, output_rate, expected):
        """A tenth of a second is under one AAC frame at the bottom of the range.

        The encoder hands audio over a whole frame at a time, so a tolerance below
        that snaps the video clock on the encoder's granularity rather than on any
        drift the stream has. A frame is 0.128 s at 8 kHz against 0.023 s at 44.1.
        """
        # Only `frame_duration` is read, and a real encoder is an ffmpeg process.
        encoder = cast(
            AacStreamEncoder,
            SimpleNamespace(frame_duration=AAC_FRAME_SAMPLES / output_rate),
        )
        assert _audio_lead_tolerance(encoder) == pytest.approx(expected, abs=0.001)

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_a_missing_ffprobe_says_so_before_any_chunk_is_read(
        self, tmp_path, monkeypatch
    ):
        """ffmpeg alone is not enough, and the error has to say which is gone."""
        (chunk,) = tone_chunks(tmp_path, count=1)
        video = gr.Video(streaming=True)

        monkeypatch.setattr(
            processing_utils.shutil,
            "which",
            lambda name: None if name == "ffprobe" else "/usr/bin/ffmpeg",
        )
        with pytest.raises(RuntimeError) as caught:
            await video.stream_output(str(chunk), "session/0/1/playlist.m3u8", True)

        message = str(caught.value)
        assert "ffprobe" in message and "PATH" in message

    @pytest.mark.requires_ffmpeg
    @pytest.mark.asyncio
    async def test_an_ffprobe_killed_by_a_signal_names_the_build(
        self, tmp_path, monkeypatch
    ):
        """A crash writes nothing to stderr, so the message came out empty and
        said nothing about what had died. It names the signal and the build."""
        (chunk,) = tone_chunks(tmp_path, count=1)
        video = gr.Video(streaming=True)
        real_run = subprocess.run

        def segfault(args, **kwargs):
            if args[0] == "ffprobe" and "-version" not in args:
                return subprocess.CompletedProcess(args, -signal.SIGSEGV, b"", b"")
            return real_run(args, **kwargs)

        monkeypatch.setattr(subprocess, "run", segfault)
        with pytest.raises(RuntimeError) as caught:
            await video.stream_output(str(chunk), "session/0/1/playlist.m3u8", True)

        message = str(caught.value)
        assert "SIGSEGV" in message
        assert "ffprobe version" in message
        assert "different FFmpeg build" in message

    def test_a_zero_video_duration_falls_back_to_the_format(self, monkeypatch):
        """ffprobe can report a video stream duration of 0 while the format
        carries a real one. The old duration helper preferred the format, so a
        chunk that used to stream must not now abort the run."""
        payload = json.dumps(
            {
                "streams": [
                    {
                        "codec_type": "video",
                        "codec_name": "h264",
                        "duration": "0.000000",
                        "start_time": "0.000000",
                    }
                ],
                "format": {"duration": "0.250000"},
            }
        ).encode()
        real_run = subprocess.run

        def fake_probe(args, **kwargs):
            if args[0] == "ffprobe" and "-version" not in args:
                return subprocess.CompletedProcess(args, 0, payload, b"")
            return real_run(args, **kwargs)

        monkeypatch.setattr(subprocess, "run", fake_probe)
        info = gr.Video.probe_chunk("chunk.mp4")
        assert info["duration"] == pytest.approx(0.25)

    @pytest.mark.requires_ffmpeg
    @reads_mpegts
    def test_a_non_h264_chunk_is_re_encoded_to_a_playable_pixel_format(self, tmp_path):
        """libx264 left to itself keeps the source's pixel format, so a 4:4:4 or
        10-bit source would come out in a High profile no browser decodes. It is
        pinned to yuv420p.
        """
        source = tmp_path / "wide.mp4"
        subprocess.run([
            "ffmpeg", "-y", "-v", "error",
            "-f", "lavfi", "-i", "testsrc=size=160x120:rate=15:duration=0.25",
            "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv444p",
            str(source),
        ], check=True)  # fmt: skip
        # The source is H.264, but a non-H.264 codec forces the re-encode
        # branch without needing a VP9 or AV1 encoder in the test environment.
        segment = gr.Video.mux_segment(str(source), "vp9", b"", 0.0, 0.0)
        served = tmp_path / "segment.ts"
        served.write_bytes(segment)
        probed = subprocess.run([
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=pix_fmt", "-of", "json", str(served),
        ], capture_output=True, check=True)  # fmt: skip
        pix_fmt = json.loads(probed.stdout)["streams"][0]["pix_fmt"]
        assert pix_fmt == "yuv420p"

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
