"""HTTP surface for durable run history (``/gradio_api/run-history/*``).

The bucket is chosen once via ``POST /connect`` and stored on the session;
every other route derives it from the session rather than trusting a
client-supplied bucket id.
"""

from __future__ import annotations

import threading
from collections import OrderedDict
from dataclasses import asdict
from typing import Annotated, Any

import anyio
import anyio.to_thread
import fastapi
from fastapi import APIRouter, Depends, Path, Query, Request, Response
from pydantic import BaseModel, Field

from gradio import oauth, route_utils
from gradio.history import (
    RECORD_ID_PATTERN,
    BucketRunHistoryStore,
    HistoryRecord,
    HistoryStoreError,
    HubError,
    NotAuthorizedError,
    NotFoundError,
    PublicBucketError,
    bucket_for_token,
    externalize_assets,
    now_utc_iso,
)

MAX_BODY_BYTES = 2 * 1024 * 1024
MAX_CONCURRENT_WRITES = 8


def init_history_state(app: fastapi.FastAPI) -> None:
    """Attach the per-app caches the history routes depend on."""
    app.state.bucket_history_cache = OrderedDict()
    app.state.bucket_history_cache_lock = threading.Lock()
    app.state.history_write_limiter = anyio.CapacityLimiter(MAX_CONCURRENT_WRITES)


def _http_from_store_error(exc: Exception) -> fastapi.HTTPException:
    if isinstance(exc, (NotAuthorizedError, PublicBucketError)):
        return fastapi.HTTPException(403, str(exc))
    if isinstance(exc, NotFoundError):
        return fastapi.HTTPException(404, str(exc))
    if isinstance(exc, HubError):
        return fastapi.HTTPException(502, str(exc))
    return fastapi.HTTPException(500, str(exc))


async def offload(fn, *args):
    """Run a blocking store call off the event loop, mapping store errors to HTTP."""
    try:
        return await anyio.to_thread.run_sync(fn, *args)
    except HistoryStoreError as exc:
        raise _http_from_store_error(exc) from exc


def _owner_and_app(request: Request) -> tuple[str, str]:
    try:
        info = oauth._get_valid_oauth_info_from_session(request.session)
    except Exception:
        info = None
    userinfo = (info or {}).get("userinfo") or {}
    owner_id = userinfo.get("sub") or userinfo.get("name")
    if not isinstance(owner_id, str) or not owner_id:
        raise fastapi.HTTPException(401, "oauth session missing subject identity")
    app_key = str(getattr(request.app.get_blocks(), "app_id", None) or "app")
    return owner_id, app_key


def _store_for(request: Request, token: str, bucket_id: str) -> BucketRunHistoryStore:
    owner_id, app_key = _owner_and_app(request)
    try:
        return bucket_for_token(
            request.app.state.bucket_history_cache,
            request.app.state.bucket_history_cache_lock,
            token,
            bucket_id,
            owner_id=owner_id,
            app_key=app_key,
        )
    except ValueError as exc:
        raise fastapi.HTTPException(422, "invalid bucket id") from exc


def get_store(
    request: Request,
    token: Annotated[str, Depends(oauth.require_oauth_token)],
) -> BucketRunHistoryStore:
    """Resolve the store for the bucket this session connected to."""
    bucket_id = (request.session.get("history") or {}).get("bucket_id")
    if not bucket_id:
        raise fastapi.HTTPException(409, "no bucket connected")
    return _store_for(request, token, bucket_id)


StoreDep = Annotated[BucketRunHistoryStore, Depends(get_store)]
TokenDep = Annotated[str, Depends(oauth.require_oauth_token)]
RecordId = Annotated[str, Path(pattern=RECORD_ID_PATTERN)]
AssetId = Annotated[str, Path(pattern=RECORD_ID_PATTERN)]


class ConnectBody(BaseModel):
    bucket_id: str


class RecordBody(BaseModel):
    record_id: str = Field(pattern=RECORD_ID_PATTERN)
    created_at: str | None = None
    subgraph: str | None = None
    inputs: dict[str, Any] = Field(default_factory=dict)
    outputs: dict[str, Any] = Field(default_factory=dict)


history_router = APIRouter(
    prefix="/run-history",
    tags=["run-history"],
    dependencies=[Depends(route_utils.enforce_body_limit(MAX_BODY_BYTES))],
)


@history_router.post("/connect")
async def connect(request: Request, body: ConnectBody, token: TokenDep):
    store = _store_for(request, token, body.bucket_id)
    await offload(store.ensure_private_bucket)
    request.session["history"] = {"bucket_id": body.bucket_id}
    return {"bucket_id": body.bucket_id}


@history_router.post("/disconnect")
async def disconnect(request: Request, token: TokenDep):  # noqa: ARG001
    request.session.pop("history", None)
    return {"ok": True}


@history_router.get("/buckets")
async def list_buckets(token: TokenDep):
    from huggingface_hub import HfApi

    def _list():
        return [
            {"id": b.id, "private": getattr(b, "private", True)}
            for b in HfApi(token=token).list_buckets(token=token)
        ]

    try:
        return {"buckets": await anyio.to_thread.run_sync(_list)}
    except Exception as exc:
        raise fastapi.HTTPException(502, "hub error") from exc


@history_router.get("/records")
async def list_records(
    store: StoreDep,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
):
    records = await offload(lambda: store.list_records(limit=limit))
    return {"records": [asdict(r) for r in records]}


@history_router.get("/records/{record_id}")
async def get_record(store: StoreDep, record_id: RecordId):
    return asdict(await offload(store.get_record, record_id))


@history_router.post("/records")
async def save_record(request: Request, store: StoreDep, body: RecordBody):
    record = HistoryRecord(
        record_id=body.record_id,
        owner_id=store.owner_id,
        app_key=store.app_key,
        created_at=body.created_at or now_utc_iso(),
        inputs=body.inputs,
        outputs=body.outputs,
        subgraph=body.subgraph,
    )
    # Replace trusted local files with `{"__asset__": id}` markers so the
    # record stays replayable after the temp dir (or the Space) is gone.
    counter = [0]
    assets = externalize_assets(record.inputs, counter)
    assets.update(externalize_assets(record.outputs, counter))

    limiter: anyio.CapacityLimiter = request.app.state.history_write_limiter
    if limiter.borrowed_tokens >= limiter.total_tokens:
        raise fastapi.HTTPException(429, "server busy", headers={"Retry-After": "2"})
    async with limiter:
        await offload(store.save_record, record, assets)
    return {"record_id": record.record_id, "assets": list(record.assets)}


@history_router.delete("/records/{record_id}")
async def delete_record(store: StoreDep, record_id: RecordId):
    await offload(store.delete_record, record_id)
    return {"ok": True}


@history_router.delete("/records")
async def clear_records(store: StoreDep):
    await offload(store.clear_records)
    return {"ok": True}


@history_router.get("/records/{record_id}/assets/{asset_id}")
async def get_asset(store: StoreDep, record_id: RecordId, asset_id: AssetId):
    data, content_type = await offload(store.get_asset_bytes, record_id, asset_id)
    return Response(content=data, media_type=content_type)
