"""The one place run history is written.

Everything that ends up in a bucket goes through :func:`record_run`. Regular
Gradio apps reach it from :func:`gradio.route_utils.call_process_api`, which is
the single funnel every predict path already shares, so no app code has to know
history exists. ``gr.Workflow`` reaches the same function from a server
function, after reconstructing which of its generated API endpoints the canvas
run corresponds to.

Nothing here accepts a caller-supplied record: the values written are the ones
the server actually sent to and received from the function, and ``record_id``,
``owner_id`` and the timestamps are all server-issued.
"""

from __future__ import annotations

import asyncio
import hashlib
import logging
import os
import threading
from collections import OrderedDict
from typing import Any

import anyio
import anyio.to_thread

from gradio.history import (
    BucketRunHistoryStore,
    HistoryRecord,
    HistoryStoreError,
    PendingAsset,
    externalize_assets,
    new_record_id,
    now_utc_iso,
    sanitize_segment,
    store_for,
    validate_bucket_id,
)

logger = logging.getLogger(__name__)

BUCKET_HEADER = "x-gradio-history-bucket"
MAX_CONCURRENT_WRITES = 8


def init_history_state(app) -> None:
    """Attach the per-app state the recorder and the read routes share."""
    app.state.bucket_history_cache = OrderedDict()
    app.state.bucket_history_cache_lock = threading.Lock()
    app.state.history_write_limiter = anyio.CapacityLimiter(MAX_CONCURRENT_WRITES)
    app.state.history_tasks = set()


def stable_app_key(blocks) -> str:
    """A path segment identifying this app, stable across restarts.

    ``blocks.app_id`` cannot be used: it is ``random.getrandbits(64)``, minted
    per process, so every restart would file the same app's runs under a new key
    and orphan everything written before it. The browser-local history tolerates
    that because it is disposable; a durable bucket does not.
    """
    explicit = os.getenv("GRADIO_HISTORY_APP_KEY") or getattr(
        blocks, "history_app_key", None
    )
    if explicit:
        return sanitize_segment(explicit)
    space = os.getenv("SPACE_ID")
    if space:
        return sanitize_segment(f"space-{space}")
    # Locally there is no repo id, so fall back to something derived from what
    # the app actually is. Hashed so the key does not leak the author's paths.
    seed = getattr(blocks, "history_app_seed", None) or getattr(blocks, "title", None)
    if seed:
        digest = hashlib.sha256(str(seed).encode("utf-8")).hexdigest()[:16]
        return f"app-{digest}"
    return "app"


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
    """The gradio `App` serving *request*, for callers that only hold a request.

    Server functions receive a request but not the app, and the recorder needs
    the app for its write pool and store cache.
    """
    raw = _fastapi_request(request)
    return getattr(raw, "app", None) if raw is not None else None


def resolve_identity(request) -> tuple[str, str] | None:
    """``(owner_id, access_token)`` for the caller, or None when unavailable.

    The token is what matters: it is the Hub credential the write is made with,
    and the Hub decides what it may reach. ``owner_id`` is recorded alongside
    the run so a shared bucket can show who ran what, and nothing branches on
    it, so falling back to a display name when the subject is absent is fine.
    """
    from gradio import oauth

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
    """Which bucket this run belongs in.

    Resolved per request rather than held on the session. A session slot is a
    single mutable value shared by every tab on the origin, so two apps — or two
    tabs on one app — silently overwrite each other's binding and runs land in
    the wrong bucket; re-asserting it before each write only narrows the window.
    """
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


def resolve_store(
    app,
    request,
    *,
    bucket_id: str | None = None,
    app_key: str | None = None,
) -> BucketRunHistoryStore | None:
    """The store this caller may write to, or None if history is not available.

    Returns None rather than raising: for the automatic recording path, "no
    bucket configured" and "not signed in" are the normal case, not an error.
    """
    blocks = app.get_blocks()
    if not getattr(blocks, "run_history", True):
        return None
    resolved_bucket = resolve_bucket_id(blocks, request, bucket_id)
    if not resolved_bucket:
        return None
    identity = resolve_identity(request)
    if identity is None:
        return None
    owner_id, token = identity
    try:
        validate_bucket_id(resolved_bucket)
    except ValueError:
        logger.debug("history: ignoring invalid bucket id %r", resolved_bucket)
        return None
    try:
        return store_for(
            app.state.bucket_history_cache,
            app.state.bucket_history_cache_lock,
            token,
            resolved_bucket,
            owner_id=owner_id,
            app_key=app_key or stable_app_key(blocks),
        )
    except (ValueError, AttributeError):
        logger.debug("history: could not build store", exc_info=True)
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
    app_key: str | None = None,
) -> str | None:
    """Persist one run. Returns the record id, or None if nothing was written.

    This is the single write path for both regular Gradio apps and workflows.
    """
    store = resolve_store(app, request, bucket_id=bucket_id, app_key=app_key)
    if store is None:
        return None

    record = HistoryRecord(
        record_id=new_record_id(),
        owner_id=store.owner_id,
        app_key=store.app_key,
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

    # Capturing assets is async (remote media is fetched through gradio's
    # SSRF-protected client), so it happens here on the loop; only the blocking
    # Hub upload is offloaded.
    counter = [0]
    record.inputs, assets = await externalize_assets(inputs, counter)
    record.outputs, output_assets = await externalize_assets(outputs, counter)
    merged: dict[str, PendingAsset] = {**assets, **output_assets}

    limiter: anyio.CapacityLimiter = app.state.history_write_limiter
    async with limiter:
        await anyio.to_thread.run_sync(store.save_record, record, merged)
    return record.record_id


def schedule_record_run(app, **kwargs) -> None:
    """Record a run without making the caller wait for the Hub.

    History is a side effect of running the function, never the point of it, so
    a failure here must not surface as a failed prediction.
    """
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
        except HistoryStoreError as exc:
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
    # Hold a reference: a bare create_task can be garbage collected mid-flight.
    tasks.add(task)
    task.add_done_callback(tasks.discard)
