"""Read surface for durable run history (``/gradio_api/run-history/*``).

These routes only ever *read* or *delete*. Records are written exclusively by
:func:`gradio.history_recorder.record_run` from the server's own view of a run,
so there is no route that accepts a record from a client.

The bucket is named per request rather than held on the session. A session slot
is one mutable value shared by every tab on an origin, so two apps — or two tabs
on one app — overwrite each other's binding and reads land in the wrong bucket.
Every route here takes ``?bucket=`` and authorizes it against the caller's own
OAuth token, which means a caller can only ever reach buckets they could reach
directly on the Hub.
"""

from __future__ import annotations

from dataclasses import asdict
from typing import Annotated

import anyio
import anyio.to_thread
import fastapi
from fastapi import APIRouter, Depends, Path, Query, Request, Response
from pydantic import BaseModel

from gradio import history_recorder, oauth, route_utils
from gradio.history import (
    MAX_RECORDS_PER_PAGE,
    RECORD_ID_PATTERN,
    SEGMENT_PATTERN,
    BucketRunHistoryStore,
    HistoryStoreError,
    HubError,
    NotAuthorizedError,
    NotFoundError,
    PublicBucketError,
    store_for,
    validate_bucket_id,
)

MAX_BODY_BYTES = 2 * 1024 * 1024
# Records can carry large JSON payloads (a dataframe, a long generation), and a
# record read is a plain download, so the read cap is separate from the small
# cap on request bodies.


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


def get_store(
    request: Request,
    token: Annotated[str, Depends(oauth.require_oauth_token)],
    bucket: Annotated[str, Query(min_length=3, max_length=200)],
) -> BucketRunHistoryStore:
    """The store for the bucket named on *this* request.

    Nothing is trusted about `bucket` beyond its shape: the store is built with
    the caller's own token, so authorization is whatever the Hub already grants
    that token.
    """
    blocks = request.app.get_blocks()
    if not getattr(blocks, "run_history", True):
        raise fastapi.HTTPException(404, "run history is disabled for this app")
    try:
        validate_bucket_id(bucket)
    except ValueError as exc:
        raise fastapi.HTTPException(422, "invalid bucket id") from exc
    try:
        return store_for(
            request.app.state.bucket_history_cache,
            request.app.state.bucket_history_cache_lock,
            token,
            bucket,
            app_id=history_recorder.app_id_of(blocks),
        )
    except ValueError as exc:
        raise fastapi.HTTPException(422, "invalid bucket id") from exc


StoreDep = Annotated[BucketRunHistoryStore, Depends(get_store)]
TokenDep = Annotated[str, Depends(oauth.require_oauth_token)]
RecordId = Annotated[str, Path(pattern=RECORD_ID_PATTERN)]
AssetId = Annotated[str, Path(pattern=RECORD_ID_PATTERN)]
EndpointSeg = Annotated[str, Path(pattern=SEGMENT_PATTERN)]


class ConnectBody(BaseModel):
    bucket_id: str


history_router = APIRouter(
    prefix="/run-history",
    tags=["run-history"],
    dependencies=[Depends(route_utils.enforce_body_limit(MAX_BODY_BYTES))],
)


@history_router.post("/connect")
async def connect(request: Request, body: ConnectBody, token: TokenDep):
    """Create the bucket if needed and confirm it is private and writable.

    Deliberately stateless: it stores nothing, and the answer is only about the
    bucket named in the body. Callers keep their own choice and name it on each
    subsequent request.
    """
    blocks = request.app.get_blocks()
    if not getattr(blocks, "run_history", True):
        raise fastapi.HTTPException(404, "run history is disabled for this app")
    try:
        validate_bucket_id(body.bucket_id)
    except ValueError as exc:
        raise fastapi.HTTPException(422, "invalid bucket id") from exc
    store = store_for(
        request.app.state.bucket_history_cache,
        request.app.state.bucket_history_cache_lock,
        token,
        body.bucket_id,
        app_id=history_recorder.app_id_of(blocks),
    )
    await offload(store.ensure_private_bucket)
    return {"bucket_id": body.bucket_id, "app_id": store.app_id}


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
    endpoint: Annotated[str | None, Query(pattern=SEGMENT_PATTERN)] = None,
    limit: Annotated[int, Query(ge=1, le=MAX_RECORDS_PER_PAGE)] = 50,
):
    records = await offload(lambda: store.list_records(endpoint, limit))
    return {
        "app_id": store.app_id,
        "endpoint": endpoint,
        "records": [asdict(r) for r in records],
    }


@history_router.delete("/records/{endpoint}/{record_id}")
async def delete_record(store: StoreDep, endpoint: EndpointSeg, record_id: RecordId):
    await offload(store.delete_record, endpoint, record_id)
    return {"ok": True}


@history_router.get("/records/{endpoint}/{record_id}/assets/{asset_id}")
async def get_asset(
    store: StoreDep, endpoint: EndpointSeg, record_id: RecordId, asset_id: AssetId
):
    data, guessed = await offload(store.get_asset_bytes, endpoint, record_id, asset_id)
    # Same rule as gradio's own file route: only mimetypes that cannot be turned
    # into script are served inline, so a stored .html/.svg cannot render on this
    # app's origin.
    if guessed in route_utils.XSS_SAFE_MIMETYPES:
        content_type, disposition = guessed, "inline"
    else:
        content_type, disposition = "application/octet-stream", "attachment"
    return Response(
        content=data,
        media_type=content_type,
        headers={
            "Content-Disposition": disposition,
            # Assets are immutable: the record id is unique per run and an asset
            # is never rewritten in place. Without this every thumbnail in the
            # panel re-downloads from the Hub on each render.
            "Cache-Control": "private, max-age=31536000, immutable",
        },
    )
