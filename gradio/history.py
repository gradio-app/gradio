"""Durable run history in an HF Hub bucket."""

from __future__ import annotations

import asyncio
import ipaddress
import json
import logging
import mimetypes
import os
import re
import secrets
import tempfile
import threading
import time
from collections import OrderedDict
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Annotated, Any, NamedTuple, Union
from urllib.parse import unquote, urlparse

import anyio
import anyio.to_thread
import fastapi
import gradio_client.utils as client_utils
import httpx
from fastapi import Depends, Path, Query, Request
from huggingface_hub import HfApi
from pydantic import BaseModel

from gradio import oauth, processing_utils
from gradio.utils import get_upload_folder, is_in_or_equal

logger = logging.getLogger(__name__)


SCHEMA_VERSION = 2

_MAX_LIST_PATHS = 5000
MAX_RECORDS_PER_PAGE = 200

MAX_REMOTE_ASSET_BYTES = 64 * 1024 * 1024

BUCKET_ID_RE = re.compile(r"^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$")
RECORD_ID_PATTERN = r"^[A-Za-z0-9_-]{1,64}$"
SEGMENT_PATTERN = r"^[A-Za-z0-9_.-]{1,80}$"
_SEGMENT_RE = re.compile(SEGMENT_PATTERN)


class HistoryError(Exception):
    """A history operation failed; ``status`` is the HTTP code to surface."""

    def __init__(self, message: str, status: int = 500):
        super().__init__(message)
        self.status = status


def validate_bucket_id(bucket_id: str) -> None:
    segments = (bucket_id or "").split("/")
    if not BUCKET_ID_RE.fullmatch(bucket_id or "") or any(
        seg in {"", ".", ".."} for seg in segments
    ):
        raise ValueError("invalid bucket id")


def validate_segment(segment: str) -> None:
    """Reject anything that is not a single safe path segment."""
    if not _SEGMENT_RE.fullmatch(segment or "") or segment in {".", ".."}:
        raise ValueError("invalid path segment")


def sanitize_segment(value: Any, fallback: str = "app") -> str:
    """Coerce arbitrary text into a safe, stable path segment."""
    slug = re.sub(r"[^A-Za-z0-9_.-]+", "-", str(value or "")).strip("-.")
    slug = slug[:80].strip("-.")
    return slug or fallback


def new_record_id() -> str:
    """Timestamp-prefixed id that sorts chronologically under a stable clock."""
    return f"{time.time_ns():020d}{secrets.token_hex(4)}"


def now_utc_iso() -> str:
    """Millisecond precision, matching the browser's `Date.toISOString()`."""
    now = datetime.now(timezone.utc)
    return f"{now:%Y-%m-%dT%H:%M:%S}.{now.microsecond // 1000:03d}Z"


@dataclass
class HistoryRecord:
    """One run of one endpoint."""

    record_id: str
    endpoint: str
    inputs: Any = None
    outputs: Any = None
    started_at: str = ""
    schema_version: int = SCHEMA_VERSION

    def to_json_bytes(self) -> bytes:
        return json.dumps(asdict(self), ensure_ascii=False, default=str).encode("utf-8")

    @classmethod
    def from_json_bytes(cls, data: bytes) -> HistoryRecord:
        d = json.loads(data)
        version = d.get("schema_version", SCHEMA_VERSION)
        if not isinstance(version, int) or version > SCHEMA_VERSION:
            raise ValueError(f"unsupported record schema version {version!r}")
        known = set(cls.__dataclass_fields__)
        return cls(**{k: v for k, v in d.items() if k in known})


def is_trusted_local_path(path: str) -> bool:
    if not isinstance(path, str) or not path:
        return False
    try:
        if not os.path.isfile(path):
            return False
        return is_in_or_equal(os.path.realpath(path), get_upload_folder())
    except Exception:
        return False


_FILE_URL_MARKERS = ("/gradio_api/file=", "/file=")


def extract_local_file_path(value) -> str | None:
    """Resolve a file node to a trusted local path, or None."""
    if not isinstance(value, dict):
        return None
    src = value.get("path") or value.get("url") or ""
    if not isinstance(src, str) or not src:
        return None
    for marker in _FILE_URL_MARKERS:
        idx = src.find(marker)
        if idx != -1:
            src = unquote(src[idx + len(marker) :].split("?", 1)[0])
            break
    return src if is_trusted_local_path(src) else None


def extract_remote_url(value) -> str | None:
    """A file node whose payload lives on another origin, or None."""
    if not isinstance(value, dict):
        return None
    src = value.get("url") or value.get("path") or ""
    if not isinstance(src, str) or not src:
        return None
    parsed = urlparse(src)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        return None
    return src


async def fetch_remote_asset(url: str) -> tuple[bytes, str] | None:
    """Download a remote asset through gradio's SSRF-protected client, or None."""
    try:
        response = await processing_utils.async_ssrf_protected_get(url)
        if response.status_code != 200:
            return None
        data = response.content
        if len(data) > MAX_REMOTE_ASSET_BYTES:
            logger.debug("history: remote asset over size cap: %s", url)
            return None
        if not data:
            return None
        content_type = response.headers.get("content-type", "").split(";", 1)[0].strip()
        return data, content_type or "application/octet-stream"
    except Exception:
        logger.debug("history: remote asset fetch failed for %s", url, exc_info=True)
        return None


@dataclass
class PendingAsset:
    """An asset to store: a local file to upload, or bytes in hand."""

    local_path: str | None = None
    data: bytes | None = None


class HistoryTarget(NamedTuple):
    """Where history goes: which bucket, whose credential, which app.

    This sink writes to the Hub itself, so the process holds a token that can
    act as the user. That is fine where the user has delegated to this app
    explicitly — a local app, a self-hosted one, or an OAuth sign-in — and is
    exactly what a Space must not have; see `IngestTarget`.
    """

    bucket: str
    token: str
    app_id: str

    @classmethod
    def build(cls, bucket: str, token: str, app_id: str) -> HistoryTarget:
        validate_bucket_id(bucket)
        validate_segment(app_id)
        return cls(bucket, token, app_id)

    def save(self, record: HistoryRecord, assets: dict[str, PendingAsset] | None):
        return save_record(self, record, assets)

    def list(self, limit: int = 50) -> list[HistoryRecord]:
        return list_records(self, limit)

    def asset(self, endpoint: str, record_id: str, filename: str):
        return get_asset_bytes(self, endpoint, record_id, filename)


class IngestTarget(NamedTuple):
    """Platform-side history, for an app the user has *not* delegated to.

    A Space runs code its visitors never agreed to trust, so the platform never
    hands it a credential: the Spaces proxy strips the token the browser sent
    and forwards `X-IP-Token`, a short-lived assertion of who is calling that
    the Space cannot even read. This sink carries that assertion straight back
    to a platform endpoint, which resolves the caller and writes into their own
    history with its own credential.

    So the app can append a run for whoever actually made the request, and
    nothing else: it cannot read the token, choose the user, or reach anything
    else the caller owns.
    """

    endpoint: str
    ip_token: str
    app_id: str
    #: Where the caller asked for their runs to go, when they asked at all. A
    #: hint, not an instruction — the platform decides what it will honour.
    bucket: str | None = None

    def save(self, record: HistoryRecord, assets: dict[str, PendingAsset] | None):
        return ingest_save_record(self, record, assets)

    def list(self, limit: int = 50) -> list[HistoryRecord]:
        return ingest_list_records(self, limit)

    def asset(self, endpoint: str, record_id: str, filename: str):
        return ingest_get_asset(self, endpoint, record_id, filename)


AnyTarget = Union[HistoryTarget, "IngestTarget"]


def _api(target: HistoryTarget) -> HfApi:
    return HfApi(token=target.token)


RUNS_PREFIX = "runs"
ASSETS_PREFIX = "assets"


def record_path(app_id: str, endpoint: str, record_id: str) -> str:
    validate_segment(endpoint)
    validate_segment(record_id)
    return f"{RUNS_PREFIX}/{app_id}/{endpoint}/{record_id}.json"


def asset_prefix(app_id: str, endpoint: str, record_id: str) -> str:
    validate_segment(endpoint)
    validate_segment(record_id)
    return f"{ASSETS_PREFIX}/{app_id}/{endpoint}/{record_id}/"


_ensured: set[tuple[str, str]] = set()
_ensure_lock = threading.Lock()

_LIST_CACHE_TTL = 30.0
_LIST_CACHE_MAX = 64
_list_cache: OrderedDict[tuple[str, str, str, int], tuple[float, list]] = OrderedDict()
_list_lock = threading.Lock()


def _invalidate_list_cache(bucket: str, app_id: str) -> None:
    with _list_lock:
        for key in [k for k in _list_cache if k[1] == bucket and k[2] == app_id]:
            _list_cache.pop(key, None)


def ensure_bucket(target: HistoryTarget) -> None:
    """Create the bucket if it does not exist; new ones default to private."""
    key = (target.token, target.bucket)
    with _ensure_lock:
        if key in _ensured:
            return
        try:
            _api(target).create_bucket(target.bucket, private=True, exist_ok=True)
        except Exception as e:
            status = getattr(getattr(e, "response", None), "status_code", None)
            if status == 403:
                raise HistoryError(
                    f"missing manage-repos scope for {target.bucket}", 403
                ) from e
            raise HistoryError(f"bucket create failed: {e}", 502) from e
        _ensured.add(key)


def save_record(
    target: HistoryTarget,
    record: HistoryRecord,
    assets: dict[str, PendingAsset] | None = None,
) -> None:
    """Write *record*, uploading its assets first. The JSON is the commit marker."""
    validate_segment(record.record_id)
    validate_segment(record.endpoint)
    ensure_bucket(target)
    api = _api(target)

    adds: list[tuple[Any, str]] = []
    if assets:
        prefix = asset_prefix(target.app_id, record.endpoint, record.record_id)
        for filename, pending in assets.items():
            validate_segment(filename)
            path_in_repo = f"{prefix}{filename}"
            if pending.data is not None:
                adds.append((pending.data, path_in_repo))
            elif is_trusted_local_path(pending.local_path or ""):
                adds.append((pending.local_path, path_in_repo))
            else:
                logger.warning(
                    "history: skipping asset %s — untrusted path %r",
                    filename,
                    pending.local_path,
                )
                continue

    try:
        if adds:
            api.batch_bucket_files(bucket_id=target.bucket, add=adds)
        api.batch_bucket_files(
            bucket_id=target.bucket,
            add=[
                (
                    record.to_json_bytes(),
                    record_path(target.app_id, record.endpoint, record.record_id),
                )
            ],
        )
    except Exception as e:
        if adds:
            try:
                _api(target).batch_bucket_files(
                    bucket_id=target.bucket, delete=[p for _, p in adds]
                )
            except Exception:
                logger.debug("history: cleanup delete failed", exc_info=True)
        raise HistoryError(f"save_record failed: {e}", 502) from e

    _invalidate_list_cache(target.bucket, target.app_id)


def list_records(target: HistoryTarget, limit: int = 50) -> list[HistoryRecord]:
    """The newest *limit* records for this app."""
    limit = max(1, min(int(limit), MAX_RECORDS_PER_PAGE))
    cache_key = (target.token, target.bucket, target.app_id, limit)
    now = time.monotonic()
    with _list_lock:
        hit = _list_cache.get(cache_key)
        if hit is not None and (now - hit[0]) < _LIST_CACHE_TTL:
            _list_cache.move_to_end(cache_key)
            return list(hit[1])
    prefix = f"{RUNS_PREFIX}/{target.app_id}/"
    paths = [p for p in _list_paths(target, prefix) if p.endswith(".json")]
    paths.sort(key=lambda p: p.rsplit("/", 1)[-1], reverse=True)
    selected = paths[:limit]
    if not selected:
        return []
    records: list[HistoryRecord] = []
    for path, blob in _download_many(target, selected):
        try:
            records.append(HistoryRecord.from_json_bytes(blob))
        except Exception:
            logger.debug("history: skipping unreadable record %s", path)
    records.sort(key=lambda r: r.record_id, reverse=True)
    with _list_lock:
        _list_cache[cache_key] = (time.monotonic(), list(records))
        _list_cache.move_to_end(cache_key)
        while len(_list_cache) > _LIST_CACHE_MAX:
            _list_cache.popitem(last=False)
    return records


def get_asset_bytes(
    target: HistoryTarget, endpoint: str, record_id: str, filename: str
) -> tuple[bytes, str]:
    validate_segment(filename)
    path = f"{asset_prefix(target.app_id, endpoint, record_id)}{filename}"
    ct = mimetypes.guess_type(path)[0] or "application/octet-stream"
    try:
        return _download_bytes(target, path), ct
    except HistoryError:
        raise
    except Exception as e:
        raise HistoryError(f"asset download failed: {e}", 502) from e


def _list_paths(target: HistoryTarget, prefix: str) -> list[str]:
    """File paths under *prefix*, capped. Nothing there yet is not an error."""
    paths: list[str] = []
    try:
        for item in _api(target).list_bucket_tree(
            target.bucket, prefix=prefix, recursive=True
        ):
            if getattr(item, "type", "file") == "directory" or not getattr(
                item, "path", ""
            ):
                continue
            paths.append(item.path)
            if len(paths) >= _MAX_LIST_PATHS:
                logger.warning("history: listing for %s hit the path cap", prefix)
                break
    except Exception as e:
        status = getattr(getattr(e, "response", None), "status_code", None)
        if status == 404:
            return []
        raise HistoryError(
            f"could not list {prefix}: {e}", status if status in (401, 403) else 502
        ) from e
    return paths


def _download_many(target: HistoryTarget, paths: list[str]) -> list[tuple[str, bytes]]:
    out: list[tuple[str, bytes]] = []
    with tempfile.TemporaryDirectory() as tmp:
        pairs = [(p, os.path.join(tmp, f"{i}.json")) for i, p in enumerate(paths)]
        try:
            _api(target).download_bucket_files(
                bucket_id=target.bucket, files=pairs, token=target.token
            )
        except Exception:
            logger.debug("history: bulk record download failed", exc_info=True)
            return []
        for path, local in pairs:
            try:
                with open(local, "rb") as fh:
                    out.append((path, fh.read()))
            except Exception:
                continue
    return out


def _download_bytes(target: HistoryTarget, path_in_repo: str) -> bytes:
    with tempfile.TemporaryDirectory() as tmp:
        local = os.path.join(tmp, os.path.basename(path_in_repo))
        try:
            _api(target).download_bucket_files(
                bucket_id=target.bucket,
                files=[(path_in_repo, local)],
                token=target.token,
            )
        except Exception as e:
            status = getattr(getattr(e, "response", None), "status_code", None)
            if status == 404:
                raise HistoryError(path_in_repo, 404) from e
            raise
        if not os.path.exists(local):
            raise HistoryError(path_in_repo, 404)
        with open(local, "rb") as fh:
            return fh.read()


def _ext_from(local_path: str | None, content_type: str | None) -> str:
    ext = os.path.splitext(local_path or "")[1]
    if ext and len(ext) <= 12 and re.fullmatch(r"\.[A-Za-z0-9]+", ext):
        return ext
    if content_type:
        ext = mimetypes.guess_extension(content_type.split(";", 1)[0].strip())
        if ext:
            return ext
    return ".bin"


def _is_asset_node(node: Any) -> bool:
    """A gradio file node, or a url-only node as a workflow canvas emits."""
    if client_utils.is_file_obj(node):
        return True
    return isinstance(node, dict) and isinstance(node.get("url"), str)


async def externalize_assets(
    tree: Any,
    counter: list[int] | None = None,
) -> tuple[Any, dict[str, PendingAsset]]:
    """Replace file nodes with asset filenames, capturing their bytes."""
    if counter is None:
        counter = [0]
    assets: dict[str, PendingAsset] = {}

    def _next_filename(path: str, content_type: str) -> str:
        counter[0] += 1
        return f"a{counter[0]:03d}{_ext_from(path, content_type)}"

    async def _capture(node: Any) -> Any:
        local = extract_local_file_path(node)
        if local is not None:
            content_type = _content_type_of(node, local)
            filename = _next_filename(local, content_type)
            assets[filename] = PendingAsset(
                local_path=local,
            )
            return {"__asset__": filename}
        remote = extract_remote_url(node)
        if remote is not None:
            fetched = await fetch_remote_asset(remote)
            if fetched is not None:
                data, content_type = fetched
                suggested_name = urlparse(remote).path.rsplit("/", 1)[-1]
                content_type = _content_type_of(node, remote) or content_type
                filename = _next_filename(suggested_name, content_type)
                assets[filename] = PendingAsset(data=data)
                return {"__asset__": filename}
        return node

    rewritten = await client_utils.async_traverse(tree, _capture, _is_asset_node)
    return rewritten, assets


def _content_type_of(node, path_or_url: str) -> str:
    if isinstance(node, dict):
        m = node.get("mime_type") or node.get("mime")
        if isinstance(m, str) and m:
            return m
    return mimetypes.guess_type(path_or_url)[0] or "application/octet-stream"


# ------------------------------------------------------------ platform ingest
#
# The wire protocol below is what gradio needs from a platform that wants to
# record history on a user's behalf. It mirrors the bucket sink's ordering:
# assets are stored first and the record is the commit marker, so a half-written
# run never appears in a listing.
#
#   1. POST {endpoint}/runs/uploads   {app_id, bucket?, assets:[{filename,
#                                      content_type, size}]}
#      -> {uploads: {filename: {url, method?, headers?}}}
#      Skipped entirely when a run has no assets.
#   2. PUT (or the given method) each asset's bytes to its url. The bytes go
#      straight to storage, never through the ingest service.
#   3. POST {endpoint}/runs           {app_id, bucket?, record: {...}}
#      -> 2xx once the run is visible.
#
# Reads are the same endpoint from the other side:
#
#   GET {endpoint}/runs?app_id=&limit=            -> {records: [...]}
#   GET {endpoint}/runs/{endpoint}/{record_id}/assets/{filename}?app_id=
#      -> the bytes, or a redirect to them.
#
# Every request carries `X-IP-Token`. That is the whole authorization story:
# there is no bucket id to trust and no token to leak.

PLATFORM_INGEST_ENV = "GRADIO_HISTORY_INGEST_URL"
IP_TOKEN_HEADER = "x-ip-token"
INGEST_TIMEOUT = 30.0


def _ingest_headers(target: IngestTarget) -> dict[str, str]:
    return {IP_TOKEN_HEADER: target.ip_token}


def _ingest_url(target: IngestTarget, path: str) -> str:
    return f"{target.endpoint.rstrip('/')}/{path.lstrip('/')}"


def _ingest_error(response: httpx.Response, what: str) -> HistoryError:
    # 401/403 travel back to the caller as they are: the assertion this app was
    # given is the only credential in play, and a stale one is worth saying so.
    status = response.status_code if response.status_code in (401, 403, 404) else 502
    return HistoryError(f"{what} failed: {response.status_code}", status)


def ingest_save_record(
    target: IngestTarget,
    record: HistoryRecord,
    assets: dict[str, PendingAsset] | None = None,
) -> None:
    """Hand one run to the platform, uploading its assets first."""
    validate_segment(record.record_id)
    validate_segment(record.endpoint)
    body: dict[str, Any] = {"app_id": target.app_id}
    if target.bucket:
        body["bucket"] = target.bucket

    with httpx.Client(timeout=INGEST_TIMEOUT, follow_redirects=True) as client:
        if assets:
            manifest = []
            payloads: dict[str, bytes] = {}
            for filename, pending in assets.items():
                validate_segment(filename)
                data = _asset_bytes(filename, pending)
                if data is None:
                    continue
                payloads[filename] = data
                manifest.append(
                    {
                        "filename": filename,
                        "content_type": mimetypes.guess_type(filename)[0]
                        or "application/octet-stream",
                        "size": len(data),
                    }
                )
            if manifest:
                reserved = client.post(
                    _ingest_url(target, "runs/uploads"),
                    headers=_ingest_headers(target),
                    json={**body, "assets": manifest},
                )
                if reserved.status_code >= 400:
                    raise _ingest_error(reserved, "asset upload reservation")
                uploads = (reserved.json() or {}).get("uploads") or {}
                for filename, data in payloads.items():
                    upload = uploads.get(filename)
                    if not upload or not upload.get("url"):
                        # The platform declined to store this one. The run is
                        # still worth keeping; the marker just resolves to
                        # nothing.
                        logger.debug("history: no upload target for %s", filename)
                        continue
                    stored = client.request(
                        upload.get("method", "PUT"),
                        upload["url"],
                        headers=upload.get("headers") or {},
                        content=data,
                    )
                    if stored.status_code >= 400:
                        raise _ingest_error(stored, f"asset upload {filename}")

        written = client.post(
            _ingest_url(target, "runs"),
            headers=_ingest_headers(target),
            json={**body, "record": asdict(record)},
        )
        if written.status_code >= 400:
            raise _ingest_error(written, "record write")


def _asset_bytes(filename: str, pending: PendingAsset) -> bytes | None:
    """The bytes to upload, or None if the path is not one we trust."""
    if pending.data is not None:
        return pending.data
    if is_trusted_local_path(pending.local_path or ""):
        with open(pending.local_path, "rb") as fh:  # type: ignore[arg-type]
            return fh.read()
    logger.warning(
        "history: skipping asset %s — untrusted path %r", filename, pending.local_path
    )
    return None


def ingest_list_records(target: IngestTarget, limit: int = 50) -> list[HistoryRecord]:
    """The newest runs this caller has for this app, newest first."""
    limit = max(1, min(int(limit), MAX_RECORDS_PER_PAGE))
    try:
        with httpx.Client(timeout=INGEST_TIMEOUT, follow_redirects=True) as client:
            response = client.get(
                _ingest_url(target, "runs"),
                headers=_ingest_headers(target),
                params={"app_id": target.app_id, "limit": limit},
            )
    except httpx.HTTPError as exc:
        raise HistoryError(f"history service unreachable: {exc}", 502) from exc
    if response.status_code == 404:
        return []
    if response.status_code >= 400:
        raise _ingest_error(response, "record listing")
    records = []
    for item in (response.json() or {}).get("records") or []:
        try:
            records.append(
                HistoryRecord(
                    **{
                        k: v
                        for k, v in item.items()
                        if k in HistoryRecord.__dataclass_fields__
                    }
                )
            )
        except Exception:
            logger.debug("history: skipping unreadable record from the service")
    return records


def ingest_get_asset(
    target: IngestTarget, endpoint: str, record_id: str, filename: str
) -> tuple[bytes, str]:
    validate_segment(endpoint)
    validate_segment(record_id)
    validate_segment(filename)
    try:
        with httpx.Client(timeout=INGEST_TIMEOUT, follow_redirects=True) as client:
            response = client.get(
                _ingest_url(target, f"runs/{endpoint}/{record_id}/assets/{filename}"),
                headers=_ingest_headers(target),
                params={"app_id": target.app_id},
            )
    except httpx.HTTPError as exc:
        raise HistoryError(f"history service unreachable: {exc}", 502) from exc
    if response.status_code >= 400:
        raise _ingest_error(response, "asset download")
    content_type = response.headers.get("content-type", "").split(";", 1)[0].strip()
    return response.content, content_type or (
        mimetypes.guess_type(filename)[0] or "application/octet-stream"
    )


def resolve_ingest(request, app_id: str, bucket: str | None = None):
    """The platform sink for this request, if the platform offers one.

    Needs both halves: an endpoint the host configured, and an identity
    assertion on this particular request. A request with no assertion is one the
    platform could not attribute, and an unattributed run has no owner to file
    it under.
    """
    endpoint = os.getenv(PLATFORM_INGEST_ENV)
    if not endpoint:
        return None
    raw = _fastapi_request(request)
    if raw is None:
        return None
    try:
        ip_token = raw.headers.get(IP_TOKEN_HEADER)
    except Exception:
        return None
    if not ip_token:
        return None
    try:
        validate_segment(app_id)
    except ValueError:
        return None
    return IngestTarget(endpoint, ip_token, app_id, bucket or None)


BUCKET_HEADER = "x-gradio-history-bucket"
MAX_CONCURRENT_WRITES = 8


def init_history_state(app) -> None:
    """Attach the per-app state the recorder and the read routes share."""
    app.state.history_write_limiter = anyio.CapacityLimiter(MAX_CONCURRENT_WRITES)
    app.state.history_tasks = set()


def app_id_of(blocks) -> str:
    """The folder this app's runs are filed under; re-minted on restart."""
    return sanitize_segment(getattr(blocks, "app_id", None) or "app")


def _fastapi_request(request) -> Any | None:
    """Unwrap a `gr.Request` to the underlying fastapi request, if there is one."""
    if request is None:
        return None
    if isinstance(request, list):
        request = request[0] if request else None
        if request is None:
            return None
    inner = getattr(request, "request", None)
    return inner if inner is not None else request


def app_from_request(request) -> Any | None:
    """The gradio ``App`` serving *request*."""
    raw = _fastapi_request(request)
    return getattr(raw, "app", None) if raw is not None else None


def _is_loopback_host(value: str | None) -> bool:
    if not value:
        return False
    if value.lower() == "localhost":
        return True
    try:
        return ipaddress.ip_address(value).is_loopback
    except ValueError:
        return False


def _is_direct_local_request(request) -> bool:
    """Whether the browser reached a local-only Gradio URL directly.

    Check both the public Host and the network peer. A share tunnel may connect
    to the server from loopback, while a LAN client can forge ``Host:
    localhost``; requiring both prevents either from inheriting the host's
    locally saved Hugging Face credential.
    """
    try:
        return _is_loopback_host(request.url.hostname) and _is_loopback_host(
            request.client.host
        )
    except (AttributeError, ValueError):
        return False


def resolve_token(request) -> str | None:
    """The caller's HF token: their OAuth token, else the host's own local one.

    The local credential is limited to Workflow's write-token holder or a
    browser connected directly over loopback. Imported lazily because
    `gradio.workflow` imports this module.
    """
    from gradio.workflow import _get_locally_saved_hf_token, _request_has_write_token

    raw = _fastapi_request(request)
    if raw is None:
        return None
    try:
        info = oauth._get_valid_oauth_info_from_session(raw.session)
    except Exception:
        info = None
    token = (info or {}).get("access_token")
    # Off Spaces, `attach_oauth` mocks the login routes and puts a sentinel in the
    # session rather than a real credential. Returning it would send it to the Hub
    # and 401, so a locally "signed in" user falls through to the host's own token
    # — which is the identity the mocked session is standing in for anyway.
    if isinstance(token, str) and token and token != oauth.MOCKED_OAUTH_TOKEN:
        return token
    if raw is not None and (
        _request_has_write_token(raw) or _is_direct_local_request(raw)
    ):
        return _get_locally_saved_hf_token()
    return None


def require_token(request: Request) -> str:
    """The caller's HF token, or 401."""
    token = resolve_token(request)
    if not token:
        raise fastapi.HTTPException(401, "sign in to use run history")
    return token


def resolve_bucket_id(blocks, request, explicit: str | None = None) -> str | None:
    """Which bucket this run belongs in, resolved per request."""
    if explicit:
        return explicit
    raw = _fastapi_request(request)
    header = None
    if raw is not None:
        try:
            header = raw.headers.get(BUCKET_HEADER)
        except Exception:
            header = None
    if header:
        return header.strip()
    return os.getenv("GRADIO_HISTORY_BUCKET") or getattr(blocks, "history_bucket", None)


def resolve_target(
    app,
    request,
    *,
    bucket_id: str | None = None,
    app_id: str | None = None,
) -> AnyTarget | None:
    """The history sink for this caller, or None if nothing can be recorded.

    A credential the caller handed this app directly wins: they chose to
    delegate, and they chose the bucket. Only when there is no such credential
    does the platform's assertion come into play — which is the ordinary case
    for a visitor to a Space, who has delegated nothing.
    """
    blocks = app.get_blocks()
    if not getattr(blocks, "run_history", True):
        return None
    app_id = app_id or app_id_of(blocks)
    bucket = resolve_bucket_id(blocks, request, bucket_id)
    token = resolve_token(request)
    if bucket and token is not None:
        try:
            return HistoryTarget.build(bucket, token, app_id)
        except ValueError:
            logger.debug("history: ignoring invalid bucket id %r", bucket)
            return None
    return resolve_ingest(request, app_id, bucket)


def endpoint_key(api_name: str | None, fn_index: int | None) -> str:
    """The path segment a run is filed under: the endpoint it ran."""
    if api_name:
        return sanitize_segment(str(api_name).lstrip("/"), fallback="endpoint")
    if fn_index is not None:
        return f"fn-{int(fn_index)}"
    return "endpoint"


async def record_run(
    app,
    *,
    request,
    inputs: Any,
    outputs: Any,
    api_name: str | None = None,
    fn_index: int | None = None,
    endpoint: str | None = None,
    started_at: str | None = None,
    bucket_id: str | None = None,
    app_id: str | None = None,
) -> HistoryRecord | None:
    """Persist one run. Returns the stored record, or None if nothing was written."""
    target = resolve_target(app, request, bucket_id=bucket_id, app_id=app_id)
    if target is None:
        return None

    record = HistoryRecord(
        record_id=new_record_id(),
        endpoint=endpoint or endpoint_key(api_name, fn_index),
        started_at=started_at or now_utc_iso(),
        inputs=None,
        outputs=None,
    )

    counter = [0]
    record.inputs, assets = await externalize_assets(inputs, counter)
    record.outputs, output_assets = await externalize_assets(outputs, counter)
    merged: dict[str, PendingAsset] = {**assets, **output_assets}

    limiter: anyio.CapacityLimiter = app.state.history_write_limiter
    async with limiter:
        await anyio.to_thread.run_sync(target.save, record, merged)
    return record


def schedule_record_run(app, **kwargs) -> None:
    """Record a run without making the caller wait for the Hub."""
    try:
        limiter = app.state.history_write_limiter
    except AttributeError:
        return
    if limiter.borrowed_tokens >= limiter.total_tokens:
        logger.debug("history: write pool saturated, dropping record")
        return

    async def _run() -> None:
        try:
            await record_run(app, **kwargs)
        except HistoryError as exc:
            logger.warning("history: could not record run: %s", exc)
        except Exception:
            logger.warning("history: could not record run", exc_info=True)

    try:
        task = asyncio.get_running_loop().create_task(_run())
    except RuntimeError:
        return
    tasks = getattr(app.state, "history_tasks", None)
    if tasks is None:
        return
    tasks.add(task)
    task.add_done_callback(tasks.discard)


async def offload(fn, *args):
    """Run a blocking Hub call off the event loop, surfacing its status."""
    try:
        return await anyio.to_thread.run_sync(fn, *args)
    except HistoryError as exc:
        raise fastapi.HTTPException(exc.status, str(exc)) from exc


def get_target(
    request: Request,
    bucket: Annotated[str | None, Query(min_length=3, max_length=200)] = None,
) -> AnyTarget:
    """Which history this request reads, resolved the way a write would be.

    Reading has to match writing or a run would be recorded somewhere it could
    never be read back from. A named bucket is addressed with the caller's own
    token, as before; otherwise the platform answers for whoever the assertion
    on this request says is calling, and needs no bucket at all.
    """
    app_id = app_id_of(request.app.get_blocks())
    token = resolve_token(request)
    if bucket and token:
        try:
            return HistoryTarget.build(bucket, token, app_id)
        except ValueError as exc:
            raise fastapi.HTTPException(422, "invalid bucket id") from exc
    ingest = resolve_ingest(request, app_id, bucket)
    if ingest is not None:
        return ingest
    if not token:
        raise fastapi.HTTPException(401, "sign in to use run history")
    raise fastapi.HTTPException(422, "bucket is required")


TargetDep = Annotated[AnyTarget, Depends(get_target)]


TokenDep = Annotated[str, Depends(require_token)]


RecordId = Annotated[str, Path(pattern=RECORD_ID_PATTERN)]


Segment = Annotated[str, Path(pattern=SEGMENT_PATTERN)]


class ConnectBody(BaseModel):
    bucket_id: str
