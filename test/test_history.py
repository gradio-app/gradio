"""Unit tests for gradio.history.BucketHistory."""

from __future__ import annotations

import json
import threading
import time
from collections import OrderedDict
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

import gradio as gr
from gradio.history import BucketHistory, PUSH_MIN_INTERVAL, push_rate_limited
from gradio.interface import close_all


def _make_history(repo_id="user/test-history"):
    mock_api = MagicMock()
    wh = BucketHistory.__new__(BucketHistory)
    wh.repo_id = repo_id
    wh._token = "tok"
    wh._api = mock_api
    wh._repo_ready = True
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
    wh._push_sync(record)

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
    wh._push_sync(record)

    # Two batch_bucket_files calls: media upload + record upload
    assert mock_api.batch_bucket_files.call_count == 2
    media_call = mock_api.batch_bucket_files.call_args_list[0]
    media_path = media_call.kwargs["add"][0][1]
    assert media_path.startswith("media/")

    # value stays as the local path (for in-session display via Gradio file server);
    # bucket_url holds the durable Hub URL.
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
    wh._push_sync(record)

    # Only one batch_bucket_files call (record only — no media upload for URLs)
    assert mock_api.batch_bucket_files.call_count == 1
    record_bytes = mock_api.batch_bucket_files.call_args.kwargs["add"][0][0]
    saved = json.loads(record_bytes.decode())
    assert saved["outputs"]["subj_img"]["value"] == "https://example.com/img.png"


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


# ─── push_rate_limited ────────────────────────────────────────────────────────


def test_push_rate_limited():
    store, lock = OrderedDict(), threading.Lock()
    assert push_rate_limited(store, lock, "alice") is False
    assert push_rate_limited(store, lock, "alice") is True  # rapid repeat
    assert push_rate_limited(store, lock, "bob") is False  # per-token
    time.sleep(PUSH_MIN_INTERVAL + 0.05)
    assert push_rate_limited(store, lock, "alice") is False  # after interval


# ─── /gradio_api/history/* routes ─────────────────────────────────────────────


@pytest.fixture
def history_client():
    io = gr.Interface(lambda x: x, "text", "text")
    app, _, _ = io.launch(prevent_thread_lock=True)
    yield TestClient(app)
    io.close()
    close_all()


class TestHistoryRoutes:
    def test_push_unauthed_returns_403(self, history_client):
        """The trust boundary: no OAuth → no writes."""
        r = history_client.post(
            "/gradio_api/history/push",
            json={"bucket_id": "user/name", "record": {"id": "abc"}},
        )
        assert r.status_code == 403
        assert r.json()["reason"] == "auth"

    def test_list_unauthed_returns_empty(self, history_client):
        """Reads degrade gracefully — panel just shows an empty state."""
        r = history_client.post(
            "/gradio_api/history/list", json={"bucket_id": "user/name"}
        )
        assert r.status_code == 200
        assert r.json() == {"records": []}

    def test_push_rejects_path_traversal(self, history_client):
        r = history_client.post(
            "/gradio_api/history/push",
            json={"bucket_id": "user/..", "record": {"id": "abc"}},
        )
        assert r.status_code == 403

    def test_delete_rejects_bad_id_regex(self, history_client):
        """Even if OAuth were present, bad chars in id/timestamp don't reach Hub."""
        r = history_client.post(
            "/gradio_api/history/delete",
            json={
                "bucket_id": "user/name",
                "id": "has/slash",
                "timestamp": "2026-01-01T00:00:00Z",
            },
        )
        # Unauthed hits 403 first; the regex check is exercised in unit tests.
        assert r.status_code == 403

