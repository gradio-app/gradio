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
    mock_api.list_bucket_tree.return_value = iter(
        [MagicMock(path=f"assets/r1/a{i:03d}.png") for i in range(3)]
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

    def _tree(repo, prefix):
        if prefix == "records/":
            return iter([MagicMock(path="records/r1.json")])
        return iter([MagicMock(path="assets/r1/a001.png")])

    mock_api.list_bucket_tree.side_effect = _tree
    store.clear_records()
    deleted = set(mock_api.batch_bucket_files.call_args.kwargs["delete"])
    assert deleted == {"records/r1.json", "assets/r1/a001.png"}


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
