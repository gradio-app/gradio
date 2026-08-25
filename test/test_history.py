"""Unit + concurrency tests for gradio.history.BucketRunHistoryStore."""

from __future__ import annotations

import json
import os
import threading
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio.history import (
    BucketRunHistoryStore,
    HistoryRecord,
    HubError,
    NotAuthorizedError,
    PublicBucketError,
    bucket_for_token,
    externalize_assets,
    extract_local_file_path,
    is_trusted_local_path,
    validate_bucket_id,
    validate_record_id,
)
from gradio.interface import close_all


def _make_store(
    repo_id="alice/hist", owner_id="alice", app_key="app", token="tok-alice"
):
    mock_api = MagicMock()
    mock_api.bucket_info.return_value = MagicMock(private=True)
    store = BucketRunHistoryStore.__new__(BucketRunHistoryStore)
    store.repo_id = repo_id
    store.owner_id = owner_id
    store.app_key = app_key
    store._token = token
    store._api = mock_api
    store._ensure_lock = threading.Lock()
    store._ensured = True
    store._cache_lock = threading.Lock()
    store._cache = None
    store._cache_at = 0.0
    store._record_cache = OrderedDict()
    return store, mock_api


def _record(record_id="r1", **kw):
    return HistoryRecord(
        record_id=record_id,
        owner_id=kw.get("owner_id", "alice"),
        app_key=kw.get("app_key", "app"),
        created_at=kw.get("created_at", "2026-08-24T12:00:00Z"),
        inputs=kw.get("inputs", {}),
        outputs=kw.get("outputs", {}),
        subgraph=kw.get("subgraph"),
    )


def test_validate_bucket_id_rejects_traversal():
    validate_bucket_id("alice/hist")
    for bad in ["alice/..", "../etc", "alice/./x", "", "noslash"]:
        with pytest.raises(ValueError):
            validate_bucket_id(bad)


def test_validate_record_id():
    validate_record_id("abc123")
    validate_record_id("a-b_c")
    for bad in ["", "has/slash", "a" * 65, "sp ace", "wat!"]:
        with pytest.raises(ValueError):
            validate_record_id(bad)


def test_is_trusted_local_path_accepts_upload_folder(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
    good = tmp_path / "img.png"
    good.write_bytes(b"\x89PNG")
    assert is_trusted_local_path(str(good)) is True


def test_is_trusted_local_path_rejects_outside(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path / "cache"))
    (tmp_path / "cache").mkdir()
    outside = tmp_path / "elsewhere" / "leak.png"
    outside.parent.mkdir()
    outside.write_bytes(b"private")
    assert is_trusted_local_path(str(outside)) is False


def test_is_trusted_local_path_follows_symlinks(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path / "cache"))
    (tmp_path / "cache").mkdir()
    outside = tmp_path / "elsewhere" / "target.png"
    outside.parent.mkdir()
    outside.write_bytes(b"pwned")
    link = tmp_path / "cache" / "link.png"
    os.symlink(outside, link)
    assert is_trusted_local_path(str(link)) is False


def test_extract_local_file_path_strips_gradio_prefix(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
    f = tmp_path / "a.png"
    f.write_bytes(b"x")
    assert extract_local_file_path({"url": f"/gradio_api/file={f}"}) == str(f)


def test_externalize_assets_pulls_nested_filedata(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
    img = tmp_path / "img.png"
    img.write_bytes(b"\x89PNG")
    aud = tmp_path / "song.mp3"
    aud.write_bytes(b"ID3")
    tree: dict = {
        "outputs": {
            "n_img": {"value": {"path": str(img), "url": str(img)}},
            "n_audio": [{"path": str(aud)}],
            "n_text": {"value": "just text"},
        }
    }
    assets = externalize_assets(tree)
    assert len(assets) == 2
    outputs = tree["outputs"]
    assert isinstance(outputs["n_img"]["value"], dict)
    assert outputs["n_img"]["value"].get("__asset__")
    assert isinstance(outputs["n_audio"][0], dict)
    assert outputs["n_audio"][0].get("__asset__")
    assert outputs["n_text"]["value"] == "just text"


def test_externalize_assets_skips_untrusted(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path / "cache"))
    (tmp_path / "cache").mkdir()
    outside = tmp_path / "outside.png"
    outside.write_bytes(b"leak")
    tree = {"outputs": {"n1": {"value": {"path": str(outside)}}}}
    assets = externalize_assets(tree)
    assert assets == {}
    assert tree["outputs"]["n1"]["value"] == {"path": str(outside)}


def test_save_record_commits_json_after_assets(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
    store, mock_api = _make_store()
    img = tmp_path / "a.png"
    img.write_bytes(b"\x89PNG")
    record = _record("r1")
    store.save_record(record, local_assets={"a001": (str(img), "image/png")})
    assert mock_api.batch_bucket_files.call_count == 2
    first = mock_api.batch_bucket_files.call_args_list[0]
    assert first.kwargs["add"][0] == (str(img), "assets/r1/a001.png")
    second = mock_api.batch_bucket_files.call_args_list[1]
    data, path = second.kwargs["add"][0]
    assert path == "records/r1.json"
    saved = json.loads(data.decode())
    assert saved["record_id"] == "r1"
    assert saved["assets"] == {"a001": "assets/r1/a001.png"}


def test_save_record_skips_untrusted_asset(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path / "cache"))
    (tmp_path / "cache").mkdir()
    outside = tmp_path / "outside.png"
    outside.write_bytes(b"leak")
    store, mock_api = _make_store()
    store.save_record(
        _record("r1"),
        local_assets={"a001": (str(outside), "image/png")},
    )
    assert mock_api.batch_bucket_files.call_count == 1
    args = mock_api.batch_bucket_files.call_args.kwargs
    assert args["add"][0][1] == "records/r1.json"


def test_save_record_wraps_hub_errors():
    store, mock_api = _make_store()
    mock_api.batch_bucket_files.side_effect = RuntimeError("network down")
    with pytest.raises(HubError):
        store.save_record(_record())


def test_delete_record_removes_json_and_assets():
    store, mock_api = _make_store()
    # delete_record now reads the record first to confirm we own it
    store._download_bytes = lambda path: _record("r1").to_json_bytes()
    mock_api.list_bucket_tree.return_value = iter(
        [MagicMock(type="file", path=f"assets/r1/a{i:03d}.png") for i in range(3)]
    )
    store.delete_record("r1")
    call = mock_api.batch_bucket_files.call_args
    deleted = set(call.kwargs["delete"])
    assert "records/r1.json" in deleted
    assert deleted.issuperset(
        {"assets/r1/a000.png", "assets/r1/a001.png", "assets/r1/a002.png"}
    )


def test_clear_records_removes_everything():
    store, mock_api = _make_store()

    def _tree(repo, prefix, recursive=None):
        assert recursive is True, "assets/ must be listed recursively"
        if prefix == "records/":
            return iter([MagicMock(type="file", path="records/r1.json")])
        return iter([MagicMock(type="file", path="assets/r1/a001.png")])

    mock_api.list_bucket_tree.side_effect = _tree
    store._fetch_all_records = lambda: [_record("r1").to_json_bytes()]
    store.clear_records()
    deleted = set(mock_api.batch_bucket_files.call_args.kwargs["delete"])
    assert deleted == {"records/r1.json", "assets/r1/a001.png"}


def test_clear_records_leaves_other_owners_alone():
    """A shared org bucket must not be wiped by whoever clicks Clear."""
    store, mock_api = _make_store(owner_id="alice")

    def _tree(repo, prefix, recursive=None):
        if prefix == "records/":
            return iter([])
        return iter(
            [
                MagicMock(type="file", path="assets/r1/a001.png"),
                MagicMock(type="file", path="assets/r2/a001.png"),
            ]
        )

    mock_api.list_bucket_tree.side_effect = _tree
    store._fetch_all_records = lambda: [
        _record("r1", owner_id="alice").to_json_bytes(),
        _record("r2", owner_id="bob").to_json_bytes(),
    ]
    store.clear_records()
    deleted = set(mock_api.batch_bucket_files.call_args.kwargs["delete"])
    assert deleted == {"records/r1.json", "assets/r1/a001.png"}


def test_list_records_hides_other_owners_and_sorts_by_created_at():
    store, _ = _make_store(owner_id="alice")
    store._fetch_all_records = lambda: [
        _record(
            "old", owner_id="alice", created_at="2026-08-24T10:00:00Z"
        ).to_json_bytes(),
        _record(
            "theirs", owner_id="bob", created_at="2026-08-24T23:00:00Z"
        ).to_json_bytes(),
        _record(
            "new", owner_id="alice", created_at="2026-08-24T20:00:00Z"
        ).to_json_bytes(),
    ]
    got = store.list_records()
    assert [r.record_id for r in got] == ["new", "old"]


def test_get_and_delete_reject_another_owners_record():
    from gradio.history import NotFoundError

    store, mock_api = _make_store(owner_id="alice")
    theirs = _record("r9", owner_id="bob").to_json_bytes()
    store._download_bytes = lambda path: theirs
    with pytest.raises(NotFoundError):
        store.get_record("r9")
    with pytest.raises(NotFoundError):
        store.delete_record("r9")
    mock_api.batch_bucket_files.assert_not_called()


def test_ensure_private_bucket_creates_and_verifies():
    with (
        patch("gradio.history.HfApi") as mock_api_cls,
        patch("gradio.history.hf_get_token", return_value="tok"),
    ):
        mock_api = mock_api_cls.return_value
        mock_api.bucket_info.return_value = MagicMock(private=True)
        store = BucketRunHistoryStore(
            "alice/hist", token="tok", owner_id="alice", app_key="app"
        )
        store._api = mock_api
        store.ensure_private_bucket()
        mock_api.create_bucket.assert_called_once_with(
            "alice/hist", private=True, exist_ok=True
        )
        mock_api.bucket_info.assert_called_once()


def test_ensure_private_bucket_rejects_public():
    store, mock_api = _make_store()
    store._ensured = False
    mock_api.bucket_info.return_value = MagicMock(private=False)
    with pytest.raises(PublicBucketError):
        store.ensure_private_bucket()


def test_ensure_private_bucket_maps_403_to_not_authorized():
    store, mock_api = _make_store()
    store._ensured = False
    err = RuntimeError("Forbidden")
    err.response = MagicMock(status_code=403)  # ty: ignore[unresolved-attribute]
    mock_api.create_bucket.side_effect = err
    with pytest.raises(NotAuthorizedError):
        store.ensure_private_bucket()


class TestOwnerIsolation:
    def test_different_tokens_get_different_stores(self):
        cache, lock = OrderedDict(), threading.Lock()
        with patch("gradio.history.HfApi"):
            alice = bucket_for_token(
                cache,
                lock,
                "tok-a",
                "alice/hist",
                owner_id="alice",
                app_key="app",
            )
            bob = bucket_for_token(
                cache,
                lock,
                "tok-b",
                "alice/hist",
                owner_id="bob",
                app_key="app",
            )
        assert alice is not bob
        assert alice.owner_id == "alice"
        assert bob.owner_id == "bob"
        assert alice._token != bob._token

    def test_same_user_across_sessions_shares_store(self):
        cache, lock = OrderedDict(), threading.Lock()
        with patch("gradio.history.HfApi"):
            a = bucket_for_token(
                cache,
                lock,
                "tok-alice",
                "alice/hist",
                owner_id="alice",
                app_key="app",
            )
            b = bucket_for_token(
                cache,
                lock,
                "tok-alice",
                "alice/hist",
                owner_id="alice",
                app_key="app",
            )
        assert a is b

    def test_token_refresh_keeps_owner(self):
        cache, lock = OrderedDict(), threading.Lock()
        with patch("gradio.history.HfApi"):
            v1 = bucket_for_token(
                cache,
                lock,
                "tok-v1",
                "alice/hist",
                owner_id="alice",
                app_key="app",
            )
            v2 = bucket_for_token(
                cache,
                lock,
                "tok-v2",
                "alice/hist",
                owner_id="alice",
                app_key="app",
            )
        assert v1 is not v2
        assert v1.owner_id == v2.owner_id == "alice"

    def test_two_users_same_org_bucket_distinct_stores(self):
        cache, lock = OrderedDict(), threading.Lock()
        with patch("gradio.history.HfApi"):
            a = bucket_for_token(
                cache,
                lock,
                "tok-a",
                "org/team-hist",
                owner_id="alice",
                app_key="app",
            )
            b = bucket_for_token(
                cache,
                lock,
                "tok-b",
                "org/team-hist",
                owner_id="bob",
                app_key="app",
            )
        assert a is not b
        assert a._token == "tok-a"
        assert b._token == "tok-b"


class TestParallelSaves:
    def test_parallel_saves_never_cross_attribute(self):
        cache, lock = OrderedDict(), threading.Lock()

        def _mk_store(token, owner):
            with patch("gradio.history.HfApi"):
                store = bucket_for_token(
                    cache,
                    lock,
                    token,
                    f"{owner}/hist",
                    owner_id=owner,
                    app_key="app",
                )
            store._ensured = True
            return store

        alice = _mk_store("tok-a", "alice")
        bob = _mk_store("tok-b", "bob")

        alice_calls: list = []
        bob_calls: list = []
        alice._api.batch_bucket_files = MagicMock(
            side_effect=lambda **k: alice_calls.append((alice._token, k))
        )
        bob._api.batch_bucket_files = MagicMock(
            side_effect=lambda **k: bob_calls.append((bob._token, k))
        )

        def _save(store, i):
            store.save_record(
                _record(f"r{i}", owner_id=store.owner_id), local_assets=None
            )

        with ThreadPoolExecutor(max_workers=8) as ex:
            for f in [
                ex.submit(_save, alice if i % 2 == 0 else bob, i) for i in range(20)
            ]:
                f.result()

        assert all(t == "tok-a" for (t, _) in alice_calls)
        assert all(t == "tok-b" for (t, _) in bob_calls)
        assert len(alice_calls) == 10
        assert len(bob_calls) == 10
        for _, kwargs in alice_calls:
            data, _p = kwargs["add"][0]
            assert json.loads(data.decode())["owner_id"] == "alice"
        for _, kwargs in bob_calls:
            data, _p = kwargs["add"][0]
            assert json.loads(data.decode())["owner_id"] == "bob"


@pytest.fixture
def history_client():
    io = gr.Interface(lambda x: x, "text", "text")
    app, _, _ = io.launch(prevent_thread_lock=True)
    yield TestClient(app)
    io.close()
    close_all()


class TestRunHistoryRoutes:
    def test_connect_without_session_returns_401(self, history_client):
        r = history_client.post(
            "/gradio_api/run-history/connect", json={"bucket_id": "user/name"}
        )
        assert r.status_code == 401

    def test_records_without_session_returns_401(self, history_client):
        r = history_client.get("/gradio_api/run-history/records")
        assert r.status_code == 401

    def test_push_without_session_returns_401(self, history_client):
        r = history_client.post(
            "/gradio_api/run-history/records", json={"record_id": "abc"}
        )
        assert r.status_code == 401

    def test_delete_without_session_returns_401(self, history_client):
        r = history_client.delete("/gradio_api/run-history/records/abc")
        assert r.status_code == 401

    def test_clear_without_session_returns_401(self, history_client):
        r = history_client.delete("/gradio_api/run-history/records")
        assert r.status_code == 401

    def test_asset_without_session_returns_401(self, history_client):
        r = history_client.get("/gradio_api/run-history/records/r1/assets/a1")
        assert r.status_code == 401

    def test_buckets_without_session_returns_401(self, history_client):
        r = history_client.get("/gradio_api/run-history/buckets")
        assert r.status_code == 401


class _RecordingStore:
    """Stands in for BucketRunHistoryStore in route tests."""

    owner_id = "alice"
    app_key = "app-hash"

    def __init__(self):
        self.saved: list[tuple] = []

    def save_record(self, record, local_assets=None):
        self.saved.append((record, local_assets))

    def list_records(self, limit=50):
        return []

    def get_record(self, record_id):
        return HistoryRecord(
            record_id=record_id,
            owner_id=self.owner_id,
            app_key=self.app_key,
            created_at="2026-01-01T00:00:00Z",
            inputs={},
            outputs={},
        )

    def delete_record(self, record_id):
        pass

    def clear_records(self):
        pass


@pytest.fixture
def authed_history():
    from gradio import history_routes, oauth
    from gradio.routes import App

    with gr.Blocks() as demo:
        gr.Textbox()
    app = App.create_app(demo)
    store = _RecordingStore()
    app.dependency_overrides[oauth.require_oauth_token] = lambda: "tok"
    app.dependency_overrides[history_routes.get_store] = lambda: store
    yield TestClient(app), store
    app.dependency_overrides.clear()
    close_all()


class TestRunHistoryValidation:
    def test_limit_out_of_range_is_422(self, authed_history):
        client, _ = authed_history
        assert (
            client.get("/gradio_api/run-history/records?limit=999").status_code == 422
        )
        assert client.get("/gradio_api/run-history/records?limit=0").status_code == 422

    def test_bad_record_id_in_path_is_422(self, authed_history):
        client, _ = authed_history
        assert client.get("/gradio_api/run-history/records/bad id").status_code == 422
        assert client.get("/gradio_api/run-history/records/bad$id").status_code == 422
        long_id = "a" * 65
        assert (
            client.delete(f"/gradio_api/run-history/records/{long_id}").status_code
            == 422
        )

    def test_bad_record_id_in_body_is_422(self, authed_history):
        client, _ = authed_history
        r = client.post("/gradio_api/run-history/records", json={"record_id": "a b"})
        assert r.status_code == 422

    def test_oversized_body_is_413(self, authed_history):
        client, _ = authed_history
        r = client.post(
            "/gradio_api/run-history/records",
            json={"record_id": "r1", "outputs": {"n1": "x" * (2 * 1024 * 1024 + 10)}},
        )
        assert r.status_code == 413


class TestRunHistoryPushExternalizesAssets:
    def test_push_uploads_local_media_and_stores_markers(
        self, authed_history, tmp_path, monkeypatch
    ):
        monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
        img = tmp_path / "out.png"
        img.write_bytes(b"\x89PNG")
        client, store = authed_history

        r = client.post(
            "/gradio_api/run-history/records",
            json={
                "record_id": "r1",
                "inputs": {},
                "outputs": {
                    "n1": {
                        # the executor emits absolute file URLs, not bare paths
                        "value": {
                            "url": f"http://127.0.0.1:7860/gradio_api/file={img}",
                            "mime": "image/png",
                        },
                        "type": "image",
                    }
                },
            },
        )
        assert r.status_code == 200
        record, local_assets = store.saved[0]
        assert local_assets and list(local_assets.values())[0][0] == str(img)
        asset_id = next(iter(local_assets))
        assert record.outputs["n1"]["value"] == {"__asset__": asset_id}

    def test_push_leaves_untrusted_paths_alone(
        self, authed_history, tmp_path, monkeypatch
    ):
        monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path / "cache"))
        (tmp_path / "cache").mkdir()
        outside = tmp_path / "secret.png"
        outside.write_bytes(b"leak")
        client, store = authed_history

        r = client.post(
            "/gradio_api/run-history/records",
            json={
                "record_id": "r2",
                "outputs": {"n1": {"value": {"path": str(outside)}, "type": "image"}},
            },
        )
        assert r.status_code == 200
        record, local_assets = store.saved[0]
        assert local_assets == {}
        assert record.outputs["n1"]["value"] == {"path": str(outside)}

    def test_input_and_output_asset_ids_do_not_collide(
        self, authed_history, tmp_path, monkeypatch
    ):
        monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
        a = tmp_path / "in.png"
        a.write_bytes(b"\x89PNG")
        b = tmp_path / "out.png"
        b.write_bytes(b"\x89PNG")
        client, store = authed_history

        r = client.post(
            "/gradio_api/run-history/records",
            json={
                "record_id": "r3",
                "inputs": {"n0": {"value": {"path": str(a)}, "type": "image"}},
                "outputs": {"n1": {"value": {"path": str(b)}, "type": "image"}},
            },
        )
        assert r.status_code == 200
        record, local_assets = store.saved[0]
        assert len(local_assets) == 2
        assert (
            record.inputs["n0"]["value"]["__asset__"]
            != record.outputs["n1"]["value"]["__asset__"]
        )


def test_extract_local_file_path_handles_absolute_file_urls(tmp_path, monkeypatch):
    monkeypatch.setenv("GRADIO_TEMP_DIR", str(tmp_path))
    img = tmp_path / "a b.png"
    img.write_bytes(b"\x89PNG")
    quoted = str(img).replace(" ", "%20")
    assert extract_local_file_path(
        {"url": f"https://host.hf.space/gradio_api/file={quoted}"}
    ) == str(img)
    assert extract_local_file_path({"url": f"/gradio_api/file={img}"}) == str(img)
    assert extract_local_file_path({"path": str(img)}) == str(img)
    assert extract_local_file_path({"url": "https://host/not-a-file.png"}) is None


def test_fetch_all_records_sorts_by_mtime_not_path():
    """`BucketFile` has no `last_modified`; sorting on it silently fell back to
    the random record id, so the 200-file scan cap picked an arbitrary subset."""
    from datetime import datetime, timezone

    store, mock_api = _make_store()
    old = MagicMock(
        type="file",
        path="records/zzz.json",
        mtime=datetime(2020, 1, 1, tzinfo=timezone.utc),
    )
    new = MagicMock(
        type="file",
        path="records/aaa.json",
        mtime=datetime(2026, 1, 1, tzinfo=timezone.utc),
    )
    mock_api.list_bucket_tree.return_value = iter([old, new])
    seen: list[str] = []
    mock_api.download_bucket_files.side_effect = lambda **kw: seen.extend(
        remote for remote, _ in kw["files"]
    )
    store._fetch_all_records()
    assert seen == ["records/aaa.json", "records/zzz.json"]


def test_sort_key_tolerates_naive_and_missing_timestamps():
    from datetime import datetime

    store, _ = _make_store()
    items = [
        MagicMock(type="file", path="a", mtime=datetime(2026, 1, 1)),  # naive
        MagicMock(type="file", path="b", mtime=None, uploaded_at=None),
        MagicMock(type="file", path="c", mtime=datetime(2025, 1, 1)),
    ]
    # must not raise "can't compare offset-naive and offset-aware datetimes"
    ordered = sorted(items, key=store._sort_key, reverse=True)
    assert [i.path for i in ordered] == ["a", "c", "b"]


class TestAssetServing:
    def _client_with_asset(self, data: bytes, path: str):
        from gradio import history_routes, oauth
        from gradio.routes import App

        class _S:
            owner_id = "alice"
            app_key = "app"

            def get_asset_bytes(self, record_id, asset_id):
                import mimetypes

                return data, mimetypes.guess_type(path)[0] or "application/octet-stream"

        with gr.Blocks() as demo:
            gr.Textbox()
        app = App.create_app(demo)
        app.dependency_overrides[oauth.require_oauth_token] = lambda: "tok"
        app.dependency_overrides[history_routes.get_store] = lambda: _S()
        return TestClient(app)

    def test_html_asset_is_not_served_inline(self):
        client = self._client_with_asset(b"<script>alert(1)</script>", "x.html")
        r = client.get("/gradio_api/run-history/records/r1/assets/a001")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("application/octet-stream")
        assert r.headers["content-disposition"] == "attachment"

    def test_png_asset_is_inline_and_cacheable(self):
        client = self._client_with_asset(b"\x89PNG", "x.png")
        r = client.get("/gradio_api/run-history/records/r1/assets/a001")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("image/png")
        assert r.headers["content-disposition"] == "inline"
        assert "immutable" in r.headers["cache-control"]


def test_run_history_false_disables_bucket_routes():
    from gradio.routes import App

    with gr.Blocks() as demo:
        gr.Textbox()
    demo.run_history = False
    client = TestClient(App.create_app(demo))
    # 404, not 401: the routes must not exist at all
    assert client.get("/gradio_api/run-history/records").status_code == 404
    assert client.post("/gradio_api/run-history/connect", json={}).status_code == 404


def test_chunked_body_over_limit_is_rejected_without_buffering():
    """A chunked request carries no Content-Length, so the header check does not
    fire and the cap has to come from streaming."""
    from gradio import history_routes, oauth
    from gradio.routes import App

    with gr.Blocks() as demo:
        gr.Textbox()
    app = App.create_app(demo)
    app.dependency_overrides[oauth.require_oauth_token] = lambda: "tok"
    app.dependency_overrides[history_routes.get_store] = lambda: _RecordingStore()
    client = TestClient(app)

    def _chunks():
        for _ in range(40):
            yield b"x" * 100_000

    r = client.post("/gradio_api/run-history/records", content=_chunks())
    assert r.status_code == 413
