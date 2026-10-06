import dataclasses
import datetime
import decimal
import enum
import json
import math
import pathlib
import threading
import time
import uuid
from collections import Counter, OrderedDict, namedtuple

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from pydantic import BaseModel

import gradio as gr
from gradio import client_state
from gradio.client_state import StateCache, StateSealer
from gradio.route_utils import API_PREFIX
from gradio.state_serialization import StateSerializationError, dumps, loads


class Color(enum.Enum):
    RED = 1


Point = namedtuple("Point", "x y")


@dataclasses.dataclass(frozen=True)
class Frozen:
    a: int
    b: list


class Model(BaseModel):
    x: int
    when: datetime.datetime


class Plain:
    def __init__(self):
        self.history = [1, (2, 3)]
        self.lookup = {1: "a"}


class Slotted:
    __slots__ = ("a",)

    def __init__(self):
        self.a = 5


class CustomPickle:
    def __reduce__(self):
        return (CustomPickle, ())


ROUND_TRIP_VALUES = [
    None,
    True,
    1,
    2**70,
    -(2**70),
    1.5,
    float("inf"),
    "text",
    [1, (2, 3)],
    {1: "a", (1, 2): {3}},
    {"__gr__": 1},
    frozenset([1]),
    b"bytes",
    bytearray(b"bytearray"),
    1 + 2j,
    decimal.Decimal("1.1"),
    uuid.UUID("12345678-1234-5678-1234-567812345678"),
    pathlib.Path("/a/b"),
    datetime.datetime(2020, 1, 2, 3, 4, 5, tzinfo=datetime.timezone.utc),
    datetime.date(2020, 1, 2),
    datetime.time(1, 2),
    datetime.timedelta(3, 4, 5),
    OrderedDict(a=1),
    Counter("aab"),
    Color.RED,
    Point(1, 2),
    Frozen(1, [2]),
    Model(x=1, when=datetime.datetime(2020, 1, 1)),
    np.int64(5),
    pd.Timestamp("2020-01-01 00:00:00.000000001"),
    pd.Timedelta(5, "s"),
]


class TestSerialization:
    @pytest.mark.parametrize("value", ROUND_TRIP_VALUES, ids=lambda v: type(v).__name__)
    def test_round_trip(self, value):
        result = loads(dumps(value))
        assert result == value
        assert type(result) is type(value)

    def test_nan(self):
        assert math.isnan(loads(dumps(float("nan"))))

    def test_numpy(self):
        for array in [
            np.arange(6, dtype=np.float32).reshape(2, 3),
            np.array(["a", "bc"]),
            np.zeros((2, 2), dtype=[("x", "<i4"), ("y", "<f8")]),
        ]:
            result = loads(dumps(array))
            assert result.dtype == array.dtype
            assert (result == array).all()
            assert result.flags.writeable

    def test_pandas(self):
        frame = pd.DataFrame(
            {
                "a": [1, 2],
                "b": ["x", None],
                "c": pd.to_datetime(["2020-01-01", None]).tz_localize("UTC"),
                "d": pd.Categorical(["u", "v"]),
                "e": [1.5, np.nan],
            },
            index=pd.Index(["r1", "r2"]),
        )
        pd.testing.assert_frame_equal(loads(dumps(frame)), frame)
        series = pd.Series(
            [1, 2],
            index=pd.MultiIndex.from_tuples([(1, "a"), (2, "b")]),
            name="s",
        )
        pd.testing.assert_series_equal(loads(dumps(series)), series)
        assert loads(dumps(pd.NaT)) is pd.NaT

    def test_image(self):
        image = Image.new("RGBA", (3, 2), (1, 2, 3, 4))
        result = loads(dumps(image))
        assert result.mode == "RGBA"
        assert result.tobytes() == image.tobytes()

    def test_app_classes(self):
        result = loads(dumps(Plain()))
        assert isinstance(result, Plain)
        assert result.history == [1, (2, 3)]
        assert result.lookup == {1: "a"}
        assert loads(dumps(Slotted())).a == 5

    def test_gradio_components(self, tmp_path):
        # e.g. a gr.ChatInterface reply that includes a file
        path = tmp_path / "a.txt"
        path.write_text("hi")
        history = [
            {"role": "assistant", "content": ["see:", gr.File(value=str(path))]},
            {"role": "assistant", "content": gr.Image(label="pic")},
        ]
        result = loads(dumps(history))
        rebuilt = result[0]["content"][1]
        assert isinstance(rebuilt, gr.File)
        assert rebuilt.value["path"].endswith("a.txt")
        assert not rebuilt.is_rendered
        assert result[1]["content"].label == "pic"
        with pytest.raises(StateSerializationError):
            dumps(gr.Textbox(value=lambda: "computed"))
        forged = json.dumps(
            {"__gr__": "component", "cls": "threading:Thread", "v": {}}
        ).encode()
        with pytest.raises(StateSerializationError):
            loads(forged)

    def test_shared_references_are_copied(self):
        shared = [1]
        result = loads(dumps([shared, shared]))
        assert result == [[1], [1]]
        assert result[0] is not result[1]

    @pytest.mark.parametrize(
        "value",
        [
            lambda: 1,
            threading.Lock(),
            np.array([object()]),
            CustomPickle(),
            {"lock": threading.Lock()},
            Image.new("CMYK", (1, 1)),
        ],
        ids=["lambda", "lock", "object_array", "custom_pickle", "nested_lock", "cmyk"],
    )
    def test_unsupported(self, value):
        with pytest.raises(StateSerializationError):
            dumps(value)

    def test_cycles(self):
        cycle = []
        cycle.append(cycle)
        with pytest.raises(StateSerializationError):
            dumps(cycle)

    def test_classes_from_libraries_are_not_rebuilt(self):
        with pytest.raises(StateSerializationError):
            dumps(threading.Event())
        forged = json.dumps(
            {"__gr__": "object", "cls": "threading:Event", "v": {}}
        ).encode()
        with pytest.raises(StateSerializationError):
            loads(forged)


class TestSealer:
    def test_round_trip_and_compression(self):
        sealer = StateSealer(b"secret")
        data = b"x" * 10_000
        token = sealer.seal(b"scope", data, 123.0)
        assert len(token) < 1000
        assert sealer.open(b"scope", token) == (data, 123.0)

    def test_token_hides_the_value(self):
        sealer = StateSealer(b"secret")
        token = sealer.seal(b"scope", b'"the answer is 42"', 0.0)
        assert b"answer" not in client_state._b64decode(token[3:])

    def test_rejects_tampering_and_other_scopes_and_keys(self):
        sealer = StateSealer(b"secret")
        token = sealer.seal(b"app:1", b"1", 0.0)
        tampered = token[:-2] + ("A" if token[-2] != "A" else "B") + token[-1]
        for scope, candidate, key in [
            (b"app:1", tampered, b"secret"),
            (b"app:2", token, b"secret"),
            (b"app:1", token, b"other"),
            (b"app:1", "v0." + token[3:], b"secret"),
        ]:
            with pytest.raises(client_state.InvalidStateTokenError):
                StateSealer(key).open(scope, candidate)

    def test_refs_are_keyed_and_scoped(self):
        sealer = StateSealer(b"secret")
        assert sealer.ref(b"a:1", b"1") == sealer.ref(b"a:1", b"1")
        assert sealer.ref(b"a:1", b"1") != sealer.ref(b"a:2", b"1")
        assert StateSealer(b"other").ref(b"a:1", b"1") != sealer.ref(b"a:1", b"1")


def test_cache_is_bounded_by_size():
    cache = StateCache(max_bytes=10)
    cache.put("a", b"12345", 0)
    cache.put("b", b"12345", 0)
    cache.get("a")
    cache.put("c", b"12345", 0)
    assert "a" in cache and "c" in cache and "b" not in cache
    assert cache.size == 10
    cache.put("big", b"x" * 11, 0)
    assert "big" not in cache


class FakeBrowser:
    """Talks to an app the way the JS client does: it holds the state tokens
    the server sends and sends them back with each event."""

    def __init__(self, client: TestClient, inline_limit=0, session_hash="s"):
        self.client = client
        self.inline_limit = inline_limit
        self.session_hash = session_hash
        self.tokens: dict[str, dict] = {}
        self.retries = 0

    def payload(self, force=()):
        return {
            _id: {"token": entry["token"]}
            if len(entry["token"]) <= self.inline_limit or int(_id) in force
            else {"ref": entry["ref"]}
            for _id, entry in self.tokens.items()
        }

    def apply(self, updates):
        for _id, entry in (updates or {}).items():
            if entry is None:
                self.tokens.pop(_id, None)
            else:
                self.tokens[_id] = entry

    def run(self, fn_index, data, state=True):
        body = {"data": data, "fn_index": fn_index, "session_hash": self.session_hash}
        if state:
            body["state"] = self.payload()
        response = self.client.post(f"{API_PREFIX}/queue/join", json=body)
        if response.status_code == 409:
            self.retries += 1
            missing = response.json()["detail"]["missing_state"]
            body["state"] = self.payload(force=set(missing))
            response = self.client.post(f"{API_PREFIX}/queue/join", json=body)
        assert response.status_code == 200, response.text
        event_id = response.json()["event_id"]
        stream = self.client.get(
            f"{API_PREFIX}/queue/data", params={"session_hash": self.session_hash}
        )
        outputs = []
        for line in stream.iter_lines():
            if not line.startswith("data:"):
                continue
            message = json.loads(line[5:])
            if message.get("event_id") != event_id:
                continue
            if message["msg"] in ("process_generating", "process_completed"):
                output = message["output"]
                assert message.get("success", True), output
                self.apply(output.get("state"))
                outputs.append(output)
            if message["msg"] == "process_completed":
                break
        return outputs[-1] if len(outputs) == 1 else outputs


@pytest.fixture
def launch():
    demos = []

    def _launch(demo):
        demos.append(demo)
        app, _, _ = demo.launch(prevent_thread_lock=True)
        return app

    yield _launch
    for demo in demos:
        demo.close()


def counter_app(**state_kwargs):
    with gr.Blocks() as demo:
        state = gr.State(0, **state_kwargs)
        number = gr.Number()
        gr.Button().click(lambda n: (n + 1, n + 1), state, [state, number])
    return demo, state


class TestClientHeldState:
    def test_state_round_trips_through_the_browser(self, launch):
        demo, state = counter_app()
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            assert [browser.run(0, [None])["data"][1] for _ in range(3)] == [1, 2, 3]
            assert browser.retries == 0
            assert list(browser.tokens) == [str(state._id)]
            # Nothing is kept for the session on the server
            assert state._id not in app.state_holder["s"].state_data

    def test_another_server_asks_for_the_value(self, launch):
        demo, _ = counter_app()
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            browser.run(0, [None])
            browser.run(0, [None])
            # Simulate a different replica (same GRADIO_SECRET_KEY) or a restart
            app.state_cache.clear()
            app.state_holder.session_data.clear()
            assert browser.run(0, [None])["data"][1] == 3
            assert browser.retries == 1
            # It is cached again now
            assert browser.run(0, [None])["data"][1] == 4
            assert browser.retries == 1

    def test_small_values_are_sent_inline(self, launch):
        demo, _ = counter_app()
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client, inline_limit=16_384)
            browser.run(0, [None])
            app.state_cache.clear()
            assert browser.run(0, [None])["data"][1] == 2
            assert browser.retries == 0

    def test_tampered_or_foreign_tokens_reset_the_state(self, launch, monkeypatch):
        demo, state = counter_app()
        app = launch(demo)
        monkeypatch.setattr(client_state, "_warned", set())
        with TestClient(app) as client:
            browser = FakeBrowser(client, inline_limit=16_384)
            browser.run(0, [None])
            browser.run(0, [None])
            entry = browser.tokens[str(state._id)]
            entry["token"] = entry["token"][:-4] + "AAAA"
            with pytest.warns(UserWarning, match="GRADIO_SECRET_KEY"):
                assert browser.run(0, [None])["data"][1] == 1

            # A server with a different key cannot read the token either
            browser.run(0, [None])
            monkeypatch.setenv("GRADIO_SECRET_KEY", "a different key")
            assert browser.run(0, [None])["data"][1] == 1

    def test_shared_secret_key(self, launch, monkeypatch):
        monkeypatch.setenv("GRADIO_SECRET_KEY", "shared")
        demo, _ = counter_app()
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client, inline_limit=16_384)
            browser.run(0, [None])
            # Another process with the same key, but its own random fallback key
            monkeypatch.setattr(client_state, "_process_secret", b"x" * 32)
            monkeypatch.setattr(client_state, "_sealers", {})
            app.state_cache.clear()
            assert browser.run(0, [None])["data"][1] == 2

    def test_time_to_live(self, launch):
        demo, _ = counter_app(time_to_live=0.5)
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            browser.run(0, [None])
            assert browser.run(0, [None])["data"][1] == 2
            time.sleep(0.6)
            assert browser.run(0, [None])["data"][1] == 1

    def test_in_place_changes_are_kept(self, launch):
        def add(history, message):
            history.append(message)
            return len(history)

        with gr.Blocks() as demo:
            history = gr.State([])
            text = gr.Textbox()
            count = gr.Number()
            text.submit(add, [history, text], count)
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            browser.run(0, [None, "a"])
            app.state_cache.clear()
            assert browser.run(0, [None, "b"])["data"][0] == 2
            assert browser.retries == 1

    def test_callable_initial_value_is_stable(self, launch):
        with gr.Blocks() as demo:
            session_id = gr.State(lambda: str(uuid.uuid4()))
            out = gr.Textbox()
            gr.Button().click(lambda s: s, session_id, out)
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            first = browser.run(0, [None])["data"][0]
            app.state_cache.clear()
            app.state_holder.session_data.clear()
            assert browser.run(0, [None])["data"][0] == first

    def test_unserializable_values_stay_on_the_server(self, launch, monkeypatch):
        monkeypatch.setattr(client_state, "_warned", set())

        def lock(counter):
            return {"count": counter["count"] + 1, "lock": threading.Lock()}

        with gr.Blocks() as demo:
            state = gr.State({"count": 0})
            number = gr.Number()
            gr.Button().click(lock, state, state).then(
                lambda s: s["count"], state, number
            )
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            with pytest.warns(UserWarning, match="storage='server'"):
                browser.run(0, [None])
            assert str(state._id) not in browser.tokens
            assert browser.run(1, [None])["data"][0] == 1
            browser.run(0, [None])
            assert browser.run(1, [None])["data"][0] == 2
            assert app.state_holder["s"].state_data[state._id]["count"] == 2

    def test_server_storage(self, launch):
        demo, state = counter_app(storage="server")
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            assert [browser.run(0, [None])["data"][1] for _ in range(2)] == [1, 2]
            assert browser.tokens == {}
            assert app.state_holder["s"].state_data[state._id] == 2

    def test_clients_without_state_keep_it_on_the_server(self, launch):
        demo, state = counter_app()
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            outputs = [browser.run(0, [None], state=False) for _ in range(2)]
            assert [o["data"][1] for o in outputs] == [1, 2]
            assert "state" not in outputs[-1]
            assert app.state_holder["s"].state_data[state._id] == 2

    def test_generators_send_each_change(self, launch):
        def count(n):
            for _ in range(3):
                n += 1
                yield n, n

        with gr.Blocks() as demo:
            state = gr.State(0)
            number = gr.Number()
            gr.Button().click(count, state, [state, number])
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            outputs = browser.run(0, [None])
            assert sum(1 for o in outputs if o.get("state")) == 3
            app.state_cache.clear()
            # The first chunk of the next run starts from the last value sent
            assert browser.run(0, [None])[0]["data"][1] == 4

    def test_change_events_and_unchanged_values(self, launch):
        with gr.Blocks() as demo:
            state = gr.State(0)
            number = gr.Number()
            changes = gr.Number(0)
            gr.Button().click(lambda n: min(n + 1, 1), state, state)
            state.change(lambda c: c + 1, changes, changes)
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            first = browser.run(0, [None])
            assert first["changed_state_ids"] == [state._id]
            assert str(state._id) in first["state"]
            second = browser.run(0, [None])
            assert second["changed_state_ids"] == []
            assert second["state"] == {}
        del number

    def test_validator_does_not_swallow_updates(self, launch):
        with gr.Blocks() as demo:
            state = gr.State(0)
            number = gr.Number()
            gr.Button().click(
                lambda n: (n + 1, n + 1),
                state,
                [state, number],
                validator=lambda n: gr.validate(True, ""),
            )
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client)
            assert [browser.run(0, [None])["data"][1] for _ in range(2)] == [1, 2]

    def test_a_token_is_only_valid_for_its_component(self, launch):
        with gr.Blocks() as demo:
            secret = gr.State("hidden")
            public = gr.State("")
            out = gr.Textbox()
            gr.Button().click(lambda s, p: (s, p), [secret, public], [secret, public])
            gr.Button().click(lambda p: p, public, out)
        app = launch(demo)
        with TestClient(app) as client:
            browser = FakeBrowser(client, inline_limit=16_384)
            browser.run(0, [None, None])
            browser.tokens[str(public._id)] = browser.tokens[str(secret._id)]
            assert browser.run(1, [None])["data"][0] == ""

    def test_delete_callback_requires_server_storage(self):
        with pytest.raises(ValueError, match="storage='server'"):
            gr.State(delete_callback=print)
        gr.State(delete_callback=print, storage="server")
