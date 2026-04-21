from types import SimpleNamespace
import pickle

from gradio.context import LocalContext
from gradio import zerogpu
from gradio.helpers import TrackedIterable
from gradio.queueing import Queue


def test_queue_log_message_rpcs_when_transport_present():
    events = []
    token = LocalContext.queue_transport.set(events.append)
    try:
        Queue.log_message(object(), "evt", "hello", "title", "info", 5, True)
    finally:
        LocalContext.queue_transport.reset(token)

    assert events == [
        ("log_message", ("evt", "hello", "title", "info", 5, True), {}),
    ]


def test_handle_event_uses_current_queue():
    seen = []

    class DummyQueue:
        def log_message(self, *args, **kwargs):
            seen.append((args, kwargs))

    token = LocalContext.blocks.set(SimpleNamespace(_queue=DummyQueue()))
    try:
        zerogpu.handle_event(("log_message", ("evt", "hello", "title", "info"), {"visible": False}))
    finally:
        LocalContext.blocks.reset(token)

    assert seen == [(("evt", "hello", "title", "info"), {"visible": False})]


def test_install_middleware_adds_spaces_middleware(monkeypatch):
    calls = []

    class FakeMiddleware:
        pass

    class FakeApp:
        def add_middleware(self, middleware_cls, **kwargs):
            calls.append((middleware_cls, kwargs))

    monkeypatch.setattr(zerogpu, "spaces", SimpleNamespace(ZeroGPUMiddleware=FakeMiddleware))
    monkeypatch.setattr(zerogpu, "is_zero_gpu_space", lambda: True)

    assert zerogpu.install_middleware(FakeApp()) is True
    assert calls
    middleware_cls, kwargs = calls[0]
    assert middleware_cls is FakeMiddleware
    assert kwargs["worker_init"] is zerogpu.worker_init
    assert kwargs["worker_init_arg"] is zerogpu.worker_init_arg
    assert kwargs["handle_event"] is zerogpu.handle_event


def test_tracked_iterable_is_pickleable():
    tracked = TrackedIterable(iter([1, 2]), 1, 2, "desc", "steps", object(), 0.5)

    loaded = pickle.loads(pickle.dumps(tracked))

    assert loaded.iterable is None
    assert loaded._tqdm is None
    assert loaded.index == 1
    assert loaded.length == 2
    assert loaded.desc == "desc"
    assert loaded.unit == "steps"
    assert loaded.progress == 0.5
