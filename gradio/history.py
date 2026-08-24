"""Durable per-app run history in a private HF Hub bucket.

Layout: ``records/<record_id>.json`` + ``assets/<record_id>/<asset_id>.<ext>``.
JSON is the commit marker — written only after every asset upload succeeds.
"""

from __future__ import annotations

import json
import logging
import mimetypes
import os
import re
import threading
import time
from collections import OrderedDict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone

from huggingface_hub import HfApi
from huggingface_hub import get_token as hf_get_token

from gradio.utils import get_upload_folder, is_in_or_equal

logger = logging.getLogger(__name__)


SCHEMA_VERSION = 1

_LIST_CACHE_TTL = 10.0
_MAX_FILES_SCAN = 200

BUCKET_ID_RE = re.compile(r"^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$")
_RECORD_ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


class HistoryStoreError(Exception):
    pass


class NotAuthorized(HistoryStoreError):
    pass


class NotFound(HistoryStoreError):
    pass


class HubError(HistoryStoreError):
    pass


class PublicBucketError(HistoryStoreError):
    pass


def validate_bucket_id(bucket_id: str) -> None:
    if not BUCKET_ID_RE.fullmatch(bucket_id or ""):
        raise ValueError("invalid bucket id")
    if any(seg in {"", ".", ".."} for seg in bucket_id.split("/")):
        raise ValueError("invalid bucket id")


def validate_record_id(record_id: str) -> None:
    if not _RECORD_ID_RE.fullmatch(record_id or ""):
        raise ValueError("invalid record id")


@dataclass
class HistoryRecord:
    record_id: str
    owner_id: str
    app_key: str
    created_at: str
    inputs: dict
    outputs: dict
    assets: dict[str, str] = field(default_factory=dict)
    schema_version: int = SCHEMA_VERSION
    subgraph: str | None = None

    def to_json_bytes(self) -> bytes:
        return json.dumps(asdict(self), ensure_ascii=False).encode("utf-8")

    @classmethod
    def from_json_bytes(cls, data: bytes) -> HistoryRecord:
        d = json.loads(data)
        return cls(
            record_id=d["record_id"],
            owner_id=d["owner_id"],
            app_key=d["app_key"],
            created_at=d["created_at"],
            inputs=d.get("inputs", {}),
            outputs=d.get("outputs", {}),
            assets=d.get("assets", {}),
            schema_version=d.get("schema_version", SCHEMA_VERSION),
            subgraph=d.get("subgraph"),
        )


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def is_trusted_local_path(path: str) -> bool:
    if not isinstance(path, str) or not path:
        return False
    try:
        if not os.path.isfile(path):
            return False
        return is_in_or_equal(os.path.realpath(path), get_upload_folder())
    except Exception:
        return False


def extract_local_file_path(value) -> str | None:
    src = None
    if isinstance(value, dict):
        src = value.get("path") or value.get("url") or ""
        if isinstance(src, str) and src.startswith("/gradio_api/file="):
            src = src[len("/gradio_api/file=") :]
    if not isinstance(src, str) or not src:
        return None
    return src if is_trusted_local_path(src) else None


class BucketRunHistoryStore:
    def __init__(
        self,
        repo_id: str,
        *,
        app_key: str,
        owner_id: str,
        token: str | None = None,
    ) -> None:
        validate_bucket_id(repo_id)
        self.repo_id = repo_id
        self.app_key = app_key
        self.owner_id = owner_id
        self._token = token or hf_get_token()
        self._api = HfApi(token=self._token)
        self._ensure_lock = threading.Lock()
        self._ensured = False
        self._cache_lock = threading.Lock()
        self._cache: list[bytes] | None = None
        self._cache_at: float = 0.0

    def ensure_private_bucket(self) -> None:
        with self._ensure_lock:
            if self._ensured:
                return
            try:
                self._api.create_bucket(self.repo_id, private=True, exist_ok=True)
            except Exception as e:
                status = getattr(getattr(e, "response", None), "status_code", None)
                if status == 403:
                    raise NotAuthorized(
                        f"missing manage-repos scope for {self.repo_id}"
                    ) from e
                raise HubError(f"bucket create failed: {e}") from e
            try:
                info = self._api.bucket_info(self.repo_id)
                if getattr(info, "private", True) is False:
                    raise PublicBucketError(
                        f"bucket {self.repo_id} is public; refusing to store history"
                    )
            except PublicBucketError:
                raise
            except Exception as e:
                raise HubError(f"bucket privacy check failed: {e}") from e
            self._ensured = True

    def save_record(
        self,
        record: HistoryRecord,
        local_assets: dict[str, tuple[str, str]] | None = None,
    ) -> None:
        validate_record_id(record.record_id)
        self.ensure_private_bucket()

        adds: list[tuple] = []
        if local_assets:
            for asset_id, (local_path, content_type) in local_assets.items():
                validate_record_id(asset_id)
                if not is_trusted_local_path(local_path):
                    logger.warning(
                        "history: skipping asset %s — untrusted path %r",
                        asset_id,
                        local_path,
                    )
                    continue
                ext = _ext_from(local_path, content_type)
                path_in_repo = f"assets/{record.record_id}/{asset_id}{ext}"
                adds.append((local_path, path_in_repo))
                record.assets[asset_id] = path_in_repo

        stale = [
            getattr(it, "path", "")
            for it in self._safe_list_tree(prefix=f"assets/{record.record_id}/")
        ]
        stale = [p for p in stale if p and p not in {a[1] for a in adds}]

        try:
            if stale:
                self._api.batch_bucket_files(bucket_id=self.repo_id, delete=stale)
            if adds:
                self._api.batch_bucket_files(bucket_id=self.repo_id, add=adds)
            self._api.batch_bucket_files(
                bucket_id=self.repo_id,
                add=[(record.to_json_bytes(), f"records/{record.record_id}.json")],
            )
        except Exception as e:
            raise HubError(f"save_record failed: {e}") from e

        with self._cache_lock:
            self._cache = None

    def list_records(self, limit: int = 50) -> list[HistoryRecord]:
        now = time.monotonic()
        with self._cache_lock:
            fresh = self._cache is not None and (now - self._cache_at) < _LIST_CACHE_TTL
            blobs = self._cache if fresh else None
        if blobs is None:
            blobs = self._fetch_all_records()
            with self._cache_lock:
                self._cache = blobs
                self._cache_at = time.monotonic()
        out: list[HistoryRecord] = []
        for b in blobs[:limit]:
            try:
                out.append(HistoryRecord.from_json_bytes(b))
            except Exception:
                continue
        return out

    def get_record(self, record_id: str) -> HistoryRecord:
        validate_record_id(record_id)
        try:
            data = self._download_bytes(f"records/{record_id}.json")
        except NotFound:
            raise
        except Exception as e:
            raise HubError(f"get_record failed: {e}") from e
        return HistoryRecord.from_json_bytes(data)

    def get_asset_bytes(self, record_id: str, asset_id: str) -> tuple[bytes, str]:
        validate_record_id(record_id)
        validate_record_id(asset_id)
        record = self.get_record(record_id)
        path = record.assets.get(asset_id)
        if not path:
            raise NotFound(f"asset {asset_id} not found for record {record_id}")
        ct = mimetypes.guess_type(path)[0] or "application/octet-stream"
        try:
            return self._download_bytes(path), ct
        except Exception as e:
            raise HubError(f"asset download failed: {e}") from e

    def delete_record(self, record_id: str) -> None:
        validate_record_id(record_id)
        asset_paths = [
            getattr(it, "path", "")
            for it in self._safe_list_tree(prefix=f"assets/{record_id}/")
        ]
        paths = [f"records/{record_id}.json"] + [p for p in asset_paths if p]
        try:
            self._api.batch_bucket_files(bucket_id=self.repo_id, delete=paths)
        except Exception as e:
            raise HubError(f"delete_record failed: {e}") from e
        with self._cache_lock:
            self._cache = None

    def clear_records(self) -> None:
        paths = [
            getattr(it, "path", "")
            for it in self._safe_list_tree(prefix="records/")
            if getattr(it, "path", "").endswith(".json")
        ]
        paths += [
            getattr(it, "path", "")
            for it in self._safe_list_tree(prefix="assets/")
            if getattr(it, "path", "")
        ]
        paths = [p for p in paths if p]
        if not paths:
            return
        try:
            self._api.batch_bucket_files(bucket_id=self.repo_id, delete=paths)
        except Exception as e:
            raise HubError(f"clear_records failed: {e}") from e
        with self._cache_lock:
            self._cache = None

    def _fetch_all_records(self) -> list[bytes]:
        try:
            items = sorted(
                (
                    it
                    for it in self._safe_list_tree(prefix="records/")
                    if getattr(it, "path", "").endswith(".json")
                    and not hasattr(it, "count")
                ),
                key=lambda f: getattr(f, "last_modified", "") or f.path,
                reverse=True,
            )[:_MAX_FILES_SCAN]
        except Exception:
            return []
        if not items:
            return []
        import tempfile

        blobs: list[bytes] = []
        with tempfile.TemporaryDirectory() as tmp:
            pairs = [
                (it.path, os.path.join(tmp, f"{i}.json")) for i, it in enumerate(items)
            ]
            try:
                self._api.download_bucket_files(
                    bucket_id=self.repo_id, files=pairs, token=self._token
                )
            except Exception:
                return []
            for _, local in pairs:
                try:
                    with open(local, "rb") as fh:
                        blobs.append(fh.read())
                except Exception:
                    continue
        return blobs

    def _safe_list_tree(self, prefix: str):
        try:
            yield from self._api.list_bucket_tree(self.repo_id, prefix=prefix)
        except Exception:
            return

    def _download_bytes(self, path_in_repo: str) -> bytes:
        import tempfile

        with tempfile.TemporaryDirectory() as tmp:
            local = os.path.join(tmp, os.path.basename(path_in_repo))
            try:
                self._api.download_bucket_files(
                    bucket_id=self.repo_id,
                    files=[(path_in_repo, local)],
                    token=self._token,
                )
            except Exception as e:
                status = getattr(getattr(e, "response", None), "status_code", None)
                if status == 404:
                    raise NotFound(path_in_repo) from e
                raise
            with open(local, "rb") as fh:
                return fh.read()


def bucket_for_token(
    cache: OrderedDict,
    lock: threading.Lock,
    token: str,
    bucket_id: str,
    *,
    owner_id: str,
    app_key: str,
    max_entries: int = 256,
) -> BucketRunHistoryStore:
    validate_bucket_id(bucket_id)
    key = (token, bucket_id, owner_id, app_key)
    with lock:
        store = cache.get(key)
        if store is not None:
            cache.move_to_end(key)
            return store
        store = BucketRunHistoryStore(
            bucket_id, token=token, owner_id=owner_id, app_key=app_key
        )
        cache[key] = store
        if len(cache) > max_entries:
            cache.popitem(last=False)
        return store


def _ext_from(local_path: str, content_type: str | None) -> str:
    ext = os.path.splitext(local_path)[1]
    if ext:
        return ext
    if content_type:
        ext = mimetypes.guess_extension(content_type.split(";", 1)[0].strip())
        if ext:
            return ext
    return ".bin"


def externalize_assets(
    tree,
    counter: list[int] | None = None,
) -> dict[str, tuple[str, str]]:
    """Walk *tree* in place, replace trusted-local FileData nodes with
    ``{"__asset__": <id>}`` markers, return ``{id: (path, content_type)}``."""
    if counter is None:
        counter = [0]
    assets: dict[str, tuple[str, str]] = {}

    def _walk(node):
        if isinstance(node, dict):
            local = extract_local_file_path(node)
            if local is not None:
                counter[0] += 1
                asset_id = f"a{counter[0]:03d}"
                ct = _content_type_of(node, local)
                assets[asset_id] = (local, ct)
                return {"__asset__": asset_id}
            return {k: _walk(v) for k, v in node.items()}
        if isinstance(node, list):
            return [_walk(v) for v in node]
        return node

    if isinstance(tree, dict):
        for k in list(tree.keys()):
            tree[k] = _walk(tree[k])
    return assets


def _content_type_of(node, local_path: str) -> str:
    if isinstance(node, dict):
        m = node.get("mime_type") or node.get("mime")
        if isinstance(m, str) and m:
            return m
    return mimetypes.guess_type(local_path)[0] or "application/octet-stream"
