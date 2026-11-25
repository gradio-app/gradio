import asyncio
import importlib.util
import time

import numpy as np
import pytest

import gradio as gr
from gradio.streaming import ReplyOnPause, SileroVAD

RATE = 16000
FRAME = RATE // 50  # 20 ms, as the WebRTC transport delivers audio


class LoudnessVAD:
    """Counts a window as speech when it is loud."""

    sample_rate = RATE
    window_size = 512

    def is_speech(self, window):
        return bool(np.abs(window).max() > 0.1)

    def reset(self):
        pass

    def copy(self):
        return LoudnessVAD()


def say(handler, seconds, loud=True):
    for _ in range(int(seconds * 50)):
        value = 16000 if loud else 0
        handler.receive((RATE, np.full(FRAME, value, dtype=np.int16)))


def outputs(handler, count, timeout=5.0):
    got = []
    deadline = time.monotonic() + timeout
    while len(got) < count and time.monotonic() < deadline:
        output = handler.emit()
        if output is None:
            time.sleep(0.005)
        else:
            got.append(output)
    return got


def start(fn, **kwargs):
    handler = ReplyOnPause(fn, vad=LoudnessVAD(), **kwargs).copy()
    handler.set_args(["Ada"])
    handler.start_up()
    return handler


def test_replies_to_an_utterance_once_the_user_pauses():
    heard = []

    def reply(audio, name):
        rate, array = audio
        heard.append((rate, len(array) / rate, name))
        yield (rate, array[:100]), f"{name} said something"
        yield None, "done"

    handler = start(reply)
    say(handler, 1.0)
    assert outputs(handler, 1, timeout=0.2) == []  # still talking
    say(handler, 0.7, loud=False)
    first, second = outputs(handler, 2)
    assert heard[0][0] == RATE and heard[0][2] == "Ada"
    assert 1.0 <= heard[0][1] < 2.0
    assert first[1] == "Ada said something" and second == (None, "done")


def test_a_short_noise_gets_no_reply():
    calls = []

    def reply(audio, name):
        calls.append(audio)
        yield "reply"

    handler = start(reply)
    say(handler, 0.1)
    say(handler, 1.0, loud=False)
    assert outputs(handler, 1, timeout=0.2) == []
    assert calls == []


@pytest.mark.parametrize("can_interrupt", [True, False])
def test_talking_over_a_reply(can_interrupt):
    calls = []
    closed = []
    cleared = []

    def reply(audio, name):
        calls.append(audio)
        call = len(calls)
        try:
            for i in range(200):
                yield f"{call}:{i}"
                time.sleep(0.01)
        finally:
            closed.append(call)

    handler = start(reply, can_interrupt=can_interrupt)
    handler._clear_queue = lambda: cleared.append(True)
    say(handler, 0.5)
    say(handler, 0.7, loud=False)
    assert outputs(handler, 1) == ["1:0"]
    say(handler, 1.0)  # talks over the reply
    say(handler, 0.7, loud=False)
    later = outputs(handler, 3)
    if can_interrupt:
        # The first reply stops, what it had not sent yet is dropped, and the
        # new utterance gets its own reply
        assert cleared and closed == [1]
        assert later == ["2:0", "2:1", "2:2"]
    else:
        # What the user says during the reply is ignored
        assert not cleared and not closed and len(calls) == 1
        assert all(o.startswith("1:") for o in later)
        # Until the stream ends, which stops the reply
        handler.shutdown()
        deadline = time.monotonic() + 0.5  # it would run 2 s on its own
        while not closed and time.monotonic() < deadline:
            time.sleep(0.01)
        assert closed == [1]


def test_a_subclass_serves_each_stream():
    # Each stream gets a copy(), which must keep the subclass's overrides:
    # here, the pause comes from the stream's other input
    class Tunable(ReplyOnPause):
        def receive(self, frame):
            if self.latest_args:
                self.pause_seconds = float(self.latest_args[0])
            super().receive(frame)

    def reply(audio, pause):
        yield f"after a {pause} s pause"

    handler = Tunable(reply, vad=LoudnessVAD()).copy()
    assert type(handler) is Tunable
    handler.set_args([2.0])
    handler.start_up()
    say(handler, 0.5)
    say(handler, 1.0, loud=False)
    assert outputs(handler, 1, timeout=0.2) == []
    say(handler, 1.2, loud=False)
    assert outputs(handler, 1) == ["after a 2.0 s pause"]


@pytest.mark.asyncio
async def test_an_async_generator_replies_too():
    async def reply(audio, name):
        await asyncio.sleep(0)
        yield f"hello {name}"

    handler = start(reply)
    handler._loop = asyncio.get_running_loop()
    say(handler, 0.5)
    say(handler, 0.7, loud=False)
    for _ in range(200):
        output = handler.emit()
        if output is not None:
            break
        await asyncio.sleep(0.01)
    assert output == "hello Ada"


def test_needs_a_generator_and_the_vad_extra(monkeypatch):
    with pytest.raises(TypeError, match="generator function"):
        ReplyOnPause(lambda audio: audio, vad=LoudnessVAD())

    def reply(audio):
        yield audio

    with pytest.raises(ValueError, match="pause_seconds"):
        ReplyOnPause(reply, pause_seconds=0, vad=LoudnessVAD())
    monkeypatch.setattr(importlib.util, "find_spec", lambda name: None)
    with pytest.raises(ImportError, match=r"gradio\[vad\]"):
        SileroVAD()


def test_a_reply_that_takes_the_token_asks_for_sign_in():
    from gradio.server import _takes_oauth

    def reply(audio, token: gr.OAuthToken | None):
        yield audio

    def anonymous(audio):
        yield audio

    assert _takes_oauth(ReplyOnPause(reply, vad=LoudnessVAD()))
    assert not _takes_oauth(ReplyOnPause(anonymous, vad=LoudnessVAD()))


def test_a_handler_instance_is_accepted_where_functions_are():
    # Also checked statically: the type checker runs on this file
    def reply(audio, name):
        yield audio

    with gr.Blocks() as demo:
        mic = gr.Audio(sources=["microphone"], streaming=True)
        name = gr.Textbox()
        mic.stream(
            ReplyOnPause(reply, vad=LoudnessVAD()),
            inputs=[mic, name],
            outputs=[mic],
            transport="webrtc",
        )
    assert len(demo.fns) == 1
    gr.Server().api(
        ReplyOnPause(reply, vad=LoudnessVAD()), name="talk", transport="webrtc"
    )
