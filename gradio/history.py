"""Durable run history in a private HF Hub bucket.

The layout mirrors the app → endpoint → runs structure of the browser-local run
history (``client/js/src/utils/run_history.ts``), so the two are alternative
backends for the same thing rather than two different models::

    runs/<app_id>/<endpoint>/<record_id>.json
    assets/<app_id>/<endpoint>/<record_id>/<asset_id>.<ext>

``app_id`` is ``blocks.app_id``, which is minted per process — so a new commit
(which restarts the Space) or a local restart starts a new folder. That is
deliberate: an app's endpoints and, for a workflow, its whole graph can change
between deploys, at which point older runs no longer describe anything you can
replay. They stay in the bucket; they just stop being this app's history. It is
also the key the browser-local history already uses, so the two backends
partition runs the same way.

A bucket holds one shared history: everyone who can write to it sees the same
runs. That is the point of pointing a team at an org bucket, and it means the
Hub's own access control is the only permission model here — there is no
finer-grained owner boundary inside a bucket to enforce or to get wrong. Each
record still carries the `owner_id` of whoever ran it, as metadata to display,
never as a filter.

Two properties fall out of putting the app and endpoint in the *path* rather
than in a field that has to be filtered on after the fact:

* Listing an endpoint is a prefix listing bounded by ``limit``, not a scan of
  every record in the bucket.
* ``record_id`` is millisecond-prefixed and therefore lexically sortable, so
  "newest first" is a sort of the returned *paths* — no per-record download and
  no dependence on Hub-reported mtimes.

Records are written by :func:`record_run`, which is the only way history is
produced: the server records what it actually executed. Nothing accepts a
client-supplied record.
"""

from __future__ import annotations

import json
import logging
import mimetypes
import os
import re
import secrets
import threading
import time
from collections import OrderedDict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any
from urllib.parse import unquote, urlparse

import gradio_client.utils as client_utils
from huggingface_hub import HfApi
from huggingface_hub import get_token as hf_get_token

from gradio.utils import get_upload_folder, is_in_or_equal

logger = logging.getLogger(__name__)


SCHEMA_VERSION = 2

_LIST_CACHE_TTL = 10.0
_RECORD_CACHE_MAX = 256
# Hard ceiling on paths pulled from one prefix listing. Records sort lexically
# by id, so the newest `limit` are the last `limit` paths — this only bounds how
# much of the (already paginated) listing we walk.
_MAX_LIST_PATHS = 5000
MAX_RECORDS_PER_PAGE = 200

# A remote asset is downloaded through the server before it is stored, so both
# caps are on bytes this process will hold.
MAX_REMOTE_ASSET_BYTES = 64 * 1024 * 1024

BUCKET_ID_RE = re.compile(r"^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-][a-zA-Z0-9_./-]*$")
RECORD_ID_PATTERN = r"^[A-Za-z0-9_-]{1,64}$"
_RECORD_ID_RE = re.compile(RECORD_ID_PATTERN)
SEGMENT_PATTERN = r"^[A-Za-z0-9_.-]{1,80}$"
_SEGMENT_RE = re.compile(SEGMENT_PATTERN)


class HistoryStoreError(Exception):
    pass


class NotAuthorizedError(HistoryStoreError):
    pass


class NotFoundError(HistoryStoreError):
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


def validate_segment(segment: str) -> None:
    """App and endpoint keys become path segments, so they are constrained the
    same way record ids are."""
    if not _SEGMENT_RE.fullmatch(segment or "") or segment in {".", ".."}:
        raise ValueError("invalid path segment")


def sanitize_segment(value: Any, fallback: str = "app") -> str:
    """Coerce arbitrary text into a safe, stable path segment."""
    slug = re.sub(r"[^A-Za-z0-9_.-]+", "-", str(value or "")).strip("-.")
    slug = slug[:80].strip("-.")
    return slug or fallback


class _IdClock:
    """Monotonic (millisecond, sequence) source for record ids."""

    def __init__(self) -> None:
        self.lock = threading.Lock()
        self.last_ms = 0
        self.seq = 0

    def next(self) -> tuple[int, int]:
        with self.lock:
            ms = max(int(time.time() * 1000), self.last_ms)
            if ms == self.last_ms:
                self.seq += 1
            else:
                self.last_ms, self.seq = ms, 0
            return ms, self.seq & 0xFFFF


_id_clock = _IdClock()


def new_record_id() -> str:
    """Millisecond-prefixed, so ids sort lexically in creation order.

    Listing "newest first" is then a sort of the paths a prefix listing already
    returns, instead of downloading every record to read a timestamp out of it.

    The sequence counter matters for more than tidiness: without it, records
    minted inside the same millisecond order by their random suffix, so two
    successive listings can disagree about which is newer and a paged read can
    show one record twice and another not at all. The clock is also clamped
    forward, so an NTP step backwards cannot bury new records below old ones.
    """
    ms, seq = _id_clock.next()
    return f"{ms:013d}{seq:04x}{secrets.token_hex(4)}"


def now_utc_iso() -> str:
    """Millisecond precision, matching the browser's `Date.toISOString()`."""
    now = datetime.now(timezone.utc)
    return f"{now:%Y-%m-%dT%H:%M:%S}.{now.microsecond // 1000:03d}Z"


@dataclass
class HistoryRecord:
    """One run of one endpoint.

    Mirrors `StoredRun` in the browser-local history so a UI can render either
    backend from the same shape.
    """

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
            # Written by a newer gradio. Guessing at the shape would surface
            # wrong data as if it were right.
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
    """Resolve a FileData-ish node to a trusted local path, or None.

    Handles raw ``path`` fields as well as file URLs, which the workflow
    executor emits absolute (``http://host/gradio_api/file=/tmp/...``) rather
    than root-relative.
    """
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
    """A FileData-ish node whose payload lives on some *other* origin.

    Workflow nodes routinely emit these: an output produced by a remote Space
    is an ``https://<space>.hf.space/gradio_api/file=/tmp/...`` URL backed by
    that Space's temp dir, which is gone within the hour. Storing the URL
    verbatim produces a record that looks saved and renders a broken image
    later, so these are fetched and stored like any other asset.
    """
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
    """Download a remote asset, or None if it cannot be stored safely.

    Asset URLs come out of app output, which on a workflow canvas is wired up by
    whoever edited the graph, so fetching them server-side needs the same
    protection as any other user-supplied URL gradio fetches. That is exactly
    what `processing_utils.async_ssrf_protected_get` already provides — public
    hostname allow-list, IP-pinned transport, and each redirect re-validated —
    so this reuses it rather than re-deriving a weaker version of it.

    Never raises: a failed fetch degrades to leaving the original URL in the
    record, which is strictly better than losing the whole run.
    """
    if os.getenv("GRADIO_HISTORY_FETCH_REMOTE_ASSETS", "1").lower() in (
        "0",
        "false",
        "off",
    ):
        return None
    try:
        from gradio import processing_utils

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
    """An asset to store alongside a record: either a local file to upload or
    bytes already in hand."""

    content_type: str
    local_path: str | None = None
    data: bytes | None = None
    suggested_name: str = ""


class BucketRunHistoryStore:
    """Reads and writes one app's history inside one bucket.

    ``app_id`` is fixed at construction and becomes a path segment, so this
    object is confined to ``runs/<app_id>/``. It knows where to read and write
    and which credential to use — nothing about who is asking. Who ran a run is
    a property of the record, not of the storage.
    """

    def __init__(
        self,
        repo_id: str,
        *,
        app_id: str,
        token: str | None = None,
    ) -> None:
        validate_bucket_id(repo_id)
        validate_segment(app_id)
        self.repo_id = repo_id
        self.app_id = app_id
        self._token = token or hf_get_token()
        self._api = HfApi(token=self._token)
        self._ensure_lock = threading.Lock()
        self._ensured = False
        self._cache_lock = threading.Lock()
        # prefix -> (paths, fetched_at)
        self._path_cache: dict[str, tuple[list[str], float]] = {}
        self._record_cache: OrderedDict[str, HistoryRecord] = OrderedDict()

    # -- paths --------------------------------------------------------------

    @property
    def app_prefix(self) -> str:
        return f"runs/{self.app_id}/"

    def endpoint_prefix(self, endpoint: str) -> str:
        validate_segment(endpoint)
        return f"{self.app_prefix}{endpoint}/"

    def record_path(self, endpoint: str, record_id: str) -> str:
        validate_record_id(record_id)
        return f"{self.endpoint_prefix(endpoint)}{record_id}.json"

    def asset_prefix(self, endpoint: str, record_id: str) -> str:
        validate_record_id(record_id)
        validate_segment(endpoint)
        return f"assets/{self.app_id}/{endpoint}/{record_id}/"

    # -- bucket lifecycle ---------------------------------------------------

    def ensure_private_bucket(self) -> None:
        with self._ensure_lock:
            if self._ensured:
                return
            try:
                self._api.create_bucket(self.repo_id, private=True, exist_ok=True)
            except Exception as e:
                status = getattr(getattr(e, "response", None), "status_code", None)
                if status == 403:
                    raise NotAuthorizedError(
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

    # -- writes -------------------------------------------------------------

    def save_record(
        self,
        record: HistoryRecord,
        assets: dict[str, PendingAsset] | None = None,
    ) -> None:
        """Write *record*, uploading its assets first.

        The JSON is the commit marker: it lands only after every asset upload
        has succeeded, so a record is never visible while referencing an asset
        that does not exist.
        """
        validate_record_id(record.record_id)
        validate_segment(record.endpoint)
        self.ensure_private_bucket()

        adds: list[tuple[Any, str]] = []
        if assets:
            prefix = self.asset_prefix(record.endpoint, record.record_id)
            for asset_id, pending in assets.items():
                validate_record_id(asset_id)
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
                self._api.batch_bucket_files(bucket_id=self.repo_id, add=adds)
            self._api.batch_bucket_files(
                bucket_id=self.repo_id,
                add=[
                    (
                        record.to_json_bytes(),
                        self.record_path(record.endpoint, record.record_id),
                    )
                ],
            )
        except Exception as e:
            # The JSON never landed, so the uploaded assets are unreferenced.
            # Nothing else will ever find them, so clean up here rather than
            # leaving blobs that accumulate invisibly.
            if adds:
                self._try_delete([p for _, p in adds])
            raise HubError(f"save_record failed: {e}") from e

        self._invalidate()

    def delete_record(self, endpoint: str, record_id: str) -> None:
        path = self.record_path(endpoint, record_id)
        asset_paths = [
            it.path
            for it in self._safe_list_tree(
                prefix=self.asset_prefix(endpoint, record_id)
            )
            if self._is_file(it)
        ]
        try:
            self._api.batch_bucket_files(
                bucket_id=self.repo_id, delete=[path] + asset_paths
            )
        except Exception as e:
            raise HubError(f"delete_record failed: {e}") from e
        self._invalidate()

    # -- reads --------------------------------------------------------------

    def list_records(
        self, endpoint: str | None = None, limit: int = 50
    ) -> list[HistoryRecord]:
        """The newest *limit* records, for one endpoint or across the app.

        Only *limit* record files are downloaded: ids are time-ordered, so the
        newest are the tail of the sorted path listing.
        """
        limit = max(1, min(int(limit), MAX_RECORDS_PER_PAGE))
        prefix = self.app_prefix if endpoint is None else self.endpoint_prefix(endpoint)
        paths = [p for p in self._list_paths(prefix) if p.endswith(".json")]
        # Sort on the record id (the basename), not the full path, so ordering
        # is chronological across endpoints rather than grouped by endpoint.
        paths.sort(key=lambda p: p.rsplit("/", 1)[-1], reverse=True)
        selected = paths[:limit]
        if not selected:
            return []
        records: list[HistoryRecord] = []
        for path, blob in self._download_many(selected):
            try:
                record = HistoryRecord.from_json_bytes(blob)
            except Exception:
                logger.debug("history: skipping unreadable record %s", path)
                continue
            records.append(record)
        records.sort(key=lambda r: r.record_id, reverse=True)
        return records

    def get_record(self, endpoint: str, record_id: str) -> HistoryRecord:
        path = self.record_path(endpoint, record_id)
        with self._cache_lock:
            cached = self._record_cache.get(path)
        if cached is not None:
            return cached
        try:
            data = self._download_bytes(path)
        except NotFoundError:
            raise
        except Exception as e:
            raise HubError(f"get_record failed: {e}") from e
        record = HistoryRecord.from_json_bytes(data)
        with self._cache_lock:
            self._record_cache[path] = record
            self._record_cache.move_to_end(path)
            if len(self._record_cache) > _RECORD_CACHE_MAX:
                self._record_cache.popitem(last=False)
        return record

    def get_asset_bytes(
        self, endpoint: str, record_id: str, asset_id: str
    ) -> tuple[bytes, str]:
        validate_record_id(asset_id)
        record = self.get_record(endpoint, record_id)
        path = record.assets.get(asset_id)
        if not path:
            raise NotFoundError(f"asset {asset_id} not found for record {record_id}")
        # The record is this owner's, but its stored path is still checked
        # against the prefix this store may address, so a record hand-edited on
        # the Hub cannot redirect a download elsewhere in the bucket.
        if not path.startswith(self.asset_prefix(endpoint, record_id)):
            raise NotFoundError(f"asset {asset_id} not addressable")
        ct = mimetypes.guess_type(path)[0] or "application/octet-stream"
        try:
            return self._download_bytes(path), ct
        except Exception as e:
            raise HubError(f"asset download failed: {e}") from e

    # -- internals ----------------------------------------------------------

    def _invalidate(self) -> None:
        with self._cache_lock:
            self._path_cache.clear()
            self._record_cache.clear()

    def _list_paths(self, prefix: str) -> list[str]:
        now = time.monotonic()
        with self._cache_lock:
            hit = self._path_cache.get(prefix)
            if hit is not None and (now - hit[1]) < _LIST_CACHE_TTL:
                return list(hit[0])
        paths: list[str] = []
        for it in self._safe_list_tree(prefix=prefix):
            if self._is_file(it):
                paths.append(it.path)
                if len(paths) >= _MAX_LIST_PATHS:
                    logger.warning(
                        "history: listing for %s hit the %d path cap",
                        prefix,
                        _MAX_LIST_PATHS,
                    )
                    break
        with self._cache_lock:
            self._path_cache[prefix] = (list(paths), time.monotonic())
        return paths

    def _safe_list_tree(self, prefix: str, *, recursive: bool = True):
        """List bucket entries under *prefix*.

        ``list_bucket_tree`` defaults to ``recursive=False``, which returns only
        the entries directly under the prefix — for a directory prefix that is a
        list of ``BucketFolder``s and never the files inside them.
        """
        try:
            yield from self._api.list_bucket_tree(
                self.repo_id, prefix=prefix, recursive=recursive
            )
        except Exception:
            return

    @staticmethod
    def _is_file(item) -> bool:
        return getattr(item, "type", "file") != "directory" and bool(
            getattr(item, "path", "")
        )

    def _try_delete(self, paths: list[str]) -> None:
        try:
            self._api.batch_bucket_files(bucket_id=self.repo_id, delete=paths)
        except Exception:
            logger.debug("history: cleanup delete failed", exc_info=True)

    def _download_many(self, paths: list[str]) -> list[tuple[str, bytes]]:
        import tempfile

        out: list[tuple[str, bytes]] = []
        with tempfile.TemporaryDirectory() as tmp:
            pairs = [(p, os.path.join(tmp, f"{i}.json")) for i, p in enumerate(paths)]
            try:
                self._api.download_bucket_files(
                    bucket_id=self.repo_id, files=pairs, token=self._token
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
                    raise NotFoundError(path_in_repo) from e
                raise
            if not os.path.exists(local):
                raise NotFoundError(path_in_repo)
            with open(local, "rb") as fh:
                return fh.read()


def store_for(
    cache: OrderedDict,
    lock: threading.Lock,
    token: str,
    bucket_id: str,
    *,
    app_id: str,
    max_entries: int = 256,
) -> BucketRunHistoryStore:
    validate_bucket_id(bucket_id)
    validate_segment(app_id)
    key = (token, bucket_id, app_id)
    with lock:
        store = cache.get(key)
        if store is not None:
            cache.move_to_end(key)
            return store
        store = BucketRunHistoryStore(bucket_id, token=token, app_id=app_id)
        cache[key] = store
        if len(cache) > max_entries:
            cache.popitem(last=False)
        return store


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
    """Everything gradio already recognises as a file, plus url-only nodes.

    `client_utils.is_file_obj` requires a local `path`, which a workflow canvas
    value produced by a remote Space does not have — it is `{"url": ..., ...}`
    on that Space's origin. Those are exactly the nodes worth capturing, so the
    gradio predicate is extended rather than replaced.
    """
    if client_utils.is_file_obj(node):
        return True
    return isinstance(node, dict) and isinstance(node.get("url"), str)


async def externalize_assets(
    tree: Any,
    counter: list[int] | None = None,
    *,
    fetch_remote: bool = True,
) -> tuple[Any, dict[str, PendingAsset]]:
    """Replace file nodes in *tree* with ``{"__asset__": <id>}`` markers.

    Returns the rewritten tree and the assets to store with it. Both local files
    (uploaded from disk) and remote URLs (downloaded first) are captured,
    because a record that points at either a temp dir or another host's temp dir
    stops resolving well before the user stops wanting it.

    A remote fetch that fails leaves the node exactly as it was: a record with a
    URL that may expire beats no record at all.
    """
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
