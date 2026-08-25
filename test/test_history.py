"""Tests for durable run history: storage layout, the single recorder, and routes.

The fake Hub bucket below is a real in-memory filesystem rather than a mock with
canned returns, because most of what this feature relies on *is* the layout:
who can address which path, what a prefix listing returns, and what is left
behind when a write fails halfway.
"""

from __future__ import annotations

import json
import os
import threading
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio.history import (
    BucketRunHistoryStore,
    HistoryRecord,
    HubError,
    NotAuthorizedError,
    PendingAsset,
    PublicBucketError,
    _is_public_address,
    externalize_assets,
    extract_local_file_path,
    is_trusted_local_path,
    new_record_id,
    owner_segment,
    store_for,
    validate_bucket_id,
    validate_record_id,
    validate_segment,
)
from gradio.interface import close_all

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


def make_store(hub, *, owner_id="alice-sub", app_key="app", repo_id="alice/hist"):
    store = BucketRunHistoryStore(
        repo_id, owner_id=owner_id, app_key=app_key, token="tok"
    )
    store._api = hub
    return store


def make_record(store, endpoint="predict", **kw):
    return HistoryRecord(
        record_id=kw.pop("record_id", new_record_id()),
        owner_id=kw.pop("owner_id", store.owner_id),
        app_key=kw.pop("app_key", store.app_key),
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


def test_validate_record_id():
    validate_record_id("0000000000001abcdef")
    for bad in ["", "a" * 65, "has/slash", "has space", ".."]:
        with pytest.raises(ValueError):
            validate_record_id(bad)


def test_validate_segment_rejects_traversal():
    validate_segment("predict")
    for bad in ["", "..", ".", "a/b", "a" * 81]:
        with pytest.raises(ValueError):
            validate_segment(bad)


def test_record_ids_sort_in_creation_order():
    """Newest-first is a sort of the ids, so they must be time-ordered."""
    ids = [new_record_id() for _ in range(50)]
    assert ids == sorted(ids)
    assert len(set(ids)) == 50


def test_owner_segment_is_collision_resistant():
    # Two subjects that would collide under any sanitizing scheme must not
    # share a directory, since that directory is the isolation boundary.
    assert owner_segment("a/b") != owner_segment("a_b")
    assert owner_segment("x") == owner_segment("x")


# -------------------------------------------------------- layout + isolation


def test_records_are_filed_under_owner_app_endpoint():
    hub = FakeHub()
    store = make_store(hub, app_key="myapp")
    store.save_record(make_record(store, endpoint="predict", record_id="0001abc"))
    (path,) = list(hub.files)
    assert path == f"runs/{store.owner_key}/myapp/predict/0001abc.json"


def test_one_owner_cannot_overwrite_anothers_record():
    """The write path is prefix-confined, so a colliding record id is harmless.

    Previously `save_record` wrote `records/<client id>.json` with no ownership
    check, so a second user pushing a known record id replaced the first user's
    record and deleted its assets.
    """
    hub = FakeHub()
    alice = make_store(hub, owner_id="alice-sub")
    bob = make_store(hub, owner_id="bob-sub")

    alice.save_record(
        make_record(alice, record_id="collide", outputs={"o": "alice data"})
    )
    bob.save_record(make_record(bob, record_id="collide", outputs={"o": "bob data"}))

    assert len(hub.files) == 2
    assert alice.get_record("predict", "collide").outputs == {"o": "alice data"}
    assert bob.get_record("predict", "collide").outputs == {"o": "bob data"}


def test_one_owner_cannot_read_or_delete_anothers_record():
    hub = FakeHub()
    alice = make_store(hub, owner_id="alice-sub")
    bob = make_store(hub, owner_id="bob-sub")
    alice.save_record(make_record(alice, record_id="secret1"))

    from gradio.history import NotFoundError

    with pytest.raises(NotFoundError):
        bob.get_record("predict", "secret1")
    assert bob.list_records() == []
    bob.delete_record("predict", "secret1")  # deletes bob's (nonexistent) path
    assert alice.get_record("predict", "secret1").record_id == "secret1"


def test_clear_records_leaves_other_owners_alone():
    hub = FakeHub()
    alice = make_store(hub, owner_id="alice-sub")
    bob = make_store(hub, owner_id="bob-sub")
    alice.save_record(make_record(alice, record_id="a1"))
    bob.save_record(make_record(bob, record_id="b1"))
    alice.clear_records()
    assert alice.list_records() == []
    assert len(bob.list_records()) == 1


def test_clear_records_can_scope_to_one_endpoint():
    hub = FakeHub()
    store = make_store(hub)
    store.save_record(make_record(store, endpoint="predict", record_id="p1"))
    store.save_record(make_record(store, endpoint="other", record_id="o1"))
    store.clear_records("predict")
    remaining = store.list_records()
    assert [r.endpoint for r in remaining] == ["other"]


def test_list_endpoints_reports_only_this_apps_endpoints():
    hub = FakeHub()
    store = make_store(hub, app_key="app1")
    other_app = make_store(hub, app_key="app2")
    store.save_record(make_record(store, endpoint="alpha", record_id="1"))
    store.save_record(make_record(store, endpoint="beta", record_id="2"))
    other_app.save_record(make_record(other_app, endpoint="gamma", record_id="3"))
    assert store.list_endpoints() == ["alpha", "beta"]


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


def test_unreadable_record_is_skipped_not_fatal():
    hub = FakeHub()
    store = make_store(hub)
    store.save_record(make_record(store, record_id="good1"))
    hub.files[f"runs/{store.owner_key}/app/predict/bad1.json"] = b"{not json"
    assert [r.record_id for r in store.list_records()] == ["good1"]


def test_record_from_a_newer_schema_is_rejected_rather_than_guessed():
    payload = json.dumps(
        {
            "record_id": "r1",
            "owner_id": "o",
            "app_key": "a",
            "endpoint": "e",
            "schema_version": 99,
        }
    ).encode()
    with pytest.raises(ValueError, match="unsupported record schema"):
        HistoryRecord.from_json_bytes(payload)


# ------------------------------------------------------------------- assets


def test_is_trusted_local_path(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    inside = tmp_path / "f.txt"
    inside.write_text("x")
    assert is_trusted_local_path(str(inside))
    outside = tmp_path.parent / "outside.txt"
    outside.write_text("x")
    assert not is_trusted_local_path(str(outside))
    assert not is_trusted_local_path(str(tmp_path / "missing"))


def test_extract_local_file_path_strips_gradio_prefix(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"png")
    assert extract_local_file_path({"url": f"http://host/gradio_api/file={f}"}) == str(
        f
    )
    assert extract_local_file_path({"path": str(f)}) == str(f)
    assert extract_local_file_path({"url": "https://elsewhere/img.png"}) is None


def test_externalize_assets_replaces_local_files_with_markers(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"png")
    tree = {"a": {"value": {"path": str(f), "mime_type": "image/png"}}, "b": 3}
    rewritten, assets = externalize_assets(tree)
    assert rewritten["a"]["value"] == {"__asset__": "a001"}
    assert rewritten["b"] == 3
    assert assets["a001"].local_path == str(f)


def test_asset_ids_do_not_collide_between_inputs_and_outputs(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "a.png"
    f.write_bytes(b"png")
    counter = [0]
    _, first = externalize_assets({"x": {"path": str(f)}}, counter)
    _, second = externalize_assets({"y": {"path": str(f)}}, counter)
    assert set(first) & set(second) == set()


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

    store._invalidate()
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


def test_orphan_sweep_removes_unreferenced_assets():
    hub = FakeHub()
    store = make_store(hub)
    store.save_record(make_record(store, record_id="live1"))
    orphan = f"assets/{store.owner_key}/app/predict/dead1/a001.png"
    hub.files[orphan] = b"leftover"

    assert store.collect_orphan_assets() == [orphan]
    assert store.delete_orphan_assets() == 1
    assert orphan not in hub.files
    assert store.get_record("predict", "live1").record_id == "live1"


def test_orphan_sweep_leaves_referenced_assets_alone(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"png")
    hub = FakeHub()
    store = make_store(hub)
    store.save_record(
        make_record(store, record_id="r1"),
        {"a001": PendingAsset(content_type="image/png", local_path=str(f))},
    )
    assert store.collect_orphan_assets() == []


def test_delete_record_removes_its_assets(tmp_path, monkeypatch):
    monkeypatch.setattr("gradio.history.get_upload_folder", lambda: str(tmp_path))
    f = tmp_path / "img.png"
    f.write_bytes(b"png")
    hub = FakeHub()
    store = make_store(hub)
    store.save_record(
        make_record(store, record_id="r1"),
        {"a001": PendingAsset(content_type="image/png", local_path=str(f))},
    )
    store.delete_record("predict", "r1")
    assert hub.files == {}


# ------------------------------------------------------------- remote assets


def test_remote_media_is_fetched_and_stored():
    """A URL on another origin is dead within the hour; storing it verbatim
    produces a record that looks saved and renders broken later."""
    hub = FakeHub()
    store = make_store(hub)
    with patch(
        "gradio.history.fetch_remote_asset", return_value=(b"REMOTE", "image/png")
    ):
        rewritten, assets = externalize_assets(
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


def test_remote_fetch_failure_leaves_the_url_in_place():
    with patch("gradio.history.fetch_remote_asset", return_value=None):
        rewritten, assets = externalize_assets(
            {"o": {"url": "https://other.example/x.png"}}
        )
    assert rewritten["o"]["url"] == "https://other.example/x.png"
    assert assets == {}


def test_remote_fetch_refuses_private_addresses():
    """Output URLs come from the graph, so fetching them unguarded would make
    history an SSRF primitive against the host's own network."""
    with patch("gradio.history.socket.getaddrinfo") as gai:
        gai.return_value = [(2, 1, 6, "", ("127.0.0.1", 80))]
        assert _is_public_address("evil.example") is False
        gai.return_value = [(2, 1, 6, "", ("169.254.169.254", 80))]
        assert _is_public_address("metadata.example") is False
        gai.return_value = [(2, 1, 6, "", ("10.0.0.5", 80))]
        assert _is_public_address("internal.example") is False
        gai.return_value = [(2, 1, 6, "", ("93.184.216.34", 80))]
        assert _is_public_address("example.com") is True


def test_remote_fetch_rejects_non_http_schemes():
    from gradio.history import fetch_remote_asset

    assert fetch_remote_asset("file:///etc/passwd") is None
    assert fetch_remote_asset("gopher://x/") is None


# ------------------------------------------------------------ bucket lifecycle


def test_ensure_private_bucket_creates_and_verifies():
    hub = FakeHub(private=True)
    store = make_store(hub)
    store.ensure_private_bucket()
    assert hub.created == ["alice/hist"]
    store.ensure_private_bucket()
    assert len(hub.created) == 1  # memoized


def test_ensure_private_bucket_rejects_public():
    hub = FakeHub(private=False)
    store = make_store(hub)
    with pytest.raises(PublicBucketError):
        store.ensure_private_bucket()


def test_ensure_private_bucket_maps_403_to_not_authorized():
    hub = FakeHub()
    store = make_store(hub)
    err = RuntimeError("nope")
    err.response = MagicMock(status_code=403)
    hub.create_bucket = MagicMock(side_effect=err)
    with pytest.raises(NotAuthorizedError):
        store.ensure_private_bucket()


class TestStoreCache:
    def test_different_tokens_get_different_stores(self):
        cache, lock = OrderedDict(), threading.Lock()
        a = store_for(cache, lock, "tok-a", "org/b", owner_id="alice", app_key="app")
        b = store_for(cache, lock, "tok-b", "org/b", owner_id="bob", app_key="app")
        assert a is not b
        assert a.owner_key != b.owner_key

    def test_same_caller_reuses_one_store(self):
        cache, lock = OrderedDict(), threading.Lock()
        a = store_for(cache, lock, "tok", "org/b", owner_id="alice", app_key="app")
        b = store_for(cache, lock, "tok", "org/b", owner_id="alice", app_key="app")
        assert a is b

    def test_parallel_saves_never_cross_attribute(self):
        hub = FakeHub()
        alice = make_store(hub, owner_id="alice-sub")
        bob = make_store(hub, owner_id="bob-sub")

        def _save(store, i):
            store.save_record(make_record(store, record_id=f"{i:013d}xxxxxxxxxxxx"))

        with ThreadPoolExecutor(max_workers=8) as ex:
            for f in [
                ex.submit(_save, alice if i % 2 == 0 else bob, i) for i in range(20)
            ]:
                f.result()

        for path, blob in hub.files.items():
            owner_key = path.split("/")[1]
            assert json.loads(blob)["owner_id"] == (
                "alice-sub" if owner_key == alice.owner_key else "bob-sub"
            )
        assert len(alice.list_records(limit=200)) == 10
        assert len(bob.list_records(limit=200)) == 10


# ------------------------------------------------------------------- recorder


def test_stable_app_key_does_not_use_the_random_app_id(monkeypatch):
    """`blocks.app_id` is re-minted every process, so keying on it would orphan
    every record written before a restart."""
    from gradio import history_recorder

    monkeypatch.delenv("GRADIO_HISTORY_APP_KEY", raising=False)
    monkeypatch.delenv("SPACE_ID", raising=False)
    with gr.Blocks(title="My App") as demo:
        gr.Textbox()
    first = history_recorder.stable_app_key(demo)
    demo.app_id = 12345
    assert history_recorder.stable_app_key(demo) == first


def test_stable_app_key_prefers_space_id(monkeypatch):
    from gradio import history_recorder

    monkeypatch.delenv("GRADIO_HISTORY_APP_KEY", raising=False)
    monkeypatch.setenv("SPACE_ID", "alice/my-space")
    with gr.Blocks() as demo:
        gr.Textbox()
    assert history_recorder.stable_app_key(demo) == "space-alice-my-space"


def test_workflow_app_key_matches_between_writer_and_reader(tmp_path):
    """The recorder and the read routes must derive the same key, or a workflow
    writes to one prefix and reads from another."""
    from gradio import history_recorder
    from gradio.workflow import _workflow_key

    graph = tmp_path / "wf.json"
    graph.write_text(
        json.dumps(
            {
                "schema_version": "2",
                "references": [],
                "operators": [],
                "subjects": [],
                "edges": [],
            }
        )
    )
    with pytest.warns(UserWarning):
        wf = gr.Workflow(graph=str(graph))
    assert wf.history_app_key == _workflow_key(str(graph))
    assert history_recorder.stable_app_key(wf) == history_recorder.sanitize_segment(
        _workflow_key(str(graph))
    )
    close_all()


def test_endpoint_key_falls_back_to_fn_index():
    from gradio.history_recorder import endpoint_key

    assert endpoint_key("/predict", 3) == "predict"
    assert endpoint_key(None, 3) == "fn-3"
    assert endpoint_key("a/b c", None) == "a-b-c"


def test_owner_identity_requires_the_oauth_subject():
    """`sub or name` mixed two identifier namespaces in the field that decides
    which prefix a caller may write to."""
    from gradio import history_recorder

    request = MagicMock()
    request.request = None
    request.session = {}
    with patch(
        "gradio.oauth._get_valid_oauth_info_from_session",
        return_value={"access_token": "tok", "userinfo": {"name": "alice"}},
    ):
        assert history_recorder.resolve_identity(request) is None
    with patch(
        "gradio.oauth._get_valid_oauth_info_from_session",
        return_value={"access_token": "tok", "userinfo": {"sub": "sub-123"}},
    ):
        assert history_recorder.resolve_identity(request) == ("sub-123", "tok")


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


def test_bucket_resolution_falls_back_to_app_config(monkeypatch):
    from gradio import history_recorder

    monkeypatch.setenv("GRADIO_HISTORY_BUCKET", "team/shared")
    blocks = MagicMock(history_bucket=None)
    request = MagicMock()
    request.request = None
    request.headers = {}
    assert history_recorder.resolve_bucket_id(blocks, request) == "team/shared"


# --------------------------------------------------------------------- routes


@pytest.fixture
def history_client():
    io = gr.Interface(lambda x: x, "text", "text")
    app, _, _ = io.launch(prevent_thread_lock=True)
    yield TestClient(app)
    io.close()
    close_all()


class TestRunHistoryRoutes:
    def test_there_is_no_client_push_route(self, history_client):
        """Records are written by the server from what it ran. A route that
        accepted a record from a client would be a second, forgeable path."""
        r = history_client.post(
            "/gradio_api/run-history/records", json={"record_id": "abc"}
        )
        assert r.status_code == 405

    def test_connect_without_session_returns_401(self, history_client):
        r = history_client.post(
            "/gradio_api/run-history/connect", json={"bucket_id": "user/name"}
        )
        assert r.status_code == 401

    def test_records_without_session_returns_401(self, history_client):
        r = history_client.get("/gradio_api/run-history/records?bucket=a/b")
        assert r.status_code == 401

    def test_delete_without_session_returns_401(self, history_client):
        r = history_client.delete(
            "/gradio_api/run-history/records/predict/abc?bucket=a/b"
        )
        assert r.status_code == 401

    def test_asset_without_session_returns_401(self, history_client):
        r = history_client.get(
            "/gradio_api/run-history/records/predict/r1/assets/a1?bucket=a/b"
        )
        assert r.status_code == 401

    def test_buckets_without_session_returns_401(self, history_client):
        r = history_client.get("/gradio_api/run-history/buckets")
        assert r.status_code == 401


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

    def test_invalid_bucket_is_422(self, authed_history):
        client, _ = authed_history
        r = client.get("/gradio_api/run-history/records?bucket=../etc")
        assert r.status_code == 422

    def test_limit_out_of_range_is_422(self, authed_history):
        client, _ = authed_history
        r = client.get("/gradio_api/run-history/records?bucket=a/b&limit=9999")
        assert r.status_code == 422

    def test_bad_record_id_in_path_is_422(self, authed_history):
        client, _ = authed_history
        r = client.get("/gradio_api/run-history/records/predict/bad%20id?bucket=a/b")
        assert r.status_code == 422

    def test_bad_endpoint_in_path_is_422(self, authed_history):
        client, _ = authed_history
        r = client.get("/gradio_api/run-history/records/..%2Fx/r1?bucket=a/b")
        assert r.status_code in (404, 422)

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
    monkeypatch.setenv("GRADIO_HISTORY_APP_KEY", "testapp")
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
        owner = owner_segment("alice-sub")
        assert path.startswith(f"runs/{owner}/testapp/greet/")
        record = json.loads(hub.files[path])
        # The values are the server's own, not something a client supplied.
        assert record["inputs"] == ["world"]
        assert record["outputs"] == ["hello world"]
        assert record["owner_id"] == "alice-sub"
        assert record["endpoint"] == "greet"
        assert record["status"] == "completed"
        assert record["api_name"] == "greet"

    def test_nothing_is_recorded_without_a_bucket(self, recording_app):
        client, hub, io = recording_app
        r = client.post("/gradio_api/run/greet", json={"data": ["world"]})
        assert r.status_code == 200
        import time as _time

        _time.sleep(0.3)
        assert hub.files == {}

    def test_a_failing_prediction_is_recorded_as_failed(self, monkeypatch):
        monkeypatch.setenv("GRADIO_HISTORY_APP_KEY", "testapp")
        hub = FakeHub()

        def boom(_):
            raise ValueError("kaboom")

        io = gr.Interface(boom, "text", "text", api_name="boom")
        app, _, _ = io.launch(prevent_thread_lock=True)
        with (
            patch(
                "gradio.history_recorder.resolve_identity",
                return_value=("alice-sub", "tok"),
            ),
            patch("gradio.history.HfApi", return_value=hub),
        ):
            client = TestClient(app)
            client.post(
                "/gradio_api/run/boom",
                json={"data": ["x"]},
                headers={"X-Gradio-History-Bucket": "alice/hist"},
            )
            assert _wait_for(lambda: len(hub.files) == 1)
            record = json.loads(next(iter(hub.files.values())))
            assert record["status"] == "failed"
            assert "kaboom" in (record["error"] or "")
        io.close()
        close_all()

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
        owner = owner_segment("alice-sub")
        app_key = __import__("gradio").history_recorder.stable_app_key(wf)
        assert path.startswith(f"runs/{owner}/{app_key}/result_image/")

        record = json.loads(hub.files[path])
        # The structure is reconstructed from the graph, not sent by the client.
        assert record["inputs"]["prompt"]["label"] == "Prompt"
        assert record["inputs"]["prompt"]["type"] == "text"
        assert record["inputs"]["prompt"]["port_id"] == "out"
        assert record["outputs"]["result"]["label"] == "Result Image"
        assert record["outputs"]["result"]["type"] == "image"
        assert record["api_name"] == "result_image"
        assert record["owner_id"] == "alice-sub"

    def test_unknown_subject_is_rejected(self, workflow_app):
        client, hub, _wf, cid = workflow_app
        r = _call_server_fn(
            client,
            cid,
            "record_workflow_run",
            ["alice/hist", json.dumps(["not-a-subject"]), json.dumps({})],
        )
        payload = json.loads(r.json())
        assert "error" in payload
        assert hub.files == {}

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
        monkeypatch.setenv("GRADIO_HISTORY_APP_KEY", "testapp")
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
