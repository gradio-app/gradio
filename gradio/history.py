"""BucketHistory — core Gradio primitive for persisting per-app history to a HF Hub bucket.

Used by ``gr.Workflow`` for generation history, but usable by any Gradio app that
wants an append-only record store backed by a private HF Hub bucket.
"""

from __future__ import annotations

import builtins
import json
import logging
import os
import pathlib
import re
import secrets
import tempfile
import threading
import time
from collections import OrderedDict
from datetime import datetime, timezone

from huggingface_hub import HfApi
from huggingface_hub import get_token as hf_get_token

logger = logging.getLogger(__name__)

MEDIA_PORT_TYPES = {"image", "audio", "video"}

_LIST_CACHE_TTL = 10.0

_MAX_FILES_SCAN = 50

BUCKET_ID_RE = re.compile(r"^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$")


def validate_bucket_id(bucket_id: str) -> None:
    """Raise ``ValueError`` if *bucket_id* isn't a well-formed `user/name`."""
    if not BUCKET_ID_RE.fullmatch(bucket_id or ""):
        raise ValueError("invalid bucket id")
    if any(seg in {"", ".", ".."} for seg in bucket_id.split("/")):
        raise ValueError("invalid bucket id")


def bucket_for_token(
    cache: OrderedDict[tuple[str, str], BucketHistory],
    lock: threading.Lock,
    token: str,
    bucket_id: str,
    max_entries: int = 256,
) -> BucketHistory:
    """LRU-cached ``BucketHistory`` keyed by ``(token, bucket_id)``."""
    validate_bucket_id(bucket_id)
    key = (token, bucket_id)
    with lock:
        wh = cache.get(key)
        if wh is not None:
            cache.move_to_end(key)
            return wh
        wh = BucketHistory(bucket_id, token=token)
        cache[key] = wh
        if len(cache) > max_entries:
            cache.popitem(last=False)
        return wh


class BucketHistory:
    """Persists app records to a private HF Hub bucket.

    Each record is stored as an individual JSON file under
    ``data/<timestamp>_<id>.json``. Media outputs (images, audio, video)
    are uploaded to ``media/`` and a ``bucket_url`` is added to the record
    for durable reference; the original ``value`` (usually a Gradio-served
    URL) is preserved for in-session display.

    Args:
        repo_id: HF Hub bucket identifier, e.g. ``"user/my-history"``.
        token: HF access token. Falls back to the cached CLI token.
    """

    def __init__(self, repo_id: str, token: str | None = None) -> None:
        self.repo_id = repo_id
        self._token = token or hf_get_token()
        self._api = HfApi(token=self._token)
        self._repo_ready = False
        self._ensure_reason: str | None = None
        self._repo_lock = threading.Lock()
        self._cache_lock = threading.Lock()
        self._cache: list[dict] | None = None
        self._cache_at: float = 0.0

    def push_sync(self, record: dict) -> tuple[bool, str | None]:
        """Persist *record* to Hub. Returns ``(ok, reason)``. Blocks on I/O."""
        return self._push_sync(record)

    def list(self, limit: int = 50, subgraph: str | None = None) -> builtins.list[dict]:
        """Return recent records, newest first.

        Results are cached for ``_LIST_CACHE_TTL`` seconds to avoid
        hammering the Hub on rapid panel refreshes. Cache-miss fetches
        happen outside the lock so concurrent callers don't serialize on
        one Hub round-trip.
        """
        now = time.monotonic()
        with self._cache_lock:
            fresh = self._cache is not None and (now - self._cache_at) < _LIST_CACHE_TTL
            records = self._cache if fresh else None

        if records is None:
            fetched = self._fetch_records()
            with self._cache_lock:
                self._cache = fetched
                self._cache_at = time.monotonic()
            records = fetched

        if subgraph:
            records = [r for r in records if r.get("subgraph") == subgraph]
        return records[:limit]

    def delete(self, record_id: str, timestamp: str) -> bool:
        """Delete a single record from the bucket.

        Returns True on success, False if the record could not be deleted.
        """
        try:
            safe_ts = timestamp.replace(":", "-")
            path_in_repo = f"data/{safe_ts}_{record_id}.json"
            self._api.batch_bucket_files(
                bucket_id=self.repo_id,
                delete=[path_in_repo],
            )
            with self._cache_lock:
                self._cache = None
            return True
        except Exception:
            logger.warning("BucketHistory: delete failed", exc_info=True)
            return False

    def ensure_repo(self) -> tuple[bool, str | None]:
        """Ensure the bucket exists. Returns ``(ok, reason)`` where reason is
        ``"no_permission"``, ``"unknown"``, or ``None`` on success.

        A cached ``no_permission`` short-circuits future attempts (the OAuth
        scope won't change mid-session); transient failures are retried.
        """
        with self._repo_lock:
            if self._repo_ready:
                return True, None
            if self._ensure_reason == "no_permission":
                return False, self._ensure_reason
            try:
                self._api.create_bucket(self.repo_id, private=True, exist_ok=True)
                self._repo_ready = True
                self._ensure_reason = None
                return True, None
            except Exception as e:
                status = getattr(getattr(e, "response", None), "status_code", None)
                reason = "no_permission" if status == 403 else "unknown"
                self._ensure_reason = reason
                logger.warning(
                    "BucketHistory: could not create bucket %s "
                    "(add hf_oauth_scopes: [manage-repos] to the Space README, "
                    "or create the bucket manually)",
                    self.repo_id,
                    exc_info=True,
                )
                return False, reason

    def _push_sync(self, record: dict) -> tuple[bool, str | None]:
        """Upload media, then write the record. Returns ``(ok, reason)``."""
        try:
            ok, reason = self.ensure_repo()
            if not ok:
                return False, reason

            for sid, output in list(record.get("outputs", {}).items()):
                value = output.get("value")
                port_type = output.get("type", "text")
                url = (
                    value
                    if isinstance(value, str)
                    else value.get("url")
                    if isinstance(value, dict)
                    else None
                )
                if port_type in MEDIA_PORT_TYPES and isinstance(url, str):
                    from urllib.parse import unquote, urlparse

                    raw = (
                        url[len("/gradio_api/file=") :]
                        if url.startswith("/gradio_api/file=")
                        else url
                    )
                    fs_path = unquote(urlparse(raw).path or raw)
                    hub_url = self._upload_media(record["id"], sid, fs_path, port_type)
                    if hub_url:
                        record["outputs"][sid]["bucket_url"] = hub_url

            ts = record.get("timestamp") or datetime.now(timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            )
            safe_ts = ts.replace(":", "-")
            path_in_repo = (
                f"data/{safe_ts}_{record.get('id', secrets.token_hex(8))}.json"
            )
            data = json.dumps(record, ensure_ascii=False).encode("utf-8")
            self._api.batch_bucket_files(
                bucket_id=self.repo_id,
                add=[(data, path_in_repo)],
            )
            with self._cache_lock:
                self._cache = None
            return True, None

        except Exception:
            logger.warning("BucketHistory: push failed", exc_info=True)
            return False, "hub"

    def _upload_media(
        self, gen_id: str, sid: str, value: str, port_type: str
    ) -> str | None:
        """Upload a local media file to the bucket's ``media/`` dir."""
        if not os.path.isfile(value):
            return None
        real_value = os.path.realpath(value)
        real_tmp = os.path.realpath(tempfile.gettempdir())
        if not real_value.startswith(real_tmp + os.sep):
            logger.debug("BucketHistory: refusing to upload non-temp path: %s", value)
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
            return (
                f"https://huggingface.co/buckets/{self.repo_id}/resolve/{path_in_repo}"
            )
        except Exception:
            logger.debug("BucketHistory: media upload failed", exc_info=True)
            return None

    def _fetch_records(self) -> builtins.list[dict]:
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
                    logger.debug("BucketHistory: bucket download failed", exc_info=True)
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
            logger.debug("BucketHistory: fetch failed", exc_info=True)
            return []
