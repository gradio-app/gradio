"""WorkflowHistory — persists gr.Workflow generation records to a HF Hub dataset."""

from __future__ import annotations

import json
import logging
import os
import pathlib
import secrets
import tempfile
import threading
import time
from datetime import datetime, timezone
from typing import Any

from huggingface_hub import HfApi, hf_hub_download
from huggingface_hub import get_token as hf_get_token

logger = logging.getLogger(__name__)

MEDIA_PORT_TYPES = {"image", "audio", "video"}

# Cache TTL for list() so rapid panel refreshes don't hammer Hub.
_LIST_CACHE_TTL = 10.0

# Max records to read from Hub when listing.
_MAX_FILES_SCAN = 50


class WorkflowHistory:
    """Persists workflow generation records to a private HF Hub dataset repo.

    Each Gradio process maintains one growing JSONL file on Hub under
    ``data/{proc_id}.jsonl`` so concurrent processes don't conflict.  Media
    outputs (images, audio, video) are uploaded to ``media/`` and the local
    path is replaced with a stable Hub URL before the record is stored.

    Args:
        repo_id: HF Hub dataset repo identifier, e.g. ``"user/my-history"``.
        token: HF access token.  Falls back to the cached CLI token.
    """

    def __init__(self, repo_id: str, token: str | None = None) -> None:
        self.repo_id = repo_id
        self._token = token or hf_get_token()
        self._api = HfApi(token=self._token)

        # Unique per-process ID so multiple Gradio instances write separate files
        # without conflicts.
        self._proc_id = secrets.token_hex(6)
        self._data_path = f"data/{self._proc_id}.jsonl"

        # Local buffer file (appended in-process, then re-uploaded to Hub).
        self._local_file = os.path.join(
            tempfile.gettempdir(),
            f"wf_hist_{repo_id.replace('/', '_')}_{self._proc_id}.jsonl",
        )

        self._write_lock = threading.Lock()
        self._repo_ready = False
        self._repo_lock = threading.Lock()

        # list() cache
        self._cache: list[dict] | None = None
        self._cache_at: float = 0.0

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def push(self, record: dict) -> None:
        """Persist *record* to Hub in a background thread (non-blocking)."""
        threading.Thread(target=self._push_sync, args=(record,), daemon=True).start()

    def list(
        self, limit: int = 50, subgraph: str | None = None
    ) -> list[dict]:
        """Return recent generation records, newest first.

        Results are cached for ``_LIST_CACHE_TTL`` seconds to avoid
        hammering the Hub on rapid panel refreshes.
        """
        now = time.monotonic()
        if self._cache is not None and (now - self._cache_at) < _LIST_CACHE_TTL:
            records = self._cache
        else:
            records = self._fetch_records()
            self._cache = records
            self._cache_at = now

        if subgraph:
            records = [r for r in records if r.get("subgraph") == subgraph]
        return records[:limit]

    def push_graph_file(self, workflow_json: str) -> None:
        """Upload the current ``workflow.json`` to the dataset repo for versioning."""
        try:
            self.ensure_repo()
            if not self._repo_ready:
                return
            self._api.upload_file(
                path_or_fileobj=workflow_json.encode("utf-8"),
                path_in_repo="workflow.json",
                repo_id=self.repo_id,
                repo_type="dataset",
                commit_message="Update workflow definition",
            )
        except Exception:
            logger.debug("WorkflowHistory: graph file upload failed", exc_info=True)

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def ensure_repo(self) -> None:
        with self._repo_lock:
            if self._repo_ready:
                return
            try:
                self._api.create_repo(
                    self.repo_id,
                    repo_type="dataset",
                    private=True,
                    exist_ok=True,
                )
                self._repo_ready = True
            except Exception:
                logger.warning(
                    "WorkflowHistory: could not create dataset repo %s",
                    self.repo_id,
                    exc_info=True,
                )

    def _push_sync(self, record: dict) -> None:
        """Called in a daemon thread — uploads media, appends JSONL, uploads file."""
        try:
            self.ensure_repo()
            if not self._repo_ready:
                return

            # Upload media outputs → replace local paths with stable Hub URLs.
            for sid, output in list(record.get("outputs", {}).items()):
                value = output.get("value")
                port_type = output.get("type", "text")
                if port_type in MEDIA_PORT_TYPES and isinstance(value, str):
                    hub_url = self._upload_media(record["id"], sid, value, port_type)
                    if hub_url:
                        record["outputs"][sid]["value"] = hub_url
                    elif os.path.isfile(value):
                        # Upload was attempted but failed — don't store a dead local path.
                        record["outputs"][sid]["value"] = None

            # Append to local buffer and re-upload to Hub.
            with self._write_lock:
                with open(self._local_file, "a", encoding="utf-8") as f:
                    f.write(json.dumps(record, ensure_ascii=False) + "\n")
                self._api.upload_file(
                    path_or_fileobj=self._local_file,
                    path_in_repo=self._data_path,
                    repo_id=self.repo_id,
                    repo_type="dataset",
                    commit_message="Add generation",
                )
                # Invalidate inside the lock so no concurrent list() refills the
                # cache with stale data after the upload but before this clear.
                self._cache = None
        except Exception:
            logger.debug("WorkflowHistory: push failed", exc_info=True)

    def _upload_media(
        self, gen_id: str, sid: str, value: str, port_type: str
    ) -> str | None:
        """Upload a local media file to the dataset repo's ``media/`` dir."""
        if not os.path.isfile(value):
            # Already a URL or non-existent — keep as-is.
            return None
        ext = pathlib.Path(value).suffix or {
            "image": ".png",
            "audio": ".mp3",
            "video": ".mp4",
        }.get(port_type, ".bin")
        path_in_repo = f"media/{gen_id}_{sid}{ext}"
        try:
            self._api.upload_file(
                path_or_fileobj=value,
                path_in_repo=path_in_repo,
                repo_id=self.repo_id,
                repo_type="dataset",
                commit_message="Add generation media",
            )
            return (
                f"https://huggingface.co/datasets/{self.repo_id}"
                f"/resolve/main/{path_in_repo}"
            )
        except Exception:
            logger.debug("WorkflowHistory: media upload failed", exc_info=True)
            return None

    def _fetch_records(self) -> list[dict]:
        """Download JSONL files from Hub, merge, and sort newest-first."""
        try:
            all_paths = sorted(
                (
                    f.rfilename
                    for f in self._api.list_repo_tree(
                        self.repo_id,
                        repo_type="dataset",
                        path_in_repo="data",
                        recursive=False,
                    )
                    if f.rfilename.endswith(".jsonl")
                ),
                reverse=True,
            )[:_MAX_FILES_SCAN]

            records: list[dict] = []
            for path in all_paths:
                try:
                    local = hf_hub_download(
                        self.repo_id,
                        path,
                        repo_type="dataset",
                        token=self._token,
                    )
                    with open(local, encoding="utf-8") as fh:
                        for line in fh:
                            line = line.strip()
                            if line:
                                records.append(json.loads(line))
                except Exception:
                    continue

            records.sort(key=lambda r: r.get("timestamp", ""), reverse=True)
            return records
        except Exception:
            logger.debug("WorkflowHistory: fetch failed", exc_info=True)
            return []


def build_history_record(
    gen_id: str,
    subgraph: str,
    graph: Any,
    free_items: list[dict],
    input_values: list[Any],
    subject_ids: list[str],
    results: list[Any],
    user: str | None,
) -> dict:
    """Build a history record dict from a completed subgraph execution.

    Args:
        gen_id: UUID string for this generation.
        subgraph: API name of the subgraph endpoint.
        graph: ``WorkflowGraph`` instance (for node metadata).
        free_items: List of free-input dicts from ``group_free_inputs()``.
        input_values: Positional input values passed to the executor.
        subject_ids: Subject node IDs in the same order as *results*.
        results: Output values from ``WorkflowExecutor.run_many()``.
        user: HF username (or None for anonymous).
    """
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    inputs: dict[str, dict] = {}
    for item, value in zip(free_items, input_values):
        node = item["node"]
        node_id = node["id"]
        port_type = item.get("type", "text")
        label = item.get("label") or node.get("label", node_id)
        port = item.get("port") or {}
        port_id = port.get("id", "out_0")
        # Serialise the value as a JSON-safe primitive.
        safe_value: Any
        if isinstance(value, (str, int, float, bool)) or value is None:
            safe_value = value
        else:
            safe_value = str(value)
        inputs[node_id] = {
            "value": safe_value,
            "type": port_type,
            "label": label,
            "port_id": port_id,
        }

    outputs: dict[str, dict] = {}
    for sid, result in zip(subject_ids, results):
        node = graph.node_by_id.get(sid, {})
        in_ports = node.get("inputs") or []
        port_type = (in_ports[0].get("type") if in_ports else None) or node.get(
            "asset_type", "text"
        )
        label = node.get("label", sid)
        safe_result: Any
        if isinstance(result, (str, int, float, bool)) or result is None:
            safe_result = result
        else:
            safe_result = str(result)
        outputs[sid] = {"value": safe_result, "type": port_type, "label": label}

    return {
        "id": gen_id,
        "timestamp": ts,
        "subgraph": subgraph,
        "subject_ids": subject_ids,
        "inputs": inputs,
        "outputs": outputs,
        "user": user,
    }
