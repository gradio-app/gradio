"""`ReplyOnPause`: a handler that waits until the user stops talking, then
streams the reply of a plain generator function."""

from __future__ import annotations

import asyncio
import contextvars
import importlib.util
import inspect
import queue
import threading
from collections.abc import Callable
from functools import lru_cache
from typing import Any, Protocol

import numpy as np

from gradio.streaming.handlers import StreamHandler
from gradio.streaming.utils import audio_to_float32, bind_special_args

# Silero VAD v5 (MIT), as exported to ONNX by onnx-community; pinned so that a
# change on the Hub does not change how pauses are detected
SILERO_REPO = "onnx-community/silero-vad"
SILERO_FILENAME = "onnx/model.onnx"
SILERO_REVISION = "e71cae966052b992a7eca6b17738916ce0eca4ec"

VAD_EXTRA_HINT = (
    "The `onnxruntime` package is required for SileroVAD, the voice activity "
    'detection of ReplyOnPause. Install it with the `vad` extra: pip install "gradio[vad]"'
)


class VoiceActivityDetector(Protocol):
    """What `ReplyOnPause` needs from a voice activity detector: it is given
    the audio in windows of `window_size` samples at `sample_rate`, in order,
    and says which of them contain speech. One detector serves one stream."""

    sample_rate: int
    window_size: int

    def is_speech(self, window: np.ndarray) -> bool:
        """Whether `window`, a float32 array in [-1, 1], contains speech."""
        ...

    def reset(self) -> None:
        """Forgets the audio seen so far, before the next utterance."""
        ...

    def copy(self) -> VoiceActivityDetector:
        """Returns a detector for another stream."""
        ...


@lru_cache(maxsize=1)
def _silero_session() -> Any:
    import onnxruntime  # ty: ignore[unresolved-import] # in the `vad` extra
    from huggingface_hub import hf_hub_download

    path = hf_hub_download(
        repo_id=SILERO_REPO, filename=SILERO_FILENAME, revision=SILERO_REVISION
    )
    options = onnxruntime.SessionOptions()
    options.inter_op_num_threads = 1
    options.intra_op_num_threads = 1
    return onnxruntime.InferenceSession(
        path, providers=["CPUExecutionProvider"], sess_options=options
    )


class SileroVAD:
    """
    The default voice activity detector of `ReplyOnPause`: Silero VAD v5
    (MIT license), downloaded from the Hugging Face Hub (onnx-community/silero-vad)
    the first time a stream starts. Needs the `vad` extra: `pip install "gradio[vad]"`.

    Parameters:
        threshold: the speech probability (0 to 1) above which a 32 ms window counts as speech. Raise it in a noisy room, lower it for quiet speakers.
    """

    sample_rate = 16000
    window_size = 512
    # Samples of the previous window that v5 takes in front of each window
    _context_size = 64

    def __init__(self, threshold: float = 0.5) -> None:
        if importlib.util.find_spec("onnxruntime") is None:
            raise ImportError(VAD_EXTRA_HINT)
        self.threshold = threshold
        self.reset()

    def load(self) -> None:
        """Downloads and loads the model, if not done yet."""
        _silero_session()

    def reset(self) -> None:
        self._state = np.zeros((2, 1, 128), dtype=np.float32)
        self._context = np.zeros(self._context_size, dtype=np.float32)

    def is_speech(self, window: np.ndarray) -> bool:
        x = np.concatenate([self._context, window.astype(np.float32)])[None, :]
        probability, self._state = _silero_session().run(
            None,
            {
                "input": x,
                "state": self._state,
                "sr": np.array(self.sample_rate, dtype=np.int64),
            },
        )
        self._context = x[0, -self._context_size :]
        return float(probability[0, 0]) >= self.threshold

    def copy(self) -> SileroVAD:
        return SileroVAD(self.threshold)


def _resampled(audio: np.ndarray, rate: int, target: int) -> np.ndarray:
    """Linear resampling, which is enough for telling speech from silence."""
    if rate == target or not len(audio):
        return audio
    count = round(len(audio) * target / rate)
    positions = np.arange(count) * (rate / target)
    return np.interp(positions, np.arange(len(audio)), audio).astype(np.float32)


class ReplyOnPause(StreamHandler):
    """
    A handler for voice agents that only needs a generator function: it listens
    to the microphone, waits until the user stops talking, then calls `fn` with
    what they said and streams what `fn` yields back to the page. If the user
    starts talking again while the reply is still running, the reply stops
    (unless `can_interrupt` is False) and the new utterance gets its own reply.

    `fn` is a generator (or async generator) function. It takes the utterance
    as a `(sample_rate, array)` tuple (an int16 array of shape (samples,)),
    followed by the values of the stream's other inputs in order, and the
    special parameters of event listeners such as `gr.Request`. It yields one
    value per output, like the function of any stream: audio as a
    `(sample_rate, array)` tuple, `gr.skip()` to leave an output unchanged.

    Parameters:
        fn: the generator function that replies to one utterance.
        can_interrupt: whether the user can talk over a reply to stop it. If False, what they say during a reply is ignored.
        pause_seconds: how long the user must be silent for the utterance to end.
        min_speech_seconds: how much speech it takes to start an utterance, so that short noises do not.
        max_speech_seconds: if set, an utterance that goes on this long gets a reply without waiting for a pause.
        vad: the voice activity detector; a `SileroVAD` by default. Any object with the methods of `SileroVAD` (`is_speech`, `reset`, `copy`) and its `sample_rate` and `window_size` attributes works.
        input_sample_rate: the sample rate of the audio `fn` gets.
    """

    def __init__(
        self,
        fn: Callable,
        *,
        can_interrupt: bool = True,
        pause_seconds: float = 0.6,
        min_speech_seconds: float = 0.2,
        max_speech_seconds: float | None = None,
        vad: VoiceActivityDetector | None = None,
        input_sample_rate: int = 16000,
    ) -> None:
        if not (inspect.isgeneratorfunction(fn) or inspect.isasyncgenfunction(fn)):
            raise TypeError(
                "ReplyOnPause takes a generator function (def ... yield), "
                "which yields its reply one value per output at a time."
            )
        super().__init__(input_sample_rate=input_sample_rate)
        self.fn = fn
        self.can_interrupt = can_interrupt
        self.pause_seconds = pause_seconds
        self.min_speech_seconds = min_speech_seconds
        self.max_speech_seconds = max_speech_seconds
        self.vad: VoiceActivityDetector = vad if vad is not None else SileroVAD()
        self._call: Callable = fn
        # Each reply has its number; outputs of an older one are dropped
        self._reply = 0
        self._replying = False
        self._outputs: queue.Queue = queue.Queue()
        self._lock = threading.Lock()
        self._listen()
        # Resolved here: this module's annotations are strings, and the
        # stream passes gr.Request to start_up() by its annotation
        from gradio.routes import Request

        ReplyOnPause.start_up.__annotations__ = {"request": Request, "return": None}

    def _listen(self) -> None:
        """Starts listening for the next utterance."""
        self._utterance: list[np.ndarray] = []
        self._pending = np.zeros(0, dtype=np.float32)
        self._speech = 0.0
        self._silence = 0.0
        self._started = False
        self.vad.reset()

    def copy(self) -> ReplyOnPause:
        return ReplyOnPause(
            self.fn,
            can_interrupt=self.can_interrupt,
            pause_seconds=self.pause_seconds,
            min_speech_seconds=self.min_speech_seconds,
            max_speech_seconds=self.max_speech_seconds,
            vad=self.vad.copy(),
            input_sample_rate=self.input_sample_rate,
        )

    def start_up(self, request: Any = None) -> None:
        self._call = bind_special_args(self.fn, request)
        load = getattr(self.vad, "load", None)
        if load is not None:
            load()

    def receive(self, frame: tuple[int, np.ndarray]) -> None:
        rate, array = frame
        if self._replying and not self.can_interrupt:
            return
        self._utterance.append(array)
        window_seconds = self.vad.window_size / self.vad.sample_rate
        audio = _resampled(audio_to_float32(array), rate, self.vad.sample_rate)
        self._pending = np.concatenate([self._pending, audio])
        while len(self._pending) >= self.vad.window_size:
            window = self._pending[: self.vad.window_size]
            self._pending = self._pending[self.vad.window_size :]
            if self._step(self.vad.is_speech(window), window_seconds, rate):
                return

    def _step(self, speech: bool, seconds: float, rate: int) -> bool:
        """Advances the utterance by one window; True when it ended."""
        if speech:
            self._speech += seconds
            self._silence = 0.0
            if not self._started and self._speech >= self.min_speech_seconds:
                self._started = True
                # Also when fn has finished: its audio may still be playing
                if self.can_interrupt:
                    self._interrupt()
        else:
            self._silence += seconds
            if self._silence >= self.pause_seconds and not self._started:
                # A noise, not an utterance: keep only what may lead into one
                self._speech = 0.0
                self._keep_last(self.pause_seconds, rate)
        if self._started and (
            self._silence >= self.pause_seconds
            or (
                self.max_speech_seconds is not None
                and sum(len(a) for a in self._utterance) / rate
                >= self.max_speech_seconds
            )
        ):
            utterance = np.concatenate(self._utterance)
            self._listen()
            self._start_reply((rate, utterance))
            return True
        return False

    def _keep_last(self, seconds: float, rate: int) -> None:
        audio = np.concatenate(self._utterance) if self._utterance else None
        self._utterance = [] if audio is None else [audio[-int(seconds * rate) :]]

    def _interrupt(self) -> None:
        with self._lock:
            self._reply += 1
            self._replying = False
        while True:
            try:
                self._outputs.get_nowait()
            except queue.Empty:
                break
        if self._clear_queue is not None:
            self.clear_queue()

    def shutdown(self) -> None:
        # The stream ended: a reply still running stops at its next yield
        with self._lock:
            self._reply += 1
            self._replying = False

    def _start_reply(self, audio: tuple[int, np.ndarray]) -> None:
        with self._lock:
            self._reply += 1
            reply = self._reply
            self._replying = True
        # The context carries gr.Info / gr.Warning to this stream's page
        context = contextvars.copy_context()
        threading.Thread(
            target=context.run, args=(self._run, reply, audio), daemon=True
        ).start()

    def _current(self, reply: int) -> bool:
        with self._lock:
            return reply == self._reply

    def _run(self, reply: int, audio: tuple[int, np.ndarray]) -> None:
        generator: Any = None
        try:
            if not self.args_set.is_set():
                self.wait_for_args_sync()
            generator = self._call(audio, *self.latest_args)
            if inspect.isasyncgen(generator):
                self._run_async(reply, generator)
            else:
                for output in generator:
                    if not self._current(reply):
                        break
                    self._outputs.put((reply, output))
        except BaseException as e:  # raised from emit(), which reports it
            self._outputs.put((reply, e))
        finally:
            if generator is not None and not inspect.isasyncgen(generator):
                generator.close()
            with self._lock:
                if reply == self._reply:
                    self._replying = False

    def _run_async(self, reply: int, generator: Any) -> None:
        context = contextvars.copy_context()

        async def next_output() -> Any:
            for var, value in context.items():
                var.set(value)
            return await anext(generator)

        try:
            while self._current(reply):
                try:
                    output = asyncio.run_coroutine_threadsafe(
                        next_output(), self.loop
                    ).result()
                except StopAsyncIteration:
                    break
                if self._current(reply):
                    self._outputs.put((reply, output))
        finally:
            asyncio.run_coroutine_threadsafe(generator.aclose(), self.loop).result()

    def emit(self) -> Any:
        while True:
            try:
                reply, output = self._outputs.get_nowait()
            except queue.Empty:
                return None
            if not self._current(reply):
                continue
            if isinstance(output, BaseException):
                raise output
            return output
