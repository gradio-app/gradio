"""WorkflowHistory — persists gr.Workflow generation records to a HF Hub bucket."""

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

from huggingface_hub import HfApi
from huggingface_hub import get_token as hf_get_token

logger = logging.getLogger(__name__)

MEDIA_PORT_TYPES = {"image", "audio", "video"}

_LIST_CACHE_TTL = 10.0

_MAX_FILES_SCAN = 200


class WorkflowHistory:
    """Persists workflow generation records to a HF Hub bucket.

    Each generation is stored as an individual JSON file
    (``data/<timestamp>_<gen_id>.json``).  Media outputs (images, audio,
    video) are uploaded to ``media/`` and their local paths are replaced
    with stable Hub URLs before the record is stored.

    Args:
        repo_id: HF Hub bucket identifier, e.g. ``"user/my-history"``.
        token: HF access token.  Falls back to the cached CLI token.
    """

    def __init__(self, repo_id: str, token: str | None = None) -> None:
        self.repo_id = repo_id
        self._token = token or hf_get_token()
        self._api = HfApi(token=self._token)
        self._repo_ready = False
        self._repo_lock = threading.Lock()
        self._cache: list[dict] | None = None
        self._cache_at: float = 0.0

    def push(self, record: dict) -> None:
        """Persist *record* to Hub in a background thread (non-blocking)."""
        threading.Thread(target=self._push_sync, args=(record,), daemon=True).start()

    def list(self, limit: int = 50, subgraph: str | None = None) -> list[dict]:
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
        """Upload the current ``workflow.json`` to the bucket for versioning."""
        try:
            self.ensure_repo()
            if not self._repo_ready:
                return
            self._api.batch_bucket_files(
                bucket_id=self.repo_id,
                add=[(workflow_json.encode("utf-8"), "workflow.json")],
            )
        except Exception:
            logger.debug("WorkflowHistory: graph file upload failed", exc_info=True)

    def ensure_repo(self) -> None:
        with self._repo_lock:
            if self._repo_ready:
                return
            try:
                self._api.create_bucket(self.repo_id, private=True, exist_ok=True)
                self._repo_ready = True
            except Exception:
                logger.warning(
                    "WorkflowHistory: could not create bucket %s",
                    self.repo_id,
                    exc_info=True,
                )

    def _push_sync(self, record: dict) -> None:
        """Called in a daemon thread — uploads media then writes the record."""
        try:
            self.ensure_repo()
            if not self._repo_ready:
                return

            for sid, output in list(record.get("outputs", {}).items()):
                value = output.get("value")
                port_type = output.get("type", "text")
                if port_type in MEDIA_PORT_TYPES and isinstance(value, str):
                    hub_url = self._upload_media(record["id"], sid, value, port_type)
                    if hub_url:
                        record["outputs"][sid]["value"] = hub_url
                    elif os.path.isfile(value):
                        record["outputs"][sid]["value"] = None

            ts = record.get("timestamp") or datetime.now(timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )
            safe_ts = ts.replace(":", "-")
            path_in_repo = f"data/{safe_ts}_{record.get('id', secrets.token_hex(8))}.json"
            data = json.dumps(record, ensure_ascii=False).encode("utf-8")
            self._api.batch_bucket_files(
                bucket_id=self.repo_id,
                add=[(data, path_in_repo)],
            )
            self._cache = None

        except Exception:
            logger.debug("WorkflowHistory: push failed", exc_info=True)

    def _upload_media(
        self, gen_id: str, sid: str, value: str, port_type: str
    ) -> str | None:
        """Upload a local media file to the bucket's ``media/`` dir."""
        if not os.path.isfile(value):
            return None
        ext = pathlib.Path(value).suffix or {
            "image": ".png",
            "audio": ".mp3",
            "video": ".mp4",
        }.get(port_type, ".bin")
        path_in_repo = f"media/{gen_id}_{sid}{ext}"
        try:
            with open(value, "rb") as fh:
                self._api.batch_bucket_files(
                    bucket_id=self.repo_id,
                    add=[(fh.read(), path_in_repo)],
                )
            return f"https://huggingface.co/buckets/{self.repo_id}/{path_in_repo}"
        except Exception:
            logger.debug("WorkflowHistory: media upload failed", exc_info=True)
            return None

    def _fetch_records(self) -> list[dict]:
        """Download record files from the bucket and sort newest-first."""
        try:
            all_items = sorted(
                (
                    item
                    for item in self._api.list_bucket_tree(self.repo_id, prefix="data/")
                    if getattr(item, "path", "").endswith(".json")
                    and not hasattr(item, "count")
                ),
                key=lambda f: f.path,
                reverse=True,
            )[:_MAX_FILES_SCAN]

            if not all_items:
                return []

            records: list[dict] = []
            with tempfile.TemporaryDirectory() as tmpdir:
                downloads = [
                    (item, os.path.join(tmpdir, f"{i}.json"))
                    for i, item in enumerate(all_items)
                ]
                try:
                    self._api.download_bucket_files(
                        bucket_id=self.repo_id,
                        files=[(item, local) for item, local in downloads],
                        token=self._token,
                    )
                except Exception:
                    logger.debug(
                        "WorkflowHistory: bucket download failed", exc_info=True
                    )
                    return []

                for _, local in downloads:
                    try:
                        with open(local, encoding="utf-8") as fh:
                            records.append(json.load(fh))
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
