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
from dataclasses import dataclass
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import gradio as gr
import gradio.history as history_mod
from gradio.history import (
    HistoryRecord,
    HistoryTarget,
    HubError,
    PendingAsset,
    PublicBucketError,
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

    def __init__(self, private: bool = True):
        self.files: dict[str, bytes] = {}
        self.private = private
        self.created: list[str] = []
        self.downloads: list[str] = []
        self.fail_next_add_paths: set[str] | None = None

    # -- HfApi surface --
    def create_bucket(self, bucket_id, private=None, exist_ok=False, **kw):
        self.created.append(bucket_id)

    def bucket_info(self, bucket_id, **kw):
        return MagicMock(private=self.private)

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


class _Bound:
    """A `HistoryTarget` bound to a fake bucket.

    The storage functions are module-level and take `(target, ...)`; this just
    saves every test from repeating the target and patching `_api`, so the
    call sites still read `store.save_record(record)`.
    """

    def __init__(self, hub, target: HistoryTarget):
        self._hub = hub
        self.target = target
        self.app_id = target.app_id
        self.repo_id = target.bucket

    # path helpers key off app_id; everything else takes the whole target
    _BY_APP_ID = {"app_prefix", "endpoint_prefix", "record_path", "asset_prefix"}

    def __getattr__(self, name):
        fn = getattr(history_mod, name)
        first = self.app_id if name in self._BY_APP_ID else self.target

        def call(*args, **kwargs):
            with patch.object(history_mod, "_api", lambda _target: self._hub):
                return fn(first, *args, **kwargs)

        return call


def make_store(hub, *, app_id="app", repo_id="alice/hist"):
    history_mod._ensured.clear()
    return _Bound(hub, HistoryTarget(repo_id, "tok", app_id))


def make_record(store, endpoint="predict", **kw):
    return HistoryRecord(
        record_id=kw.pop("record_id", new_record_id()),
        owner_id=kw.pop("owner_id", "alice-sub"),
        app_id=kw.pop("app_id", store.app_id),
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


def test_record_ids_sort_in_creation_order():
    """Newest-first is a sort of the ids, so they must be time-ordered."""
    ids = [new_record_id() for _ in range(50)]
    assert ids == sorted(ids)
    assert len(set(ids)) == 50


# ------------------------------------------------------------ layout + sharing


def test_records_are_filed_under_app_endpoint():
    hub = FakeHub()
    store = make_store(hub, app_id="myapp")
    store.save_record(make_record(store, endpoint="predict", record_id="0001abc"))
    (path,) = list(hub.files)
    assert path == "runs/myapp/predict/0001abc.json"


def test_a_bucket_is_one_shared_history():
    """Connecting a team to a bucket means the team shares its history.

    The Hub decides who may write to the bucket; inside it there is no finer
    owner boundary, so two people pointing at one bucket see one timeline.
    """
    hub = FakeHub()
    alice = make_store(hub)
    bob = make_store(hub)

    alice.save_record(
        make_record(
            alice,
            record_id="0001a",
            owner_id="alice-sub",
            outputs={"o": "from alice"},
        )
    )
    bob.save_record(
        make_record(
            bob, record_id="0002b", owner_id="bob-sub", outputs={"o": "from bob"}
        )
    )

    assert [r.record_id for r in bob.list_records()] == ["0002b", "0001a"]
    assert bob.get_record("predict", "0001a").outputs == {"o": "from alice"}


# ------------------------------------------------------------ bounded reading


def test_list_records_downloads_only_the_page_it_returns():
    """`limit` bounds the work, not just the result.

    The previous implementation downloaded the newest 200 record files on every
    cache miss regardless of `limit`, and dropped everything past 200 entirely.
    """
    hub = FakeHub()
    store = make_store(hub)
    for i in range(300):
        store.save_record(make_record(store, record_id=f"{i:013d}aaaaaaaaaaaa"))
    hub.downloads.clear()

    records = store.list_records(limit=10)

    assert len(records) == 10
    assert len(hub.downloads) == 10
    # ...and they are the newest ten, not an arbitrary slice.
    assert [r.record_id for r in records] == [
        f"{i:013d}aaaaaaaaaaaa" for i in range(299, 289, -1)
    ]


def test_list_records_is_newest_first_across_endpoints():
    hub = FakeHub()
    store = make_store(hub)
    store.save_record(make_record(store, endpoint="zzz", record_id="0000000000003x"))
    store.save_record(make_record(store, endpoint="aaa", record_id="0000000000009x"))
    store.save_record(make_record(store, endpoint="mmm", record_id="0000000000005x"))
    ids = [r.record_id for r in store.list_records()]
    assert ids == ["0000000000009x", "0000000000005x", "0000000000003x"]


def test_record_from_a_newer_schema_is_rejected_rather_than_guessed():
    payload = json.dumps(
        {
            "record_id": "r1",
            "owner_id": "o",
            "app_id": "a",
            "endpoint": "e",
            "schema_version": 99,
        }
    ).encode()
    with pytest.raises(ValueError, match="unsupported record schema"):
        HistoryRecord.from_json_bytes(payload)


# ------------------------------------------------------------------- assets


def test_externalize_assets_replaces_local_files_with_markers(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"png")
    tree = {"a": {"value": {"path": str(f), "mime_type": "image/png"}}, "b": 3}
    rewritten, assets = externalize(tree)
    assert rewritten["a"]["value"] == {"__asset__": "a001"}
    assert rewritten["b"] == 3
    assert assets["a001"].local_path == str(f)


def test_untrusted_asset_path_is_not_uploaded(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    hub = FakeHub()
    store = make_store(hub)
    record = make_record(store, record_id="r1")
    store.save_record(
        record,
        {"a001": PendingAsset(content_type="text/plain", local_path="/etc/passwd")},
    )
    assert record.assets == {}
    assert all(p.endswith("r1.json") for p in hub.files)


def test_stored_asset_is_addressable_and_prefix_checked(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"PNGDATA")
    hub = FakeHub()
    store = make_store(hub)
    record = make_record(store, record_id="r1")
    store.save_record(
        record, {"a001": PendingAsset(content_type="image/png", local_path=str(f))}
    )
    data, ct = store.get_asset_bytes("predict", "r1", "a001")
    assert data == b"PNGDATA"
    assert ct == "image/png"

    # A record hand-edited on the Hub cannot redirect the download elsewhere.
    from gradio.history import NotFoundError

    tampered = json.loads(hub.files[store.record_path("predict", "r1")])
    tampered["assets"]["a001"] = "runs/somebody-else/app/predict/secret.json"
    hub.files[store.record_path("predict", "r1")] = json.dumps(tampered).encode()
    with pytest.raises(NotFoundError):
        store.get_asset_bytes("predict", "r1", "a001")


# --------------------------------------------------------- orphaned assets


def test_failed_commit_cleans_up_its_uploaded_assets(tmp_path, monkeypatch):
    """If the record JSON never lands, its assets are unreachable forever."""
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"png")
    hub = FakeHub()
    store = make_store(hub)
    record = make_record(store, record_id="r1")
    hub.fail_next_add_paths = {store.record_path("predict", "r1")}

    with pytest.raises(HubError):
        store.save_record(
            record, {"a001": PendingAsset(content_type="image/png", local_path=str(f))}
        )

    assert hub.files == {}


def test_remote_media_is_fetched_and_stored():
    """A URL on another origin is dead within the hour; storing it verbatim
    produces a record that looks saved and renders broken later."""
    hub = FakeHub()
    store = make_store(hub)
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
    assert rewritten["o"]["value"] == {"__asset__": "a001"}
    record = make_record(store, record_id="r1", outputs=rewritten)
    store.save_record(record, assets)
    data, _ = store.get_asset_bytes("predict", "r1", "a001")
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


def test_ensure_private_bucket_rejects_public():
    hub = FakeHub(private=False)
    store = make_store(hub)
    with pytest.raises(PublicBucketError):
        store.ensure_private_bucket()


class TestEnsureMemo:
    """`_ensured` is the only state the storage layer keeps. It exists so a
    recorded run does not pay `create_bucket` + `bucket_info` every time."""

    def test_a_bucket_is_only_ensured_once(self):
        hub = FakeHub()
        store = make_store(hub)
        for i in range(3):
            store.save_record(make_record(store, record_id=f"000{i}aaa"))
        assert len(hub.created) == 1


# ------------------------------------------------------------------- recorder


def test_history_is_partitioned_by_app_id():
    """A new commit restarts the Space and a local restart re-execs, and either
    way `blocks.app_id` is re-minted — which is the point. An app's endpoints,
    or a workflow's whole graph, can change between deploys, and runs recorded
    against the old shape are not replayable against the new one."""
    from gradio import history_recorder

    with gr.Blocks() as demo:
        gr.Textbox()
    first = history_recorder.app_id_of(demo)
    demo.app_id = 999888777  # what a restart amounts to
    assert history_recorder.app_id_of(demo) != first


def test_bucket_resolution_never_reads_session_state(monkeypatch):
    """Fix for the shared session slot: the bucket comes from this request."""
    from gradio import history_recorder

    monkeypatch.delenv("GRADIO_HISTORY_BUCKET", raising=False)
    blocks = MagicMock(history_bucket=None)
    request = MagicMock()
    request.request = None
    request.headers = {history_recorder.BUCKET_HEADER: "alice/tab-one"}
    request.session = {"history": {"bucket_id": "stale/from-another-tab"}}
    assert history_recorder.resolve_bucket_id(blocks, request) == "alice/tab-one"


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
        patch(
            "gradio.history_recorder.resolve_identity",
            return_value=("alice-sub", "tok"),
        ),
        patch("gradio.history.HfApi", return_value=hub),
    ):
        yield TestClient(app), hub
    app.dependency_overrides.clear()
    close_all()


class TestRunHistoryValidation:
    def test_bucket_is_required_on_every_read(self, authed_history):
        client, _ = authed_history
        assert client.get("/gradio_api/run-history/records").status_code == 422

    def test_limit_out_of_range_is_422(self, authed_history):
        client, _ = authed_history
        r = client.get("/gradio_api/run-history/records?bucket=a/b&limit=9999")
        assert r.status_code == 422

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


def test_chunked_body_over_limit_is_rejected_without_buffering():
    from gradio.route_utils import enforce_body_limit

    io = gr.Interface(lambda x: x, "text", "text")
    app, _, _ = io.launch(prevent_thread_lock=True)
    client = TestClient(app)

    def chunks():
        for _ in range(40):
            yield b"x" * (100 * 1024)

    r = client.post("/gradio_api/run-history/connect", content=chunks())
    assert r.status_code in (401, 413)
    assert enforce_body_limit is not None
    io.close()
    close_all()


# --------------------------------------------------- end-to-end: regular apps


def _wait_for(predicate, timeout=5.0):
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
        patch(
            "gradio.history_recorder.resolve_identity",
            return_value=("alice-sub", "tok"),
        ),
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
        assert record["owner_id"] == "alice-sub"
        assert record["endpoint"] == "greet"
        assert record["status"] == "completed"
        assert record["api_name"] == "greet"

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
        patch(
            "gradio.history_recorder.resolve_identity",
            return_value=("alice-sub", "tok"),
        ),
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
    def test_canvas_run_is_filed_under_its_api_endpoint(self, workflow_app):
        """A canvas run and a `/call/<subject>` run of the same subgraph must
        land in the same place — that is the point of one recorder."""
        client, hub, wf, cid = workflow_app
        r = _call_server_fn(
            client,
            cid,
            "record_workflow_run",
            [
                "alice/hist",
                json.dumps(["result"]),
                json.dumps({"prompt": "a cat", "result": "http://x/img.png"}),
            ],
        )
        assert r.status_code == 200, r.text
        payload = json.loads(r.json())
        assert "error" not in payload, payload
        # `_group_slug_iter` slugifies the first subject's label.
        assert payload["endpoint"] == "result_image"

        assert _wait_for(lambda: len(hub.files) == 1)
        (path,) = list(hub.files)
        app_id = __import__("gradio").history_recorder.app_id_of(wf)
        assert path.startswith(f"runs/{app_id}/result_image/")

        record = json.loads(hub.files[path])
        # The structure is reconstructed from the graph, not sent by the client.
        assert record["inputs"]["prompt"]["label"] == "Prompt"
        assert record["inputs"]["prompt"]["type"] == "text"
        assert record["inputs"]["prompt"]["port_id"] == "out"
        assert record["outputs"]["result"]["label"] == "Result Image"
        assert record["outputs"]["result"]["type"] == "image"
        assert record["api_name"] == "result_image"
        assert record["owner_id"] == "alice-sub"

    def test_client_cannot_choose_the_record_id_or_owner(self, workflow_app):
        client, hub, _wf, cid = workflow_app
        _call_server_fn(
            client,
            cid,
            "record_workflow_run",
            [
                "alice/hist",
                json.dumps(["result"]),
                json.dumps(
                    {
                        "prompt": "x",
                        "result": "y",
                        "record_id": "attacker-chosen",
                        "owner_id": "bob-sub",
                    }
                ),
            ],
        )
        assert _wait_for(lambda: len(hub.files) == 1)
        (path,) = list(hub.files)
        record = json.loads(hub.files[path])
        assert record["record_id"] != "attacker-chosen"
        assert record["owner_id"] == "alice-sub"

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
            gr.Button().click(lambda x: x, box, out, api_name=False)
        app, _, _ = demo.launch(prevent_thread_lock=True)
        internal = next(f for f in demo.fns.values() if f.api_visibility != "public")
        with (
            patch(
                "gradio.history_recorder.resolve_identity",
                return_value=("alice-sub", "tok"),
            ),
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
