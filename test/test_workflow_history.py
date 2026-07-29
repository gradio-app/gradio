"""Unit tests for gradio.workflow_history.WorkflowHistory and build_history_record."""

from __future__ import annotations

import json
import threading
from unittest.mock import MagicMock, patch

from gradio.workflow_history import WorkflowHistory, build_history_record

# ─── build_history_record ─────────────────────────────────────────────────────


class FakeGraph:
    def __init__(self, nodes: dict):
        self.node_by_id = nodes


def test_build_history_record_text_inputs():
    graph = FakeGraph(
        {
            "subj_0": {
                "id": "subj_0",
                "label": "Result",
                "inputs": [{"id": "in_0", "type": "text"}],
            }
        }
    )
    free_items = [
        {
            "node": {"id": "ref_0", "label": "Prompt"},
            "port": {"id": "out_0", "type": "text"},
            "type": "text",
            "label": "Prompt",
        }
    ]
    record = build_history_record(
        gen_id="abc123",
        subgraph="generate",
        graph=graph,
        free_items=free_items,
        input_values=["hello world"],
        subject_ids=["subj_0"],
        results=["world hello"],
        user="alice",
    )
    assert record["id"] == "abc123"
    assert record["subgraph"] == "generate"
    assert record["user"] == "alice"
    assert record["inputs"]["ref_0"]["value"] == "hello world"
    assert record["inputs"]["ref_0"]["port_id"] == "out_0"
    assert record["inputs"]["ref_0"]["type"] == "text"
    assert record["outputs"]["subj_0"]["value"] == "world hello"
    assert record["outputs"]["subj_0"]["type"] == "text"
    assert "timestamp" in record


def test_build_history_record_non_serializable_value():
    graph = FakeGraph({"subj_0": {"id": "subj_0", "label": "Out", "inputs": []}})
    free_items = [
        {
            "node": {"id": "ref_0", "label": "Input"},
            "port": {"id": "out_0", "type": "text"},
            "type": "text",
            "label": "Input",
        }
    ]
    record = build_history_record(
        gen_id="x",
        subgraph="sg",
        graph=graph,
        free_items=free_items,
        input_values=[object()],
        subject_ids=["subj_0"],
        results=[None],
        user=None,
    )
    assert isinstance(record["inputs"]["ref_0"]["value"], str)
    assert record["outputs"]["subj_0"]["value"] is None
    assert record["user"] is None


def test_build_history_record_missing_port_uses_default():
    graph = FakeGraph({"subj_0": {"id": "subj_0", "label": "Out", "inputs": []}})
    free_items = [
        {
            "node": {"id": "ref_0", "label": "Input"},
            "port": None,
            "type": "text",
            "label": "Input",
        }
    ]
    record = build_history_record(
        gen_id="x",
        subgraph="sg",
        graph=graph,
        free_items=free_items,
        input_values=["val"],
        subject_ids=["subj_0"],
        results=["out"],
        user=None,
    )
    assert record["inputs"]["ref_0"]["port_id"] == "out_0"


# ─── WorkflowHistory ──────────────────────────────────────────────────────────


def _make_history(repo_id="user/test-history"):
    mock_api = MagicMock()
    wh = WorkflowHistory.__new__(WorkflowHistory)
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

    # Record stored in bucket should have the Hub URL, not the local path
    record_call = mock_api.batch_bucket_files.call_args_list[1]
    record_bytes = record_call.kwargs["add"][0][0]
    saved = json.loads(record_bytes.decode())
    assert "huggingface.co" in saved["outputs"]["subj_img"]["value"]


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


def test_push_graph_file():
    wh, mock_api = _make_history()
    wh.push_graph_file('{"schema_version": "2"}')
    mock_api.batch_bucket_files.assert_called_once()
    call_kwargs = mock_api.batch_bucket_files.call_args.kwargs
    assert call_kwargs["bucket_id"] == "user/test-history"
    data_bytes, path = call_kwargs["add"][0]
    assert path == "workflow.json"
    assert b"schema_version" in data_bytes


def test_ensure_repo_creates_bucket():
    with (
        patch("gradio.workflow_history.HfApi") as mock_api_cls,
        patch("gradio.workflow_history.hf_get_token", return_value="tok"),
    ):
        mock_api = mock_api_cls.return_value
        wh = WorkflowHistory("user/new-bucket", token="tok")
        wh._api = mock_api
        wh.ensure_repo()
        mock_api.create_bucket.assert_called_once_with(
            "user/new-bucket",
            private=True,
            exist_ok=True,
        )
        assert wh._repo_ready is True


def test_history_true_auto_names_repo():
    """history=True should derive the bucket ID from the HF username and workflow name."""
    import warnings

    with (
        patch("gradio.workflow.HfApi") as mock_hf_api_cls,
        patch("gradio.workflow.hf_get_token", return_value="tok"),
        warnings.catch_warnings(),
    ):
        warnings.simplefilter("ignore")
        mock_api_inst = mock_hf_api_cls.return_value
        mock_api_inst.whoami.return_value = {"name": "testuser"}

        from gradio.workflow import Workflow

        wf = Workflow.__new__(Workflow)
        wf._workflow_name = "My Workflow"
        wf._history_param = True
        result = wf._resolve_history()

    assert result is not None
    assert result.repo_id == "testuser/my-workflow-history"


def test_history_string_uses_explicit_repo():
    import warnings

    with (
        patch("gradio.workflow.hf_get_token", return_value="tok"),
        warnings.catch_warnings(),
    ):
        warnings.simplefilter("ignore")
        from gradio.workflow import Workflow

        wf = Workflow.__new__(Workflow)
        wf._workflow_name = "Workflow"
        wf._history_param = "acme/custom-history"
        result = wf._resolve_history()

    assert result is not None
    assert result.repo_id == "acme/custom-history"


def test_history_none_returns_none():
    import warnings

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        from gradio.workflow import Workflow

        wf = Workflow.__new__(Workflow)
        wf._history_param = None
        result = wf._resolve_history()

    assert result is None
