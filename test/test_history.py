"""Tests for durable run history: storage layout, the single recorder, and routes.

The fake Hub bucket below is a real in-memory filesystem rather than a mock with
canned returns, because most of what this feature relies on *is* the layout:
who can address which path, what a prefix listing returns, and what is left
behind when a write fails halfway.
"""

from __future__ import annotations

import asyncio
import json
import os
from contextlib import contextmanager
from dataclasses import dataclass
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import gradio as gr
import gradio.history as history_mod
from gradio.history import (
    HistoryRecord,
    HistoryTarget,
    PendingAsset,
    externalize_assets,
    new_record_id,
    validate_bucket_id,
)
from gradio.interface import close_all


def externalize(tree, counter=None, **kwargs):
    """Sync bridge: `externalize_assets` is async because capturing a remote
    asset goes through gradio's SSRF-protected client."""
    return asyncio.run(externalize_assets(tree, counter, **kwargs))


# ---------------------------------------------------------------- fake bucket


@dataclass
class _Entry:
    type: str
    path: str


class FakeHub:
    """An in-memory stand-in for the HfApi bucket surface."""

    def __init__(self):
        self.files: dict[str, bytes] = {}
        self.created: list[str] = []
        self.downloads: list[str] = []
        self.fail_next_add_paths: set[str] | None = None

    # -- HfApi surface --
    def create_bucket(self, bucket_id, private=None, exist_ok=False, **kw):
        self.created.append(bucket_id)

    def batch_bucket_files(self, bucket_id=None, add=None, delete=None, **kw):
        for path in delete or []:
            self.files.pop(path, None)
        for payload, path in add or []:
            if self.fail_next_add_paths and path in self.fail_next_add_paths:
                raise RuntimeError("simulated hub failure")
            if isinstance(payload, bytes):
                self.files[path] = payload
            else:
                with open(payload, "rb") as fh:
                    self.files[path] = fh.read()

    def list_bucket_tree(self, bucket_id, prefix=None, recursive=None, **kw):
        prefix = prefix or ""
        if not recursive:
            # Mirrors the real default, which returns folders rather than the
            # files inside them.
            seen = set()
            for path in self.files:
                if not path.startswith(prefix):
                    continue
                rest = path[len(prefix) :]
                if "/" in rest:
                    seen.add(prefix + rest.split("/", 1)[0])
                else:
                    yield _Entry("file", path)
            for folder in sorted(seen):
                yield _Entry("directory", folder)
            return
        for path in sorted(self.files):
            if path.startswith(prefix):
                yield _Entry("file", path)

    def download_bucket_files(self, bucket_id=None, files=None, token=None, **kw):
        for remote, local in files or []:
            path = getattr(remote, "path", remote)
            self.downloads.append(path)
            if path not in self.files:
                continue
            os.makedirs(os.path.dirname(local) or ".", exist_ok=True)
            with open(local, "wb") as fh:
                fh.write(self.files[path])


def make_target(*, app_id="app", bucket="alice/hist", token="tok"):
    history_mod._ensured.clear()
    return HistoryTarget(bucket, token, app_id)


@contextmanager
def use_hub(hub):
    with patch.object(history_mod, "_api", lambda _target: hub):
        yield


def make_record(endpoint="predict", **kw):
    return HistoryRecord(
        record_id=kw.pop("record_id", new_record_id()),
        endpoint=endpoint,
        inputs=kw.pop("inputs", {}),
        outputs=kw.pop("outputs", {}),
        started_at=kw.pop("started_at", "2026-08-24T12:00:00.000Z"),
        **kw,
    )


# ------------------------------------------------------------------ validation


def test_validate_bucket_id_rejects_traversal():
    validate_bucket_id("alice/history")
    for bad in ["alice", "alice/..", "../etc", "alice//x", "", "alice/./x"]:
        with pytest.raises(ValueError):
            validate_bucket_id(bad)


# ------------------------------------------------------------ layout + sharing


def test_records_are_filed_under_app_endpoint():
    hub = FakeHub()
    target = make_target(app_id="myapp")
    with use_hub(hub):
        history_mod.save_record(
            target, make_record(endpoint="predict", record_id="0001abc")
        )
    (path,) = list(hub.files)
    assert path == "runs/myapp/predict/0001abc.json"


def test_a_bucket_is_one_shared_history():
    """Connecting a team to a bucket means the team shares its history.

    The Hub decides who may write to the bucket; inside it there is no finer
    owner boundary, so two people pointing at one bucket see one timeline.
    """
    hub = FakeHub()
    alice = make_target(token="alice-token")
    bob = HistoryTarget(alice.bucket, "bob-token", alice.app_id)

    with use_hub(hub):
        history_mod.save_record(
            alice,
            make_record(record_id="0001a", outputs={"o": "from alice"}),
        )
        history_mod.save_record(
            bob,
            make_record(record_id="0002b", outputs={"o": "from bob"}),
        )
        records = history_mod.list_records(bob)

    assert [r.record_id for r in records] == ["0002b", "0001a"]
    assert records[1].outputs == {"o": "from alice"}


# ------------------------------------------------------------ bounded reading


def test_list_records_downloads_only_the_page_it_returns():
    """`limit` bounds the work, not just the result.

    The previous implementation downloaded the newest 200 record files on every
    cache miss regardless of `limit`, and dropped everything past 200 entirely.
    """
    hub = FakeHub()
    target = make_target()
    with use_hub(hub):
        for i in range(300):
            history_mod.save_record(
                target, make_record(record_id=f"{i:013d}aaaaaaaaaaaa")
            )
        hub.downloads.clear()
        records = history_mod.list_records(target, limit=10)

    assert len(records) == 10
    assert len(hub.downloads) == 10
    # ...and they are the newest ten, not an arbitrary slice.
    assert [r.record_id for r in records] == [
        f"{i:013d}aaaaaaaaaaaa" for i in range(299, 289, -1)
    ]


# ------------------------------------------------------------------- assets


def test_externalize_assets_replaces_local_files_with_markers(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"png")
    tree = {"a": {"value": {"path": str(f), "mime_type": "image/png"}}, "b": 3}
    rewritten, assets = externalize(tree)
    assert rewritten["a"]["value"] == {"__asset__": "a001.png"}
    assert rewritten["b"] == 3
    assert assets["a001.png"].local_path == str(f)


def test_untrusted_asset_path_is_not_uploaded(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    hub = FakeHub()
    target = make_target()
    with use_hub(hub):
        history_mod.save_record(
            target,
            make_record(record_id="r1"),
            {"a001.txt": PendingAsset(local_path="/etc/passwd")},
        )
    assert all(p.endswith("r1.json") for p in hub.files)


# --------------------------------------------------------- orphaned assets


def test_remote_media_is_fetched_and_stored():
    """A URL on another origin is dead within the hour; storing it verbatim
    produces a record that looks saved and renders broken later."""
    hub = FakeHub()
    target = make_target()
    with patch(
        "gradio.history.fetch_remote_asset",
        new=AsyncMock(return_value=(b"REMOTE", "image/png")),
    ):
        rewritten, assets = externalize(
            {
                "o": {
                    "value": {
                        "url": "https://other.hf.space/gradio_api/file=/tmp/x.png"
                    }
                }
            }
        )
    assert rewritten["o"]["value"] == {"__asset__": "a001.png"}
    record = make_record(record_id="r1", outputs=rewritten)
    with use_hub(hub):
        history_mod.save_record(target, record, assets)
        data, _ = history_mod.get_asset_bytes(target, "predict", "r1", "a001.png")
    assert data == b"REMOTE"


def test_remote_fetch_goes_through_gradios_ssrf_protected_client():
    """Output URLs come from the graph, so an unguarded fetch would make history
    an SSRF primitive against the host's own network. Rather than re-deriving a
    weaker check, this must route through the same guarded client gradio already
    uses everywhere else — public-host allow-list, IP-pinned, redirects
    re-validated."""
    from gradio.history import fetch_remote_asset

    response = MagicMock(
        status_code=200, content=b"OK", headers={"content-type": "image/png"}
    )
    with patch(
        "gradio.processing_utils.async_ssrf_protected_get",
        new=AsyncMock(return_value=response),
    ) as guarded:
        result = asyncio.run(fetch_remote_asset("https://example.com/x.png"))
    guarded.assert_awaited_once_with("https://example.com/x.png")
    assert result == (b"OK", "image/png")


# ------------------------------------------------------------ bucket lifecycle


# ------------------------------------------------------------------- recorder


def test_history_is_partitioned_by_app_id():
    """A new commit restarts the Space and a local restart re-execs, and either
    way `blocks.app_id` is re-minted — which is the point. An app's endpoints,
    or a workflow's whole graph, can change between deploys, and runs recorded
    against the old shape are not replayable against the new one."""
    from gradio import history

    with gr.Blocks() as demo:
        gr.Textbox()
    first = history.app_id_of(demo)
    demo.app_id = 999888777  # what a restart amounts to
    assert history.app_id_of(demo) != first


# --------------------------------------------------------------------- routes


@pytest.fixture
def history_client():
    io = gr.Interface(lambda x: x, "text", "text")
    app, _, _ = io.launch(prevent_thread_lock=True)
    yield TestClient(app)
    io.close()
    close_all()


class TestRunHistoryRoutes:
    def test_every_route_requires_a_session(self, history_client):
        for method, path in [
            ("POST", "/gradio_api/run-history/connect"),
            ("GET", "/gradio_api/run-history/buckets"),
            ("GET", "/gradio_api/run-history/records?bucket=a/b"),
            ("GET", "/gradio_api/run-history/records/p/r1/assets/a1?bucket=a/b"),
        ]:
            r = history_client.request(method, path, json={"bucket_id": "user/name"})
            assert r.status_code == 401, path

    def test_there_is_no_client_push_route(self, history_client):
        """Records are written by the server from what it ran. A route that
        accepted a record from a client would be a second, forgeable path."""
        r = history_client.post(
            "/gradio_api/run-history/records", json={"record_id": "abc"}
        )
        assert r.status_code == 405


@pytest.fixture
def authed_history():
    from gradio import oauth
    from gradio.routes import App

    with gr.Blocks() as demo:
        gr.Textbox()
    app = App.create_app(demo)
    hub = FakeHub()
    app.dependency_overrides[oauth.require_oauth_token] = lambda: "tok"
    with (
        patch("gradio.history.resolve_token", return_value="tok"),
        patch("gradio.history.HfApi", return_value=hub),
    ):
        yield TestClient(app), hub
    app.dependency_overrides.clear()
    close_all()


class TestRunHistoryValidation:
    def test_bucket_is_required_on_every_read(self, authed_history):
        client, _ = authed_history
        assert client.get("/gradio_api/run-history/records").status_code == 422

    def test_two_buckets_in_one_session_do_not_interfere(self, authed_history):
        """The whole point of dropping the session slot: two tabs, two buckets,
        one cookie."""
        client, hub = authed_history
        client.get("/gradio_api/run-history/records?bucket=alice/one")
        client.get("/gradio_api/run-history/records?bucket=alice/two")
        # Both reads went to the bucket each request named.
        assert (
            client.get("/gradio_api/run-history/records?bucket=alice/one").json()[
                "records"
            ]
            == []
        )


def test_run_history_false_disables_bucket_routes():
    io = gr.Interface(lambda x: x, "text", "text")
    app, _, _ = io.launch(prevent_thread_lock=True, run_history=False)
    client = TestClient(app)
    assert client.get("/gradio_api/run-history/records?bucket=a/b").status_code == 404
    io.close()
    close_all()


# --------------------------------------------------- end-to-end: regular apps


def _wait_for(predicate, timeout=30.0):
    """Poll until *predicate* holds. Recording is fire-and-forget, so there is
    nothing to await; the ceiling is generous because a loaded CI runner can be
    slow to get to the task, and a passing check returns immediately anyway."""
    import time as _time

    deadline = _time.time() + timeout
    while _time.time() < deadline:
        if predicate():
            return True
        _time.sleep(0.02)
    return False


@pytest.fixture
def recording_app(monkeypatch):
    """A normal gradio app wired to a fake bucket, with no history-specific
    code in the app itself."""
    monkeypatch.delenv("GRADIO_HISTORY_BUCKET", raising=False)
    hub = FakeHub()

    def greet(name):
        return f"hello {name}"

    io = gr.Interface(greet, "text", "text", api_name="greet")
    app, _, _ = io.launch(prevent_thread_lock=True)
    with (
        patch("gradio.history.resolve_token", return_value="tok"),
        patch("gradio.history.HfApi", return_value=hub),
    ):
        yield TestClient(app), hub, io
    io.close()
    close_all()


class TestServerSideRecording:
    def test_a_normal_prediction_is_recorded(self, recording_app):
        client, hub, io = recording_app
        fn_index = next(
            i for i, f in io.fns.items() if f.api_name and "greet" in f.api_name
        )
        r = client.post(
            f"/gradio_api/run/{io.fns[fn_index].api_name}",
            json={"data": ["world"]},
            headers={"X-Gradio-History-Bucket": "alice/hist"},
        )
        assert r.status_code == 200, r.text

        assert _wait_for(lambda: len(hub.files) == 1), "no record was written"
        (path,) = list(hub.files)
        assert path.startswith(f"runs/{io.app_id}/greet/")
        record = json.loads(hub.files[path])
        # The values are the server's own, not something a client supplied.
        assert record["inputs"] == ["world"]
        assert record["outputs"] == ["hello world"]
        assert record["endpoint"] == "greet"
        assert set(record) == {
            "record_id",
            "endpoint",
            "inputs",
            "outputs",
            "started_at",
            "schema_version",
        }

    def test_a_hub_failure_does_not_fail_the_prediction(self, recording_app):
        client, hub, io = recording_app
        hub.fail_next_add_paths = None
        hub.batch_bucket_files = MagicMock(side_effect=RuntimeError("hub down"))
        r = client.post(
            "/gradio_api/run/greet",
            json={"data": ["world"]},
            headers={"X-Gradio-History-Bucket": "alice/hist"},
        )
        assert r.status_code == 200
        assert r.json()["data"] == ["hello world"]


def test_a_record_still_in_flight_survives_shutdown(monkeypatch):
    """Records are filed as detached tasks, so a shutdown that does not wait for
    them loses whatever has not reached the Hub yet. The delay goes in the
    prelude rather than in the Hub call on purpose: `anyio.to_thread.run_sync`
    cannot interrupt its worker thread, so a write that has already started
    finishes either way and would not tell the two behaviours apart."""
    monkeypatch.delenv("GRADIO_HISTORY_BUCKET", raising=False)
    hub = FakeHub()
    original = history_mod.externalize_assets

    async def slow_externalize(*args, **kwargs):
        await asyncio.sleep(0.3)
        return await original(*args, **kwargs)

    def greet(name):
        return f"hello {name}"

    io = gr.Interface(greet, "text", "text", api_name="greet")
    app, _, _ = io.launch(prevent_thread_lock=True)
    with (
        patch("gradio.history.resolve_token", return_value="tok"),
        patch("gradio.history.HfApi", return_value=hub),
        patch("gradio.history.externalize_assets", slow_externalize),
        TestClient(app) as client,
    ):
        r = client.post(
            "/gradio_api/run/greet",
            json={"data": ["world"]},
            headers={"X-Gradio-History-Bucket": "alice/hist"},
        )
        assert r.status_code == 200, r.text
    # Leaving the block runs the lifespan shutdown, which is where the drain is.
    assert len(hub.files) == 1, "the record was dropped by the shutdown"
    io.close()
    close_all()


# ------------------------------------------------- end-to-end: workflow canvas


WORKFLOW_GRAPH = {
    "schema_version": "2",
    "references": [
        {
            "id": "prompt",
            "role": "reference",
            "label": "Prompt",
            "asset_type": "text",
            "inputs": [{"id": "in", "label": "Text", "type": "text"}],
            "outputs": [{"id": "out", "label": "Text", "type": "text"}],
            "data": {"out": "a cat"},
        }
    ],
    "operators": [
        {
            "id": "gen",
            "role": "operator",
            "kind": "model",
            "model_id": "some/model",
            "pipeline_tag": "text-to-image",
            "inputs": [
                {"id": "prompt", "label": "Prompt", "type": "text", "required": True}
            ],
            "outputs": [
                {"id": "out_0", "label": "Image", "type": "image", "output_index": 0}
            ],
            "data": {},
        }
    ],
    "subjects": [
        {
            "id": "result",
            "role": "subject",
            "label": "Result Image",
            "asset_type": "image",
            "inputs": [{"id": "in", "label": "Image", "type": "image"}],
            "outputs": [{"id": "out", "label": "Image", "type": "image"}],
            "data": {},
        }
    ],
    "edges": [
        {
            "id": "e1",
            "from_node_id": "prompt",
            "from_port_id": "out",
            "to_node_id": "gen",
            "to_port_id": "prompt",
            "type": "text",
        },
        {
            "id": "e2",
            "from_node_id": "gen",
            "from_port_id": "out_0",
            "to_node_id": "result",
            "to_port_id": "in",
            "type": "image",
        },
    ],
}


@pytest.fixture
def workflow_app(tmp_path, monkeypatch):
    monkeypatch.delenv("GRADIO_HISTORY_BUCKET", raising=False)
    monkeypatch.delenv("GRADIO_HISTORY_APP_KEY", raising=False)
    monkeypatch.delenv("SPACE_ID", raising=False)
    graph = tmp_path / "wf.json"
    graph.write_text(json.dumps(WORKFLOW_GRAPH))
    hub = FakeHub()
    with pytest.warns(UserWarning):
        wf = gr.Workflow(graph=str(graph))
    app, _, _ = wf.launch(prevent_thread_lock=True)
    canvas = next(b for b in wf.blocks.values() if type(b).__name__ == "WorkflowCanvas")
    with (
        patch("gradio.history.resolve_token", return_value="tok"),
        patch("gradio.history.HfApi", return_value=hub),
    ):
        yield TestClient(app), hub, wf, canvas._id
    wf.close()
    close_all()


def _call_server_fn(client, component_id, fn_name, data):
    return client.post(
        "/gradio_api/component_server/",
        json={
            "session_hash": "test-session",
            "component_id": component_id,
            "fn_name": fn_name,
            "data": data,
        },
    )


class TestWorkflowRecording:
    def test_canvas_run_uses_the_metadata_the_canvas_already_has(self, workflow_app):
        client, hub, wf, cid = workflow_app
        r = _call_server_fn(
            client,
            cid,
            "record_workflow_run",
            [
                "alice/hist",
                "Result Image",
                {
                    "prompt": {
                        "value": "a cat",
                        "label": "Prompt",
                        "type": "text",
                        "port_id": "out",
                    }
                },
                {
                    "result": {
                        "value": "generated",
                        "label": "Result Image",
                        "type": "image",
                        "port_id": "in",
                    }
                },
            ],
        )
        assert r.status_code == 200, r.text
        payload = json.loads(r.json())
        assert "error" not in payload, payload
        assert payload["record"]["endpoint"] == "Result-Image"

        assert _wait_for(lambda: len(hub.files) == 1)
        (path,) = list(hub.files)
        app_id = __import__("gradio").history.app_id_of(wf)
        assert path.startswith(f"runs/{app_id}/Result-Image/")

        record = json.loads(hub.files[path])
        assert record["inputs"]["prompt"]["label"] == "Prompt"
        assert record["inputs"]["prompt"]["type"] == "text"
        assert record["inputs"]["prompt"]["port_id"] == "out"
        assert record["outputs"]["result"]["label"] == "Result Image"
        assert record["outputs"]["result"]["type"] == "image"

    def test_client_cannot_choose_record_metadata(self, workflow_app):
        client, hub, _wf, cid = workflow_app
        _call_server_fn(
            client,
            cid,
            "record_workflow_run",
            [
                "alice/hist",
                "result",
                {"record_id": "attacker-chosen", "started_at": "yesterday"},
                {"result": {"value": "y", "type": "text"}},
            ],
        )
        assert _wait_for(lambda: len(hub.files) == 1)
        (path,) = list(hub.files)
        record = json.loads(hub.files[path])
        assert record["record_id"] != "attacker-chosen"
        assert record["started_at"] != "yesterday"

    def test_internal_dependencies_are_not_recorded(self, monkeypatch):
        """Parity with the browser-local history, which records only the
        endpoints the API page documents. Example loaders, clear buttons and
        friends fire on page load and would otherwise fill the bucket."""
        hub = FakeHub()
        with gr.Blocks() as demo:
            box = gr.Textbox()
            out = gr.Textbox()
            gr.Button().click(
                lambda x: x, box, out, api_name="public_one", api_visibility="public"
            )
            gr.Button().click(lambda x: x, box, out, api_visibility="private")
        app, _, _ = demo.launch(prevent_thread_lock=True)
        internal = next(f for f in demo.fns.values() if f.api_visibility != "public")
        with (
            patch("gradio.history.resolve_token", return_value="tok"),
            patch("gradio.history.HfApi", return_value=hub),
        ):
            client = TestClient(app)
            headers = {"X-Gradio-History-Bucket": "alice/hist"}
            r = client.post(
                f"/gradio_api/run/{internal._id}",
                json={"data": ["x"], "fn_index": internal._id},
                headers=headers,
            )
            # The event really ran; it was the recorder that declined it.
            assert r.status_code == 200, r.text
            import time as _time

            _time.sleep(0.3)
            assert hub.files == {}, "an internal dependency was recorded"

            client.post(
                "/gradio_api/run/public_one",
                json={"data": ["x"]},
                headers=headers,
            )
            assert _wait_for(lambda: len(hub.files) == 1)
        demo.close()
        close_all()


def test_a_direct_local_app_uses_the_hosts_own_token():
    """The browser opened on localhost can use the host's CLI login without
    needing the Workflow-only write-token handshake."""
    from gradio.routes import App

    hub = FakeHub()
    with gr.Blocks() as demo:
        gr.Textbox()
    app = App.create_app(demo)
    url = "/gradio_api/run-history/records?bucket=alice/hist"

    with (
        patch("gradio.workflow._get_locally_saved_hf_token", return_value="hf_local"),
        patch("gradio.history.HfApi", return_value=hub),
    ):
        local = TestClient(
            app,
            base_url="http://localhost",
            client=("127.0.0.1", 50000),
        ).get(url)
        assert local.status_code == 200, local.text
    close_all()


def test_a_remote_request_cannot_use_the_hosts_own_token():
    """Neither a share proxy nor a LAN visitor inherits the host credential."""
    from gradio.routes import App

    with gr.Blocks() as demo:
        gr.Textbox()
    app = App.create_app(demo)
    url = "/gradio_api/run-history/records?bucket=alice/hist"

    with patch("gradio.workflow._get_locally_saved_hf_token", return_value="hf_local"):
        share_proxy = TestClient(
            app,
            base_url="https://example.gradio.live",
            client=("127.0.0.1", 50000),
        ).get(url)
        lan_visitor = TestClient(
            app,
            base_url="http://localhost",
            client=("192.168.1.50", 50000),
        ).get(url)
        assert share_proxy.status_code == 401
        assert lan_visitor.status_code == 401
    close_all()
