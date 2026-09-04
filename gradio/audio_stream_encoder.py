"""The encode path for streamed audio output: chunk bytes in, ADTS frames out."""

from __future__ import annotations

import io
import os
import shutil
import subprocess
import threading
import time
import wave
from collections import deque

from pydub import AudioSegment

AAC_FRAME_SAMPLES = 1024


def parse_adts_frames(data: bytes | bytearray) -> tuple[list[bytes], int]:
    """Split `data` on ADTS frame headers.

    Returns the complete frames and how many bytes of `data` they consumed, so a
    partial frame at the end can be carried over to the next read.
    """
    frames: list[bytes] = []
    offset = 0
    while offset + 7 <= len(data):
        if data[offset] != 0xFF or data[offset + 1] & 0xF0 != 0xF0:
            offset += 1
            continue
        length = (
            ((data[offset + 3] & 0x03) << 11)
            | (data[offset + 4] << 3)
            | ((data[offset + 5] & 0xE0) >> 5)
        )
        if length < 7:
            offset += 1
            continue
        if offset + length > len(data):
            break
        frames.append(bytes(data[offset : offset + length]))
        offset += length
    return frames, offset


def _read_wav_pcm(data: bytes) -> tuple[int, int, bytes] | None:
    """`(sample_rate, channels, pcm)` for 16-bit PCM wav bytes, else None."""
    if data[:4] != b"RIFF" or data[8:12] != b"WAVE":
        return None
    try:
        with wave.open(io.BytesIO(data), "rb") as reader:
            if reader.getsampwidth() != 2 or reader.getcomptype() != "NONE":
                return None
            return (
                reader.getframerate(),
                reader.getnchannels(),
                reader.readframes(reader.getnframes()),
            )
    except (wave.Error, EOFError):
        return None


def _ffmpeg_decode(data: bytes, sample_rate: int, channels: int) -> bytes:
    result = subprocess.run(
        [
            "ffmpeg", "-v", "quiet", "-nostdin",
            "-i", "pipe:0",
            "-f", "s16le", "-acodec", "pcm_s16le",
            "-ar", str(sample_rate), "-ac", str(channels),
            "pipe:1",
        ],
        input=data,
        capture_output=True,
        check=False,
    )  # fmt: skip
    if not result.stdout:
        raise RuntimeError("Could not decode the streamed audio chunk.")
    return result.stdout


def decode_to_pcm(
    data: bytes, sample_rate: int | None = None, channels: int | None = None
) -> tuple[int, int, bytes]:
    """Decode one streamed chunk to signed 16-bit little-endian PCM.

    Chunks gradio wrote itself are 16-bit wav, which the stdlib reads with no
    subprocess at all. Everything else - a `bytes` yield in an unknown format,
    a non-wav `format=`, or a chunk whose parameters differ from the ones the
    stream started with - goes through one ffmpeg process, which resamples to
    `sample_rate` and `channels` on the way.
    """
    parsed = _read_wav_pcm(data)
    if sample_rate is None or channels is None:
        if parsed is not None:
            return parsed
        segment = AudioSegment.from_file(io.BytesIO(data)).set_sample_width(2)
        return segment.frame_rate, segment.channels, segment.raw_data
    if parsed is not None and parsed[0] == sample_rate and parsed[1] == channels:
        return parsed
    return sample_rate, channels, _ffmpeg_decode(data, sample_rate, channels)


class AacStreamEncoder:
    """One ffmpeg process for the whole lifetime of a streamed output.

    AAC is an MDCT codec: a frame's second half only reconstructs once it has
    been overlap-added with the next frame's first half. Encoding every chunk
    with its own encoder therefore makes each chunk boundary a discontinuity,
    and the frame that becomes first has no partner to cancel against, which
    decodes as roughly 36 ms of near-silence four times a second. Feeding one
    encoder instead never creates the discontinuity, and chunk boundaries stop
    mattering: the encoder keeps the sub-frame remainder between writes, so
    input does not have to arrive in multiples of 1024 samples.
    """

    def __init__(self, sample_rate: int, channels: int):
        if not shutil.which("ffmpeg"):
            raise RuntimeError(
                "Streaming audio output requires `ffmpeg` to be installed and on PATH."
            )
        self.sample_rate = sample_rate
        self.channels = channels
        self.process = subprocess.Popen(
            [
                "ffmpeg",
                "-v",
                "quiet",
                "-nostdin",
                # Without these two, ffmpeg probes the input before emitting
                # anything and holds back roughly 64 KB of PCM, which is 2
                # seconds of 16 kHz mono audio. The input format is fully
                # described below, so there is nothing to probe for.
                "-probesize",
                "32",
                "-analyzeduration",
                "0",
                "-f",
                "s16le",
                "-ar",
                str(sample_rate),
                "-ac",
                str(channels),
                "-i",
                "pipe:0",
                "-c:a",
                "aac",
                "-flush_packets",
                "1",
                "-f",
                "adts",
                "pipe:1",
            ],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
        )
        self._buffer = bytearray()
        self._ready: deque[bytes] = deque()
        self._at_eof = False
        self._stdin_closed = False
        self._condition = threading.Condition()
        # A full stdout pipe blocks the encoder, and at 48 kHz stereo the pipe
        # holds only a third of a second of audio, so it has to be drained
        # continuously rather than between writes.
        self._reader = threading.Thread(
            target=self._read_loop, name="gradio-aac-encoder", daemon=True
        )
        self._reader.start()

    @property
    def frame_duration(self) -> float:
        return AAC_FRAME_SAMPLES / self.sample_rate

    def _read_loop(self) -> None:
        stdout = self.process.stdout
        assert stdout is not None  # noqa: S101
        # os.read rather than the buffered reader's read(), which would block
        # until the requested size is filled instead of returning what has
        # arrived, and works the same way on Windows.
        fd = stdout.fileno()
        while True:
            try:
                data = os.read(fd, 1 << 16)
            except (OSError, ValueError):
                break
            if not data:
                break
            with self._condition:
                self._buffer += data
                frames, consumed = parse_adts_frames(self._buffer)
                del self._buffer[:consumed]
                self._ready.extend(frames)
                self._condition.notify_all()
        with self._condition:
            self._at_eof = True
            self._condition.notify_all()

    def feed(self, pcm: bytes) -> None:
        """Write signed 16-bit little-endian PCM into the encoder."""
        if self._stdin_closed:
            raise RuntimeError("encoder stdin is already closed")
        stdin = self.process.stdin
        assert stdin is not None  # noqa: S101
        try:
            stdin.write(pcm)
            stdin.flush()
        except (BrokenPipeError, OSError) as e:
            raise RuntimeError(
                f"The audio encoder exited with code {self.process.poll()}."
            ) from e

    def take(self, timeout: float = 0.1) -> list[bytes]:
        """Pop every whole frame the encoder has emitted so far.

        `timeout` only covers having nothing ready yet, which in practice is the
        first chunk; frames still inside the encoder go out with the next chunk,
        or with `flush()`. Do not make it wait for a predicted frame count: the
        prediction is sometimes one too high, and then every chunk it is wrong
        about pays the whole timeout.
        """
        deadline = time.monotonic() + timeout
        with self._condition:
            while not self._ready and not self._at_eof:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    break
                self._condition.wait(remaining)
            frames = list(self._ready)
            self._ready.clear()
        return frames

    def flush(self, timeout: float = 5.0) -> list[bytes]:
        """Close the input, return what the encoder had left, and release it.

        Terminal: the encoder cannot be fed again afterwards.
        """
        if not self._stdin_closed:
            self._stdin_closed = True
            if self.process.stdin is not None:
                try:
                    self.process.stdin.close()
                except OSError:
                    pass
        try:
            self.process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            self.process.kill()
            self.process.wait()
        self._reader.join(timeout=1.0)
        with self._condition:
            frames = list(self._ready)
            self._ready.clear()
        # The process is reaped by now, so this is just the pipes, which a
        # caller that flushes and drops the encoder would otherwise leave to gc.
        self.close()
        return frames

    def close(self) -> None:
        """Give up on the process without waiting for its remaining output."""
        self._stdin_closed = True
        if self.process.poll() is None:
            self.process.kill()
            try:
                self.process.wait(timeout=2.0)
            except subprocess.TimeoutExpired:
                pass
        for pipe in (self.process.stdin, self.process.stdout):
            if pipe is not None:
                try:
                    pipe.close()
                except OSError:
                    pass
        self._reader.join(timeout=1.0)
