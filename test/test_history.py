"""Unit tests for gradio.history.BucketHistory + /run-history routes."""

from __future__ import annotations

import json
import threading
from collections import OrderedDict
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio.history import BucketHistory, bucket_for_token, validate_bucket_id
from gradio.interface import close_all


def _make_history(repo_id="user/test-history"):
    mock_api = MagicMock()
    wh = BucketHistory.__new__(BucketHistory)
    wh.repo_id = repo_id
    wh._token = "tok"
    wh._api = mock_api
    wh._repo_ready = True
    wh._ensure_reason = None
    wh._repo_lock = threading.Lock()
    wh._cache_lock = threading.Lock()
    wh._cache = None
    wh._cache_at = 0.0
    return wh, mock_api


def test_push_uploads_record_to_bucket():
    wh, mock_api = _make_history()
    record = {
        "id": "gen1",
        "timestamp": "2026-06-30T12:00:00Z",
        "subgraph": "generate",
        "subject_ids": ["subj_0"],
        "inputs": {
            "ref_0": {
                "value": "cat",
                "type": "text",
                "label": "Prompt",
                "port_id": "out_0",
            }
        },
        "outputs": {
            "subj_0": {"value": "a cute cat", "type": "text", "label": "Result"}
        },
        "user": None,
    }
    ok, reason = wh.push_sync(record)
    assert ok is True
    assert reason is None

    mock_api.batch_bucket_files.assert_called_once()
    call_kwargs = mock_api.batch_bucket_files.call_args.kwargs
    assert call_kwargs["bucket_id"] == "user/test-history"
    data_bytes, path = call_kwargs["add"][0]
    assert path.startswith("data/")
    assert path.endswith(".json")
    saved = json.loads(data_bytes.decode())
    assert saved["id"] == "gen1"


def test_push_uploads_image_to_media(tmp_path):
    wh, mock_api = _make_history()
    img_path = str(tmp_path / "out.png")
    with open(img_path, "wb") as f:
        f.write(b"\x89PNG\r\n")

    record = {
        "id": "gen2",
        "timestamp": "2026-06-30T13:00:00Z",
        "subgraph": "img",
        "subject_ids": ["subj_img"],
        "inputs": {},
        "outputs": {"subj_img": {"value": img_path, "type": "image", "label": "Image"}},
        "user": None,
    }
    ok, _ = wh.push_sync(record)
    assert ok is True

    # Two batch_bucket_files calls: media upload + record upload
    assert mock_api.batch_bucket_files.call_count == 2
    media_call = mock_api.batch_bucket_files.call_args_list[0]
    media_path = media_call.kwargs["add"][0][1]
    assert media_path.startswith("media/")

    record_call = mock_api.batch_bucket_files.call_args_list[1]
    record_bytes = record_call.kwargs["add"][0][0]
    saved = json.loads(record_bytes.decode())
    assert saved["outputs"]["subj_img"]["value"] == img_path
    assert "huggingface.co" in saved["outputs"]["subj_img"]["bucket_url"]


def test_push_skips_media_upload_for_urls():
    wh, mock_api = _make_history()
    record = {
        "id": "gen3",
        "timestamp": "2026-06-30T14:00:00Z",
        "subgraph": "img",
        "subject_ids": ["subj_img"],
        "inputs": {},
        "outputs": {
            "subj_img": {
                "value": "https://example.com/img.png",
                "type": "image",
                "label": "Image",
            }
        },
        "user": None,
    }
    wh.push_sync(record)

    # Only one batch_bucket_files call (record only — no media upload for URLs)
    assert mock_api.batch_bucket_files.call_count == 1
    record_bytes = mock_api.batch_bucket_files.call_args.kwargs["add"][0][0]
    saved = json.loads(record_bytes.decode())
    assert saved["outputs"]["subj_img"]["value"] == "https://example.com/img.png"


def test_push_reports_hub_failure():
    wh, mock_api = _make_history()
    mock_api.batch_bucket_files.side_effect = RuntimeError("hub down")
    ok, reason = wh.push_sync({"id": "x", "outputs": {}})
    assert ok is False
    assert reason == "hub"


def test_list_returns_cached_results():
    wh, mock_api = _make_history()
    wh._cache = [{"id": "cached", "timestamp": "2026-06-30T00:00:00Z"}]
    wh._cache_at = float("inf")

    results = wh.list(limit=10)
    mock_api.list_bucket_tree.assert_not_called()
    assert results[0]["id"] == "cached"


def test_list_filters_by_subgraph():
    wh, _ = _make_history()
    wh._cache = [
        {"id": "a", "timestamp": "2026-06-30T01:00:00Z", "subgraph": "foo"},
        {"id": "b", "timestamp": "2026-06-30T02:00:00Z", "subgraph": "bar"},
        {"id": "c", "timestamp": "2026-06-30T03:00:00Z", "subgraph": "foo"},
    ]
    wh._cache_at = float("inf")

    filtered = wh.list(subgraph="foo")
    assert len(filtered) == 2
    assert all(r["subgraph"] == "foo" for r in filtered)


def test_list_respects_limit():
    wh, _ = _make_history()
    wh._cache = [
        {"id": str(i), "timestamp": f"2026-06-30T{i:02d}:00:00Z", "subgraph": "sg"}
        for i in range(20)
    ]
    wh._cache_at = float("inf")
    assert len(wh.list(limit=5)) == 5


def test_ensure_repo_creates_bucket():
    with (
        patch("gradio.history.HfApi") as mock_api_cls,
        patch("gradio.history.hf_get_token", return_value="tok"),
    ):
        mock_api = mock_api_cls.return_value
        wh = BucketHistory("user/new-bucket", token="tok")
        wh._api = mock_api
        wh.ensure_repo()
        mock_api.create_bucket.assert_called_once_with(
            "user/new-bucket",
            private=True,
            exist_ok=True,
        )
        assert wh._repo_ready is True


def test_validate_bucket_id_rejects_path_traversal():
    validate_bucket_id("user/name")  # ok
    with pytest.raises(ValueError):
        validate_bucket_id("user/..")
    with pytest.raises(ValueError):
        validate_bucket_id("../etc")
    with pytest.raises(ValueError):
        validate_bucket_id("user/./x")
    with pytest.raises(ValueError):
        validate_bucket_id("")
    with pytest.raises(ValueError):
        validate_bucket_id("noslash")


def test_bucket_for_token_caches_by_key():
    cache: OrderedDict = OrderedDict()
    lock = threading.Lock()
    with patch("gradio.history.HfApi"):
        wh1 = bucket_for_token(cache, lock, "tok", "user/a")
        wh2 = bucket_for_token(cache, lock, "tok", "user/a")
        wh3 = bucket_for_token(cache, lock, "tok", "user/b")
    assert wh1 is wh2  # same key → cached
    assert wh1 is not wh3  # different bucket → different instance
    assert len(cache) == 2


def test_bucket_for_token_evicts_lru():
    cache: OrderedDict = OrderedDict()
    lock = threading.Lock()
    with patch("gradio.history.HfApi"):
        first = bucket_for_token(cache, lock, "tok", "user/a", max_entries=2)
        bucket_for_token(cache, lock, "tok", "user/b", max_entries=2)
        bucket_for_token(cache, lock, "tok", "user/c", max_entries=2)
    # user/a was oldest and should have been evicted
    assert ("tok", "user/a") not in cache
    assert first not in cache.values()


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
            "/gradio_api/run-history/records", json={"record": {"id": "abc"}}
        )
        assert r.status_code == 401

    def test_delete_without_session_returns_401(self, history_client):
        r = history_client.delete(
            "/gradio_api/run-history/records/abc?timestamp=2026-01-01T00:00:00Z"
        )
        assert r.status_code == 401

    def test_buckets_without_session_returns_401(self, history_client):
        r = history_client.get("/gradio_api/run-history/buckets")
        assert r.status_code == 401
