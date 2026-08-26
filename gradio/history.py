"""Durable run history in a private HF Hub bucket."""

from __future__ import annotations

import asyncio
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
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Annotated, Any, NamedTuple
from urllib.parse import unquote, urlparse

import anyio
import anyio.to_thread
import fastapi
import gradio_client.utils as client_utils
from fastapi import Depends, Path, Query, Request
from huggingface_hub import HfApi
from huggingface_hub import get_token as hf_get_token
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
_RECORD_ID_RE = re.compile(RECORD_ID_PATTERN)
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
    owner_id: str
    app_id: str
    endpoint: str
    inputs: Any = None
    outputs: Any = None
    api_name: str | None = None
    fn_index: int | None = None
    page: str = ""
    label: str | None = None
    status: str = "completed"
    error: str | None = None
    started_at: str = ""
    completed_at: str | None = None
    duration_ms: float | None = None
    queued_ms: float | None = None
    streamed: bool = False
    assets: dict[str, str] = field(default_factory=dict)
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
    if os.getenv("GRADIO_HISTORY_FETCH_REMOTE_ASSETS", "1").lower() in (
        "0",
        "false",
        "off",
    ):
        return None
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

    content_type: str
    local_path: str | None = None
    data: bytes | None = None
    suggested_name: str = ""


class HistoryTarget(NamedTuple):
    """Where history goes: which bucket, whose credential, which app."""

    bucket: str
    token: str
    app_id: str

    @classmethod
    def build(cls, bucket: str, token: str | None, app_id: str) -> HistoryTarget:
        validate_bucket_id(bucket)
        validate_segment(app_id)
        return cls(bucket, token or hf_get_token() or "", app_id)


def _api(target: HistoryTarget) -> HfApi:
    return HfApi(token=target.token)


def app_prefix(app_id: str) -> str:
    return f"runs/{app_id}/"


def endpoint_prefix(app_id: str, endpoint: str) -> str:
    validate_segment(endpoint)
    return f"{app_prefix(app_id)}{endpoint}/"


def record_path(app_id: str, endpoint: str, record_id: str) -> str:
    validate_segment(record_id)
    return f"{endpoint_prefix(app_id, endpoint)}{record_id}.json"


def asset_prefix(app_id: str, endpoint: str, record_id: str) -> str:
    validate_segment(record_id)
    validate_segment(endpoint)
    return f"assets/{app_id}/{endpoint}/{record_id}/"


_ensured: set[tuple[str, str]] = set()
_ensure_lock = threading.Lock()


def ensure_private_bucket(target: HistoryTarget) -> None:
    key = (target.token, target.bucket)
    with _ensure_lock:
        if key in _ensured:
            return
        api = _api(target)
        try:
            api.create_bucket(target.bucket, private=True, exist_ok=True)
        except Exception as e:
            status = getattr(getattr(e, "response", None), "status_code", None)
            if status == 403:
                raise HistoryError(
                    f"missing manage-repos scope for {target.bucket}", 403
                ) from e
            raise HistoryError(f"bucket create failed: {e}", 502) from e
        try:
            info = api.bucket_info(target.bucket)
            if getattr(info, "private", True) is False:
                raise HistoryError(
                    f"bucket {target.bucket} is public; refusing to store history", 403
                )
        except HistoryError:
            raise
        except Exception as e:
            raise HistoryError(f"bucket privacy check failed: {e}", 502) from e
        _ensured.add(key)


def save_record(
    target: HistoryTarget,
    record: HistoryRecord,
    assets: dict[str, PendingAsset] | None = None,
) -> None:
    """Write *record*, uploading its assets first. The JSON is the commit marker."""
    validate_segment(record.record_id)
    validate_segment(record.endpoint)
    ensure_private_bucket(target)
    api = _api(target)

    adds: list[tuple[Any, str]] = []
    if assets:
        prefix = asset_prefix(target.app_id, record.endpoint, record.record_id)
        for asset_id, pending in assets.items():
            validate_segment(asset_id)
            ext = _ext_from(
                pending.local_path or pending.suggested_name, pending.content_type
            )
            path_in_repo = f"{prefix}{asset_id}{ext}"
            if pending.data is not None:
                adds.append((pending.data, path_in_repo))
            elif is_trusted_local_path(pending.local_path or ""):
                adds.append((pending.local_path, path_in_repo))
            else:
                logger.warning(
                    "history: skipping asset %s — untrusted path %r",
                    asset_id,
                    pending.local_path,
                )
                continue
            record.assets[asset_id] = path_in_repo

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
            _try_delete(target, [p for _, p in adds])
        raise HistoryError(f"save_record failed: {e}", 502) from e


def list_records(
    target: HistoryTarget, endpoint: str | None = None, limit: int = 50
) -> list[HistoryRecord]:
    """The newest *limit* records, for one endpoint or across the app."""
    limit = max(1, min(int(limit), MAX_RECORDS_PER_PAGE))
    prefix = (
        app_prefix(target.app_id)
        if endpoint is None
        else endpoint_prefix(target.app_id, endpoint)
    )
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
    return records


def get_record(target: HistoryTarget, endpoint: str, record_id: str) -> HistoryRecord:
    try:
        data = _download_bytes(target, record_path(target.app_id, endpoint, record_id))
    except HistoryError:
        raise
    except Exception as e:
        raise HistoryError(f"get_record failed: {e}", 502) from e
    return HistoryRecord.from_json_bytes(data)


def get_asset_bytes(
    target: HistoryTarget, endpoint: str, record_id: str, asset_id: str
) -> tuple[bytes, str]:
    validate_segment(asset_id)
    record = get_record(target, endpoint, record_id)
    path = record.assets.get(asset_id)
    if not path:
        raise HistoryError(f"asset {asset_id} not found", 404)
    if not path.startswith(asset_prefix(target.app_id, endpoint, record_id)):
        raise HistoryError(f"asset {asset_id} not addressable", 404)
    ct = mimetypes.guess_type(path)[0] or "application/octet-stream"
    try:
        return _download_bytes(target, path), ct
    except Exception as e:
        raise HistoryError(f"asset download failed: {e}", 502) from e


def _safe_list_tree(target: HistoryTarget, prefix: str, *, recursive: bool = True):
    """List files under *prefix*, recursively by default."""
    try:
        yield from _api(target).list_bucket_tree(
            target.bucket, prefix=prefix, recursive=recursive
        )
    except Exception:
        return


def _is_file(item) -> bool:
    return getattr(item, "type", "file") != "directory" and bool(
        getattr(item, "path", "")
    )


def _list_paths(target: HistoryTarget, prefix: str) -> list[str]:
    paths: list[str] = []
    for it in _safe_list_tree(target, prefix):
        if _is_file(it):
            paths.append(it.path)
            if len(paths) >= _MAX_LIST_PATHS:
                logger.warning(
                    "history: listing for %s hit the %d path cap",
                    prefix,
                    _MAX_LIST_PATHS,
                )
                break
    return paths


def _try_delete(target: HistoryTarget, paths: list[str]) -> None:
    try:
        _api(target).batch_bucket_files(bucket_id=target.bucket, delete=paths)
    except Exception:
        logger.debug("history: cleanup delete failed", exc_info=True)


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
    *,
    fetch_remote: bool = True,
) -> tuple[Any, dict[str, PendingAsset]]:
    """Replace file nodes with ``{"__asset__": id}`` markers, capturing their bytes."""
    if counter is None:
        counter = [0]
    assets: dict[str, PendingAsset] = {}

    def _next_id() -> str:
        counter[0] += 1
        return f"a{counter[0]:03d}"

    async def _capture(node: Any) -> Any:
        local = extract_local_file_path(node)
        if local is not None:
            asset_id = _next_id()
            assets[asset_id] = PendingAsset(
                content_type=_content_type_of(node, local),
                local_path=local,
            )
            return {"__asset__": asset_id}
        if fetch_remote:
            remote = extract_remote_url(node)
            if remote is not None:
                fetched = await fetch_remote_asset(remote)
                if fetched is not None:
                    data, content_type = fetched
                    asset_id = _next_id()
                    assets[asset_id] = PendingAsset(
                        content_type=_content_type_of(node, remote) or content_type,
                        data=data,
                        suggested_name=urlparse(remote).path.rsplit("/", 1)[-1],
                    )
                    return {"__asset__": asset_id}
        return node

    rewritten = await client_utils.async_traverse(tree, _capture, _is_asset_node)
    return rewritten, assets


def _content_type_of(node, path_or_url: str) -> str:
    if isinstance(node, dict):
        m = node.get("mime_type") or node.get("mime")
        if isinstance(m, str) and m:
            return m
    return mimetypes.guess_type(path_or_url)[0] or "application/octet-stream"


BUCKET_HEADER = "x-gradio-history-bucket"
MAX_CONCURRENT_WRITES = 8


def init_history_state(app) -> None:
    """Attach the per-app state the recorder and the read routes share."""
    app.state.bucket_history_cache = OrderedDict()
    app.state.bucket_history_cache_lock = threading.Lock()
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


def resolve_identity(request) -> tuple[str, str] | None:
    """``(owner_id, access_token)`` for the caller, or None."""
    raw = _fastapi_request(request)
    if raw is None:
        return None
    try:
        session = raw.session
    except Exception:
        return None
    try:
        info = oauth._get_valid_oauth_info_from_session(session)
    except Exception:
        info = None
    if not info:
        return None
    token = info.get("access_token")
    if not isinstance(token, str) or not token:
        return None
    userinfo = info.get("userinfo") or {}
    owner_id = userinfo.get("sub") or userinfo.get("preferred_username") or ""
    return (owner_id if isinstance(owner_id, str) else ""), token


def resolve_bucket_id(blocks, request, explicit: str | None = None) -> str | None:
    """Which bucket this run belongs in, resolved per request."""
    if explicit:
        return explicit
    raw = _fastapi_request(request)
    if raw is not None:
        try:
            header = raw.headers.get(BUCKET_HEADER)
        except Exception:
            header = None
        if header:
            return header.strip()
    configured = os.getenv("GRADIO_HISTORY_BUCKET") or getattr(
        blocks, "history_bucket", None
    )
    return configured or None


def resolve_target(
    app,
    request,
    *,
    bucket_id: str | None = None,
    app_id: str | None = None,
) -> tuple[HistoryTarget, str] | None:
    """``(target, owner_id)`` for this caller, or None if history is off."""
    blocks = app.get_blocks()
    if not getattr(blocks, "run_history", True):
        return None
    bucket = resolve_bucket_id(blocks, request, bucket_id)
    if not bucket:
        return None
    identity = resolve_identity(request)
    if identity is None:
        return None
    owner_id, token = identity
    try:
        return HistoryTarget.build(bucket, token, app_id or app_id_of(blocks)), owner_id
    except ValueError:
        logger.debug("history: ignoring invalid bucket id %r", bucket)
        return None


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
    page: str = "",
    label: str | None = None,
    status: str = "completed",
    error: str | None = None,
    started_at: str | None = None,
    duration_ms: float | None = None,
    queued_ms: float | None = None,
    streamed: bool = False,
    bucket_id: str | None = None,
    app_id: str | None = None,
) -> str | None:
    """Persist one run. Returns the record id, or None if nothing was written."""
    resolved = resolve_target(app, request, bucket_id=bucket_id, app_id=app_id)
    if resolved is None:
        return None
    target, owner_id = resolved

    record = HistoryRecord(
        record_id=new_record_id(),
        owner_id=owner_id,
        app_id=target.app_id,
        endpoint=endpoint or endpoint_key(api_name, fn_index),
        api_name=api_name,
        fn_index=fn_index,
        page=page or "",
        label=label,
        status=status,
        error=error,
        started_at=started_at or now_utc_iso(),
        completed_at=now_utc_iso(),
        duration_ms=duration_ms,
        queued_ms=queued_ms,
        streamed=streamed,
        inputs=None,
        outputs=None,
    )

    counter = [0]
    record.inputs, assets = await externalize_assets(inputs, counter)
    record.outputs, output_assets = await externalize_assets(outputs, counter)
    merged: dict[str, PendingAsset] = {**assets, **output_assets}

    limiter: anyio.CapacityLimiter = app.state.history_write_limiter
    async with limiter:
        await anyio.to_thread.run_sync(save_record, target, record, merged)
    return record.record_id


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
    token: Annotated[str, Depends(oauth.require_oauth_token)],
    bucket: Annotated[str, Query(min_length=3, max_length=200)],
) -> HistoryTarget:
    """The bucket named on this request, addressed with the caller's token."""
    blocks = request.app.get_blocks()
    if not getattr(blocks, "run_history", True):
        raise fastapi.HTTPException(404, "run history is disabled for this app")
    try:
        return HistoryTarget.build(bucket, token, app_id_of(blocks))
    except ValueError as exc:
        raise fastapi.HTTPException(422, "invalid bucket id") from exc


TargetDep = Annotated[HistoryTarget, Depends(get_target)]


TokenDep = Annotated[str, Depends(oauth.require_oauth_token)]


RecordId = Annotated[str, Path(pattern=RECORD_ID_PATTERN)]


AssetId = Annotated[str, Path(pattern=RECORD_ID_PATTERN)]


EndpointSeg = Annotated[str, Path(pattern=SEGMENT_PATTERN)]


class ConnectBody(BaseModel):
    bucket_id: str
