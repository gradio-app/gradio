"""gr.Workflow — high-level API for building and launching AI pipelines."""

from __future__ import annotations

import inspect
import json
import logging
import os
import re
import secrets
import sys
import tempfile
import threading
import types
import urllib.parse
import warnings
import webbrowser
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from typing import TYPE_CHECKING, Optional, TypedDict, Union, get_type_hints

import anyio
import httpx
from huggingface_hub import HfApi
from huggingface_hub import get_token as hf_get_token

import gradio as gr
from gradio.blocks import Blocks
from gradio.components.workflowcanvas import WorkflowCanvas
from gradio.context import Context
from gradio.helpers import special_args as _special_args
from gradio.oauth import OAuthProfile, OAuthToken
from gradio.route_utils import Request
from gradio.utils import get_space

if TYPE_CHECKING:
    from gradio.workflow_api import WorkflowEndpointManager

_HF_CLIENT = httpx.Client(
    base_url="https://huggingface.co",
    timeout=15,
    headers={"User-Agent": "gradio-workflow"},
    limits=httpx.Limits(max_keepalive_connections=8, max_connections=16),
)
_SEARCH_POOL = ThreadPoolExecutor(max_workers=4, thread_name_prefix="hf-search")

_CURATED_DATASET_REPO = "gradio/workflow-curated"
_CURATED_DATASET_FILE = "curated.json"
_CURATED_TTL_SECONDS = 3600.0

_INJECTED_TYPES = frozenset({OAuthToken, OAuthProfile, Request})


def _is_injected_param(hint: object) -> bool:
    if hint in _INJECTED_TYPES:
        return True
    if getattr(hint, "__origin__", None) is Union:
        args = hint.__args__  # type: ignore[union-attr]
        non_none = [a for a in args if a is not type(None)]
        return len(non_none) == 1 and non_none[0] in _INJECTED_TYPES
    if isinstance(hint, types.UnionType):
        non_none = [a for a in hint.__args__ if a is not type(None)]
        return len(non_none) == 1 and non_none[0] in _INJECTED_TYPES
    return False


class _CuratedCache(TypedDict):
    fetched_at: float
    items: Optional[list[dict]]


_CURATED_CACHE: _CuratedCache = {"fetched_at": 0.0, "items": None}
_CURATED_LOCK = threading.Lock()


def _bundled_snapshot_path() -> str:
    return os.path.join(os.path.dirname(__file__), "_workflow_curated_snapshot.json")


def _load_bundled_snapshot() -> list[dict]:
    try:
        with open(_bundled_snapshot_path(), encoding="utf-8") as f:
            payload = json.load(f)
        items = payload.get("items") if isinstance(payload, dict) else payload
        return items if isinstance(items, list) else []
    except Exception as e:
        logger.warning("workflow curated snapshot unreadable: %s", e)
        return []


def _fetch_curated_from_hub() -> Optional[list[dict]]:
    try:
        from huggingface_hub import hf_hub_download

        local = hf_hub_download(
            repo_id=_CURATED_DATASET_REPO,
            filename=_CURATED_DATASET_FILE,
            repo_type="dataset",
        )
        with open(local, encoding="utf-8") as f:
            payload = json.load(f)
        items = payload.get("items") if isinstance(payload, dict) else payload
        if isinstance(items, list):
            return items
        return None
    except Exception as e:
        logger.info("curated dataset fetch failed: %s", e)
        return None


def _load_curated() -> list[dict]:
    import time

    now = time.monotonic()
    with _CURATED_LOCK:
        cached_at = _CURATED_CACHE["fetched_at"]
        cached_items = _CURATED_CACHE["items"]
        if cached_items is not None and (now - cached_at) < _CURATED_TTL_SECONDS:
            return cached_items

    live = _fetch_curated_from_hub()
    items: list[dict] = live if live is not None else _load_bundled_snapshot()

    with _CURATED_LOCK:
        cached_at2 = _CURATED_CACHE["fetched_at"]
        if (now - cached_at2) >= _CURATED_TTL_SECONDS:
            _CURATED_CACHE["fetched_at"] = now
            _CURATED_CACHE["items"] = items
        else:
            cached = _CURATED_CACHE["items"]
            if cached is not None:
                items = cached
    return items


logger = logging.getLogger(__name__)

# Scalar-only — everything else (str, list, dict, custom classes) falls through
# to the default "text" port type, which round-trips as JSON.
_PY_TO_PORT = {int: "number", float: "number", bool: "boolean"}
_SANITIZE_RE = re.compile(r"[^a-zA-Z0-9_-]")


def _build_edges(
    edges_spec: list[tuple[str, str]],
    nodes: list[dict],
) -> list[dict]:
    def resolve(spec: str, ports_key: str) -> tuple[str, str, str]:
        fn_name, _, port_hint = spec.partition(".")
        fn_name = fn_name.strip()
        port_hint = port_hint.strip() or None

        node = next((n for n in nodes if n.get("fn") == fn_name), None)
        if node is None:
            raise ValueError(
                f"edges: no function '{fn_name}' in bind dict. "
                f"Available: {[n['fn'] for n in nodes]}"
            )

        ports = node[ports_key]
        if not ports:
            raise ValueError(f"edges: node '{fn_name}' has no {ports_key}")

        if port_hint is None:
            port = ports[0]
            return node["id"], port["id"], port.get("type", "text")

        port = next(
            (p for p in ports if p["label"] == port_hint or p["id"] == port_hint),
            None,
        )
        if port is None:
            raise ValueError(
                f"edges: no {ports_key[:-1]} port '{port_hint}' on '{fn_name}'. "
                f"Available: {[p['label'] for p in ports]}"
            )
        return node["id"], port["id"], port.get("type", "text")

    result = []
    for i, (from_spec, to_spec) in enumerate(edges_spec):
        from_node_id, from_port_id, edge_type = resolve(from_spec, "outputs")
        to_node_id, to_port_id, _ = resolve(to_spec, "inputs")
        result.append(
            {
                "id": f"edge_{i}",
                "from_node_id": from_node_id,
                "from_port_id": from_port_id,
                "to_node_id": to_node_id,
                "to_port_id": to_port_id,
                "type": edge_type,
            }
        )
    return result


def _workflow_from_bind(
    bound: dict[str, Callable],
    edges: list[tuple[str, str]] | None = None,
    name: str = "My Workflow",
) -> str:
    nodes = []
    for i, (fn_name, fn) in enumerate(bound.items()):
        try:
            sig = inspect.signature(fn)
        except (ValueError, TypeError):
            sig = inspect.Signature()

        try:
            _hints = get_type_hints(fn)
        except Exception:
            _hints = getattr(fn, "__annotations__", {})
        inputs = [
            {
                "id": f"in_{p}",
                "label": p,
                "type": _PY_TO_PORT.get(param.annotation, "text"),
            }
            for p, param in sig.parameters.items()
            if p != "self" and not _is_injected_param(_hints.get(p))
        ]
        outputs = [
            {
                "id": "out_0",
                "label": "output",
                "type": _PY_TO_PORT.get(sig.return_annotation, "text"),
            }
        ]

        if not inputs:
            inputs = [{"id": "in_0", "label": "input", "type": "text"}]

        nodes.append(
            {
                "id": f"fn_{fn_name}",
                "source": "fn",
                "fn": fn_name,
                "kind": "transform",
                "label": fn_name,
                "x": 80 + i * 280,
                "y": 150,
                "width": 220,
                "height": 80 + max(len(inputs), len(outputs)) * 36,
                "inputs": inputs,
                "outputs": outputs,
                "data": {},
            }
        )

    edge_dicts = _build_edges(edges or [], nodes)
    return json.dumps(
        {"version": "1", "name": name, "nodes": nodes, "edges": edge_dicts}
    )


def _get_locally_saved_hf_token() -> str | None:
    """Return the local Hugging Face token when running outside Spaces.

    Avoid reading a Space's token/secret here: `get_token` is exposed to the
    browser so the workflow canvas can authenticate local apps with the user's
    `huggingface_hub login` token.
    """
    if get_space() is not None:
        return None
    return hf_get_token()


# Per-process secret granting write access to local Workflow apps, in the same
# spirit as Jupyter notebook tokens. The full URL (printed at launch) carries it
# as a query parameter; the frontend then persists it as a cookie. Share-link
# visitors and tunnelled requests never see it, so they get read-only access
# and no access to the host's local HF token.
WRITE_TOKEN = secrets.token_urlsafe(32)

_WRITE_TOKEN_COOKIE_PREFIX = "gradio_workflow_write_token"
_WRITE_TOKEN_HEADER = "x-gradio-workflow-write-token"


def _request_has_write_token(request: Request | None) -> bool:
    """True when the request carries the per-process write token, checked in
    header → cookie → query-param order (mirrors trackio's scheme). The cookie
    name is prefix-matched because the frontend suffixes it with the port —
    cookies are shared across ports on the same host, so two local apps would
    otherwise clobber each other."""
    if request is None:
        return False
    try:
        headers = {k.lower(): v for k, v in dict(request.headers or {}).items()}
    except Exception:
        return False
    header_value = headers.get(_WRITE_TOKEN_HEADER)
    if header_value:
        return secrets.compare_digest(header_value, WRITE_TOKEN)
    for cookie in headers.get("cookie", "").split(";"):
        name, _, value = cookie.strip().partition("=")
        if (
            name.startswith(_WRITE_TOKEN_COOKIE_PREFIX)
            and value
            and secrets.compare_digest(urllib.parse.unquote(value), WRITE_TOKEN)
        ):
            return True
    try:
        query_value = request.query_params.get("write_token")
    except Exception:
        query_value = None
    if query_value:
        return secrets.compare_digest(query_value, WRITE_TOKEN)
    return False


# Shared instance: whoami(cache=True) caches per token on the HfApi instance,
# which matters because whoami-v2 is heavily rate-limited.
_hf_api = HfApi()


def _oauth_token_has_space_write_access(oauth_token: str | None) -> bool:
    """On Spaces, write access belongs to the Space owner: the OAuth user must
    be the owning user, or an admin/write member of the owning org."""
    space_id = get_space()
    if not space_id or not oauth_token:
        return False
    try:
        who = _hf_api.whoami(token=oauth_token, cache=True)
    except Exception:
        return False
    owner = os.getenv("SPACE_AUTHOR_NAME") or space_id.split("/")[0]
    if who.get("name") == owner:
        return True
    return any(
        org.get("name") == owner and org.get("roleInOrg") in ("admin", "write")
        for org in who.get("orgs", [])
    )


def has_write_access(
    request: Request | None = None, token: OAuthToken | None = None
) -> bool:
    """Whether this request may modify the workflow (and, locally, use the
    host's saved HF token). Locally: requires the launch-time write token.
    On Spaces: requires the OAuth user to own the Space (or have org write)."""
    if get_space() is not None:
        return _oauth_token_has_space_write_access(token.token if token else None)
    return _request_has_write_token(request)


def _resolve_token(
    data: list, idx: int, token, request: Request | None = None
) -> str | None:
    manual = data[idx] if len(data) > idx else None
    if manual:
        return manual
    if token:
        return token.token
    if _request_has_write_token(request):
        return _get_locally_saved_hf_token()
    return None


def _hf_request(url: str, hf_token: str | None, timeout: int = 15) -> str:
    headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
    resp = _HF_CLIENT.get(url, headers=headers, timeout=timeout)
    resp.raise_for_status()
    return resp.text


def _save_tmp(result, ext: str) -> dict:
    path = os.path.join(
        tempfile.gettempdir(), f"hf_workflow_{os.urandom(8).hex()}.{ext}"
    )
    if hasattr(result, "save"):
        result.save(path)
    else:
        with open(path, "wb") as f:
            f.write(result)
    return {"path": path, "url": f"/gradio_api/file={path}", "is_file": True}


def _img_url(a) -> str:
    return a.get("url") or a.get("path", "") if isinstance(a, dict) else a


def _classify_error(e: Exception) -> dict:
    http_status: int | None = None
    response = getattr(e, "response", None)
    if response is not None:
        http_status = getattr(response, "status_code", None)
    if http_status is None:
        http_status = getattr(e, "status_code", None)

    if http_status in (401, 403):
        return {
            "error_type": "auth",
            "suggestion": "Sign in with your HF account to use this model",
        }
    if http_status == 404:
        return {
            "error_type": "not_found",
            "suggestion": "Space not found — it may have been deleted or renamed",
        }
    if http_status == 429:
        return {"error_type": "quota"}

    type_name = type(e).__name__
    if type_name in (
        "RepositoryNotFoundError",
        "EntryNotFoundError",
        "RevisionNotFoundError",
    ):
        return {
            "error_type": "not_found",
            "suggestion": "Space not found — it may have been deleted or renamed",
        }
    if type_name == "GatedRepoError":
        return {
            "error_type": "auth",
            "suggestion": "Sign in with your HF account to use this model",
        }

    title = getattr(e, "title", None) or ""
    message = getattr(e, "message", None) or str(e)
    full = f"{title} {message}".lower()

    if "zerogpu" in full or ("gpu" in full and "worker" in full):
        return {"error_type": "gpu"}
    if "quota" in full or "rate limit" in full or "rate_limit" in full:
        return {"error_type": "quota"}
    if "sleeping" in full or "paused" in full:
        return {
            "error_type": "sleeping",
            "suggestion": "Space is sleeping or paused — try again in a minute",
        }
    if (
        "unauthorized" in full
        or "authentication" in full
        or "log in" in full
        or "api_key" in full
        or "api key" in full
    ):
        return {
            "error_type": "auth",
            "suggestion": "Sign in with your HF account to use this model",
        }
    if "not found" in full or "repository not found" in full:
        return {
            "error_type": "not_found",
            "suggestion": "Space not found — it may have been deleted or renamed",
        }
    if "build_error" in full or "build error" in full:
        return {
            "error_type": "build_error",
            "suggestion": "Space has a build error — contact the Space owner",
        }
    if "timed out" in full or "timeout" in full or "connection" in full:
        return {
            "error_type": "connection",
            "suggestion": "Could not connect to the Space — it may be down",
        }
    return {"error_type": "unknown", "suggestion": ""}


def _format_error(e: Exception) -> str:
    title = getattr(e, "title", None)
    message = getattr(e, "message", None) or str(e)
    classified = _classify_error(e)
    if classified.get("error_type") == "auth":
        message = "Authentication required"
        title = None
    err = {"error": message, **classified}
    if title:
        err["title"] = title
    return json.dumps(err)


def get_token(
    _data=None,
    request: Optional[Request] = None,
    token: Optional[OAuthToken] = None,
) -> str:
    """Return the HF token for this browser session. The host's locally saved
    token is only revealed to sessions holding the write token — share-link
    visitors and other remote clients get "" (logged-out experience)."""
    if token:
        return token.token
    if _request_has_write_token(request):
        return _get_locally_saved_hf_token() or ""
    return ""


def get_write_access(
    _data=None,
    request: Optional[Request] = None,
    token: Optional[OAuthToken] = None,
) -> str:
    return "true" if has_write_access(request, token) else "false"


def get_oauth_available(_data=None) -> str:
    """Whether OAuth sign-in is actually wired up. On a Space this requires
    `hf_oauth: true` in the README metadata, which provisions OAUTH_CLIENT_ID
    and causes the `/login/huggingface` route to be mounted (mirrors the gate
    that adds the LoginButton in `__init__`). Without it, sign-in would 404, so
    the frontend hides the login button and explains the fix on the read-only
    badge. OAuth is not used locally (the write-token model is used instead)."""
    return (
        "true"
        if get_space() is not None and bool(os.getenv("OAUTH_CLIENT_ID"))
        else "false"
    )


def call_space(
    data, request: Optional[Request] = None, token: Optional[OAuthToken] = None
) -> str:
    space_id = data[0] if data else ""
    try:
        from gradio_client import Client, handle_file

        endpoint = data[1] if len(data) > 1 else None
        args_json = data[2] if len(data) > 2 else "[]"
        hf_token = _resolve_token(data, 3, token, request)
        if not re.fullmatch(r"[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+", space_id or ""):
            return json.dumps(
                {
                    "error": "Invalid Space ID",
                    "error_type": "not_found",
                    "suggestion": "Space ID must be in owner/repo format",
                }
            )
        client = Client(space_id, token=hf_token)
        args = json.loads(args_json)
        if not endpoint or endpoint == "/predict":
            api_info = client.view_api(return_format="dict")
            named = list(
                (
                    api_info.get("named_endpoints", {})
                    if isinstance(api_info, dict)
                    else {}
                ).keys()
            )
            endpoint = (
                endpoint if endpoint in named else (named[0] if named else "/predict")
            )
        processed = []
        for arg in args:
            if isinstance(arg, dict) and ("url" in arg or "path" in arg):
                url = arg.get("url") or arg.get("path", "")
                processed.append(handle_file(url) if url else None)
            else:
                processed.append(arg)
        while processed and processed[-1] is None:
            processed.pop()
        result = client.predict(*processed, api_name=endpoint)
        result = list(result) if isinstance(result, (list, tuple)) else [result]

        _tmpdir = os.path.realpath(tempfile.gettempdir())

        def process_item(item):
            if isinstance(item, dict):
                path = item.get("path") or item.get("value")
                if (
                    isinstance(path, str)
                    and os.path.realpath(path).startswith(_tmpdir)
                    and os.path.exists(path)
                ):
                    return {
                        "path": path,
                        "url": f"/gradio_api/file={path}",
                        "is_file": True,
                    }
                return item
            if (
                isinstance(item, str)
                and os.path.realpath(item).startswith(_tmpdir)
                and os.path.exists(item)
            ):
                return {
                    "path": item,
                    "url": f"/gradio_api/file={item}",
                    "is_file": True,
                }
            if isinstance(item, (list, tuple)):
                return [process_item(s) for s in item]
            return item

        return json.dumps([process_item(i) for i in result])
    except Exception as e:
        logger.error("call_space failed for %s: %s", space_id, e, exc_info=True)
        return _format_error(e)


_INFERENCE_ENDPOINT_SCHEMAS: dict[str, dict] = {
    "text_to_image": {
        "inputs": [
            {"id": "prompt", "label": "Prompt", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Image", "type": "image", "output_index": 0}
        ],
    },
    "text_to_speech": {
        "inputs": [
            {"id": "text", "label": "Text", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Audio", "type": "audio", "output_index": 0}
        ],
    },
    "text_to_video": {
        "inputs": [
            {"id": "prompt", "label": "Prompt", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Video", "type": "video", "output_index": 0}
        ],
    },
    "image_to_image": {
        "inputs": [
            {"id": "image", "label": "Image", "type": "image"},
            {"id": "prompt", "label": "Prompt", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Image", "type": "image", "output_index": 0}
        ],
    },
    "image_to_video": {
        "inputs": [
            {"id": "image", "label": "Image", "type": "image"},
            {"id": "prompt", "label": "Prompt", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Video", "type": "video", "output_index": 0}
        ],
    },
    "text_generation": {
        "inputs": [
            {"id": "prompt", "label": "Prompt", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Text", "type": "text", "output_index": 0}
        ],
    },
    "summarization": {
        "inputs": [
            {"id": "text", "label": "Text", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Summary", "type": "text", "output_index": 0}
        ],
    },
    "translation": {
        "inputs": [
            {"id": "text", "label": "Text", "type": "text"},
            {"id": "src_lang", "label": "Source Language", "type": "text"},
            {"id": "tgt_lang", "label": "Target Language", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Translation", "type": "text", "output_index": 0}
        ],
    },
    "fill_mask": {
        "inputs": [{"id": "text", "label": "Text", "type": "text"}],
        "outputs": [
            {"id": "out_0", "label": "Result", "type": "json", "output_index": 0}
        ],
    },
    "text_classification": {
        "inputs": [{"id": "text", "label": "Text", "type": "text"}],
        "outputs": [
            {"id": "out_0", "label": "Labels", "type": "json", "output_index": 0}
        ],
    },
    "token_classification": {
        "inputs": [{"id": "text", "label": "Text", "type": "text"}],
        "outputs": [
            {"id": "out_0", "label": "Entities", "type": "json", "output_index": 0}
        ],
    },
    "zero_shot_classification": {
        "inputs": [
            {"id": "text", "label": "Text", "type": "text"},
            {"id": "candidate_labels", "label": "Candidate Labels", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Scores", "type": "json", "output_index": 0}
        ],
    },
    "sentence_similarity": {
        "inputs": [
            {"id": "sentence", "label": "Sentence", "type": "text"},
            {"id": "other_sentences", "label": "Other Sentences", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Scores", "type": "json", "output_index": 0}
        ],
    },
    "question_answering": {
        "inputs": [
            {"id": "question", "label": "Question", "type": "text"},
            {"id": "context", "label": "Context", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Answer", "type": "text", "output_index": 0}
        ],
    },
    "feature_extraction": {
        "inputs": [{"id": "text", "label": "Text", "type": "text"}],
        "outputs": [
            {"id": "out_0", "label": "Embeddings", "type": "json", "output_index": 0}
        ],
    },
    "image_classification": {
        "inputs": [{"id": "image", "label": "Image", "type": "image"}],
        "outputs": [
            {"id": "out_0", "label": "Labels", "type": "json", "output_index": 0}
        ],
    },
    "object_detection": {
        "inputs": [{"id": "image", "label": "Image", "type": "image"}],
        "outputs": [
            {"id": "out_0", "label": "Detections", "type": "json", "output_index": 0}
        ],
    },
    "image_segmentation": {
        "inputs": [{"id": "image", "label": "Image", "type": "image"}],
        "outputs": [
            {"id": "out_0", "label": "Segments", "type": "json", "output_index": 0}
        ],
    },
    "image_to_text": {
        "inputs": [{"id": "image", "label": "Image", "type": "image"}],
        "outputs": [
            {"id": "out_0", "label": "Text", "type": "text", "output_index": 0}
        ],
    },
    "automatic_speech_recognition": {
        "inputs": [{"id": "audio", "label": "Audio", "type": "audio"}],
        "outputs": [
            {"id": "out_0", "label": "Text", "type": "text", "output_index": 0}
        ],
    },
    "audio_classification": {
        "inputs": [{"id": "audio", "label": "Audio", "type": "audio"}],
        "outputs": [
            {"id": "out_0", "label": "Labels", "type": "json", "output_index": 0}
        ],
    },
    "visual_question_answering": {
        "inputs": [
            {"id": "image", "label": "Image", "type": "image"},
            {"id": "question", "label": "Question", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Answer", "type": "text", "output_index": 0}
        ],
    },
    "document_question_answering": {
        "inputs": [
            {"id": "image", "label": "Document", "type": "image"},
            {"id": "question", "label": "Question", "type": "text"},
        ],
        "outputs": [
            {"id": "out_0", "label": "Answer", "type": "text", "output_index": 0}
        ],
    },
}


_ENDPOINT_OUTPUT_EXT: dict[str, str] = {
    "text_to_image": "png",
    "image_to_image": "png",
    "text_to_speech": "wav",
    "text_to_video": "mp4",
    "image_to_video": "mp4",
}


# Legacy pipeline tags (as sent by older saved workflows and the browser
# executor) → InferenceClient endpoint names. depth-estimation is absent on
# purpose: InferenceClient has no such method, so it keeps its raw-POST branch
# in call_model. Unmapped tags fall through to the chat/raw-POST fallback.
_PIPELINE_TAG_TO_ENDPOINT: dict[str, str] = {
    "text-generation": "text_generation",
    "text2text-generation": "text_generation",
    "conversational": "text_generation",
    "summarization": "summarization",
    "translation": "translation",
    "fill-mask": "fill_mask",
    "text-classification": "text_classification",
    "token-classification": "token_classification",
    "zero-shot-classification": "zero_shot_classification",
    "sentence-similarity": "sentence_similarity",
    "question-answering": "question_answering",
    "feature-extraction": "feature_extraction",
    "text-to-image": "text_to_image",
    "text-to-speech": "text_to_speech",
    "text-to-audio": "text_to_speech",
    "text-to-video": "text_to_video",
    "image-to-image": "image_to_image",
    "image-to-video": "image_to_video",
    "image-classification": "image_classification",
    "object-detection": "object_detection",
    "image-segmentation": "image_segmentation",
    "image-to-text": "image_to_text",
    "automatic-speech-recognition": "automatic_speech_recognition",
    "audio-classification": "audio_classification",
    "visual-question-answering": "visual_question_answering",
    "document-question-answering": "document_question_answering",
    "image-text-to-text": "visual_question_answering",
}


# Client params that expect a list of strings; port values arrive as a single
# string, split on the given pattern.
_ENDPOINT_LIST_KWARGS: dict[str, dict[str, str]] = {
    "zero_shot_classification": {"candidate_labels": r"[\n,]"},
    "sentence_similarity": {"other_sentences": r"\n"},
}


def get_model_endpoints(
    _data, _request: Optional[Request] = None, _token: Optional[OAuthToken] = None
) -> str:
    from huggingface_hub import InferenceClient

    # Only advertise endpoints the installed huggingface_hub can actually run,
    # so the UI never shapes a node around a method that would fail server-side.
    endpoints = [
        {"name": name, **schema}
        for name, schema in _INFERENCE_ENDPOINT_SCHEMAS.items()
        if getattr(InferenceClient, name, None) is not None
    ]
    return json.dumps(endpoints)


def _dispatch_model_endpoint(client, endpoint: str, kwargs: dict) -> str:
    """Call client.<endpoint>(**kwargs) and serialize the result."""
    fn = getattr(client, endpoint, None)
    if fn is None:
        import huggingface_hub

        raise ValueError(
            f"Task '{endpoint}' is not supported by the installed huggingface_hub "
            f"version ({huggingface_hub.__version__}). Upgrade it with "
            "`pip install -U huggingface_hub`."
        )
    schema_ids = [
        p["id"] for p in _INFERENCE_ENDPOINT_SCHEMAS.get(endpoint, {}).get("inputs", [])
    ]
    clean: dict = {}
    for k, v in kwargs.items():
        if v is None or v == "":
            continue
        legacy = re.fullmatch(r"in_(\d+)", k)
        if legacy and k not in schema_ids and int(legacy.group(1)) < len(schema_ids):
            # positional port IDs from workflows saved before endpoint schemas
            k = schema_ids[int(legacy.group(1))]
        clean[k] = (
            _img_url(v) if isinstance(v, dict) and ("url" in v or "path" in v) else v
        )
    for key, sep in _ENDPOINT_LIST_KWARGS.get(endpoint, {}).items():
        if isinstance(clean.get(key), str):
            clean[key] = [s.strip() for s in re.split(sep, clean[key]) if s.strip()]
    if endpoint == "zero_shot_classification" and not clean.get("candidate_labels"):
        # without labels, fall back to scoring with the model's own label set
        return _dispatch_model_endpoint(
            client, "text_classification", {"text": clean.get("text", "")}
        )
    if endpoint == "text_generation":
        clean.setdefault("max_new_tokens", 512)
        try:
            result = fn(**clean)
        except Exception as inner:
            msg = str(inner).lower()
            if "not supported" in msg and "conversational" in msg:
                r = client.chat_completion(
                    [{"role": "user", "content": clean.get("prompt", "")}],
                    max_tokens=512,
                )
                result = r.choices[0].message.content
            else:
                raise
    else:
        result = fn(**clean)
    ext = _ENDPOINT_OUTPUT_EXT.get(endpoint)
    if ext:
        return json.dumps([_save_tmp(result, ext)])
    if isinstance(result, list) and result and hasattr(result[0], "answer"):
        # question-answering-style outputs: surface the top answer
        result = result[0]
    for attr in (
        "summary_text",
        "translation_text",
        "generated_text",
        "text",
        "answer",
    ):
        if hasattr(result, attr):
            return json.dumps([getattr(result, attr)])
    if isinstance(result, list):

        def _item(r):
            if hasattr(r, "__dict__"):
                return {k: v for k, v in vars(r).items() if not k.startswith("_")}
            return r

        return json.dumps(
            [[_item(r) for r in result]],
            default=lambda o: vars(o) if hasattr(o, "__dict__") else str(o),
        )
    if hasattr(result, "tolist"):
        return json.dumps([result.tolist()])
    return json.dumps(
        [result if isinstance(result, (str, int, float, bool)) else str(result)]
    )


def call_model(
    data, request: Optional[Request] = None, token: Optional[OAuthToken] = None
) -> str:
    model_id = data[0] if data else ""
    task = ""
    try:
        from huggingface_hub import InferenceClient

        if not re.fullmatch(r"[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+", model_id or ""):
            return json.dumps(
                {
                    "error": "Invalid model ID",
                    "error_type": "not_found",
                    "suggestion": "Model ID must be in owner/repo format",
                }
            )
        pipeline_tag = data[1] if len(data) > 1 else None
        args_json = data[2] if len(data) > 2 else "[]"
        hf_token = _resolve_token(data, 3, token, request)
        # "auto" lets HF route to whichever provider serves the model; pinning
        # "hf-inference" 404s for models not hosted there.
        provider = data[4] if len(data) > 4 and data[4] else "auto"
        client = InferenceClient(model=model_id, token=hf_token, provider=provider)
        args = json.loads(args_json)
        if isinstance(args, dict):
            endpoint = pipeline_tag or ""
            return _dispatch_model_endpoint(client, endpoint, args)

        task = pipeline_tag or "text-generation"
        a0 = args[0] if args else ""
        a1 = args[1] if len(args) > 1 else ""

        if task == "depth-estimation":
            headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
            resp = httpx.post(
                f"https://api-inference.huggingface.co/models/{model_id}",
                headers=headers,
                json={"inputs": _img_url(a0)},
                timeout=60,
            )
            resp.raise_for_status()
            import io as _io

            from PIL import Image as _Image

            depth_img = _Image.open(_io.BytesIO(resp.content))
            return json.dumps([_save_tmp(depth_img, "png")])

        endpoint = _PIPELINE_TAG_TO_ENDPOINT.get(task)
        if endpoint:
            # Positional args from legacy saved workflows and the browser
            # executor map onto the endpoint schema's input order.
            schema_inputs = _INFERENCE_ENDPOINT_SCHEMAS[endpoint]["inputs"]
            kwargs = {
                schema_inputs[i]["id"]: val
                for i, val in enumerate(args[: len(schema_inputs)])
            }
            return _dispatch_model_endpoint(client, endpoint, kwargs)

        # Fallback for tasks not handled above: chat_completion (works for most
        # text models across providers), then a raw POST as last resort.
        try:
            r = client.chat_completion(
                [{"role": "user", "content": a0}], max_tokens=512
            )
            return json.dumps([r.choices[0].message.content])
        except Exception:
            pass
        headers = {"Authorization": f"Bearer {hf_token}"} if hf_token else {}
        fallback_resp = httpx.post(
            f"https://api-inference.huggingface.co/models/{model_id}",
            headers=headers,
            json={"inputs": a0 if not a1 else [a0, a1]},
            timeout=60,
        )
        fallback_resp.raise_for_status()
        try:
            parsed = fallback_resp.json()
        except Exception:
            parsed = fallback_resp.text
        return json.dumps([parsed])
    except Exception as e:
        logger.error(
            "call_model failed for %s (task=%s): %s",
            model_id,
            task,
            e,
            exc_info=True,
        )
        return _format_error(e)


def fetch_dataset(
    data, request: Optional[Request] = None, token: Optional[OAuthToken] = None
) -> str:
    try:
        dataset_id = data[0]
        config = data[1] if len(data) > 1 and data[1] else "default"
        split = data[2] if len(data) > 2 and data[2] else "train"
        offset = int(data[3]) if len(data) > 3 and data[3] else 0
        length = int(data[4]) if len(data) > 4 and data[4] else 10
        hf_token = _resolve_token(data, 5, token, request)
        params = urllib.parse.urlencode(
            {
                "dataset": dataset_id,
                "config": config,
                "split": split,
                "offset": offset,
                "length": min(length, 100),
            }
        )
        result = json.loads(
            _hf_request(
                f"https://datasets-server.huggingface.co/rows?{params}",
                hf_token,
                timeout=30,
            )
        )
        return json.dumps(
            {
                "features": result.get("features", []),
                "rows": [r.get("row", {}) for r in result.get("rows", [])],
                "num_rows_total": result.get("num_rows_total", 0),
            }
        )
    except Exception as e:
        logger.error(
            "fetch_dataset failed for %s: %s",
            data[0] if data else "",
            e,
            exc_info=True,
        )
        return json.dumps({"error": str(e), "error_type": "unknown", "suggestion": ""})


def _curated_entry_to_space_result(entry: dict) -> dict:
    return {
        "id": entry.get("id"),
        "likes": 0,
        "trendingScore": (entry.get("validation") or {}).get("latency_ms") or 0,
        "runtime": {"stage": "RUNNING"},
        "pipeline_tag": entry.get("task"),
        "tags": ["zero-gpu"] if entry.get("zero_gpu") else [],
        "cardData": {
            "title": entry.get("title"),
            "short_description": entry.get("description"),
            "tags": ["zero-gpu"] if entry.get("zero_gpu") else [],
            "sdk": "gradio",
        },
        "_curated": True,
        "_featured": bool(entry.get("featured")),
        "_thumbnail": entry.get("thumbnail"),
    }


def _curated_entry_to_model_result(entry: dict) -> dict:
    return {
        "id": entry.get("id"),
        "likes": 0,
        "downloads": 0,
        "pipeline_tag": entry.get("task"),
        "_curated": True,
        "_featured": bool(entry.get("featured")),
        "_thumbnail": entry.get("thumbnail"),
    }


def _filter_curated(
    items: list[dict],
    kind_filter: str,
    task: str,
    query: str,
    modality: str = "",
) -> list[dict]:
    out: list[dict] = []
    q = query.lower().strip()
    for entry in items:
        if entry.get("kind") != kind_filter:
            continue
        v = entry.get("validation") or {}
        status = v.get("status", "ok")
        if status and status != "ok":
            continue
        if task:
            if entry.get("task") != task and entry.get("space_category") != task:
                continue
        elif modality and entry.get("modality") != modality:
            continue
        if q:
            haystack = " ".join(
                [
                    str(entry.get("title") or ""),
                    str(entry.get("description") or ""),
                    str(entry.get("id") or ""),
                ]
            ).lower()
            if q not in haystack:
                continue
        out.append(entry)
    return out


def search_spaces(
    data, _request: Optional[Request] = None, _token: Optional[OAuthToken] = None
) -> str:
    kind = data[0] if data else "trending"
    try:
        query = data[1] if len(data) > 1 and data[1] else ""
        space_tag = data[2] if len(data) > 2 and data[2] else ""
        modality = data[3] if len(data) > 3 and isinstance(data[3], str) else ""
        zero_gpu_only = bool(data[4]) if len(data) > 4 else False

        items = _filter_curated(_load_curated(), "space", space_tag, query, modality)
        if zero_gpu_only:
            items = [e for e in items if e.get("zero_gpu")]

        if kind == "new":
            items.sort(key=lambda e: e.get("added_at") or "", reverse=True)
        else:

            def _rank(e: dict) -> tuple:
                v = e.get("validation") or {}
                return (
                    0 if e.get("zero_gpu") else 1,
                    0 if e.get("featured") else 1,
                    v.get("latency_ms") or 999_999,
                    e.get("added_at") or "",
                )

            items.sort(key=_rank)

        normalized = [_curated_entry_to_space_result(e) for e in items[:48]]
        return json.dumps(normalized)
    except Exception as e:
        logger.error("search_spaces failed (kind=%s): %s", kind, e, exc_info=True)
        return json.dumps({"error": str(e)})


def search_models(
    data, _request: Optional[Request] = None, _token: Optional[OAuthToken] = None
) -> str:
    kind = data[0] if data else "trending"
    try:
        query = data[1] if len(data) > 1 and data[1] else ""
        pipeline_tag = data[2] if len(data) > 2 and data[2] else ""
        modality = data[3] if len(data) > 3 and isinstance(data[3], str) else ""

        items = _filter_curated(_load_curated(), "model", pipeline_tag, query, modality)

        if kind == "new":
            items.sort(key=lambda e: e.get("added_at") or "", reverse=True)
        else:
            items.sort(
                key=lambda e: (0 if e.get("featured") else 1, e.get("added_at") or "")
            )

        normalized = [_curated_entry_to_model_result(e) for e in items[:48]]
        return json.dumps(normalized)
    except Exception as e:
        logger.error("search_models failed (kind=%s): %s", kind, e, exc_info=True)
        return json.dumps({"error": str(e)})


def curated_modalities(_data=None, _token: Optional[OAuthToken] = None) -> str:
    try:
        items = _load_curated()
        mods: set[str] = set()
        for entry in items:
            v = entry.get("validation") or {}
            if v.get("status", "ok") != "ok":
                continue
            m = entry.get("modality")
            if m:
                mods.add(m)
        return json.dumps(sorted(mods))
    except Exception as e:
        logger.error("curated_modalities failed: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


def curated_modality_tasks(data, _token: Optional[OAuthToken] = None) -> str:
    try:
        modality = (data[0] if data else "") or ""
        items = _load_curated()
        tasks: set[str] = set()
        for entry in items:
            if modality and entry.get("modality") != modality:
                continue
            v = entry.get("validation") or {}
            if v.get("status", "ok") != "ok":
                continue
            t = entry.get("task")
            sc = entry.get("space_category")
            if t:
                tasks.add(t)
            if sc:
                tasks.add(sc)
        return json.dumps(sorted(tasks))
    except Exception as e:
        logger.error("curated_modality_tasks failed: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


def is_curated(data, _token: Optional[OAuthToken] = None) -> str:
    try:
        repo_id = (data[0] if data else "") or ""
        kind = (data[1] if len(data) > 1 else "") or ""
        items = _load_curated()
        for entry in items:
            if entry.get("id") != repo_id:
                continue
            if kind and entry.get("kind") != kind:
                continue
            v = entry.get("validation") or {}
            if v.get("status", "ok") != "ok":
                return json.dumps({"curated": False})
            return json.dumps(
                {
                    "curated": True,
                    "status": "ok",
                    "featured": bool(entry.get("featured")),
                }
            )
        return json.dumps({"curated": False})
    except Exception as e:
        logger.error("is_curated failed: %s", e, exc_info=True)
        return json.dumps({"error": str(e)})


_QUICKSEARCH_CACHE: dict[str, tuple[float, str]] = {}
_QUICKSEARCH_TTL = 30.0


def search_quick(
    data,
    request: Request | None = None,
    token: Optional[OAuthToken] = None,
) -> str:
    import time

    query = data[0] if data and data[0] else ""
    if not query or len(query) < 2:
        return json.dumps({"spaces": [], "models": []})
    try:
        hf_token = _resolve_token(data, 1, token, request)

        cache_key = query.lower().strip()
        now = time.monotonic()
        cached = _QUICKSEARCH_CACHE.get(cache_key)
        if cached and cached[0] > now:
            return cached[1]

        def _one(repo_type: str) -> list:
            url = (
                "https://huggingface.co/api/quicksearch?"
                f"q={urllib.parse.quote(query)}&type={repo_type}&limit=8"
            )
            try:
                raw = _hf_request(url, hf_token)
                parsed = json.loads(raw)
                if isinstance(parsed, dict):
                    return parsed.get(f"{repo_type}s") or parsed.get(repo_type) or []
                if isinstance(parsed, list):
                    return parsed
                return []
            except Exception:
                return []

        space_future = _SEARCH_POOL.submit(_one, "space")
        model_future = _SEARCH_POOL.submit(_one, "model")
        spaces = space_future.result()
        models = model_future.result()

        payload = json.dumps({"spaces": spaces, "models": models})
        _QUICKSEARCH_CACHE[cache_key] = (now + _QUICKSEARCH_TTL, payload)
        if len(_QUICKSEARCH_CACHE) > 256:
            for k in list(_QUICKSEARCH_CACHE.keys())[:64]:
                _QUICKSEARCH_CACHE.pop(k, None)
        return payload
    except Exception as e:
        logger.error("search_quick failed (q=%s): %s", query, e, exc_info=True)
        return json.dumps({"error": str(e)})


_REPO_ID_RE = re.compile(r"^[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+$")


def _parse_repo_input(raw: str) -> tuple[str, Optional[str]]:
    s = (raw or "").strip().rstrip("/")
    if not s:
        return "", None
    if _REPO_ID_RE.match(s):
        return s, None
    s = re.sub(r"^https?://(?:www\.)?", "", s)
    s = re.sub(r"^hf\.co/", "huggingface.co/", s)
    m = re.match(
        r"^huggingface\.co/(spaces|datasets|models)?/?([^/\s?#]+)/([^/\s?#]+)",
        s,
    )
    if m:
        section, org, name = m.group(1), m.group(2), m.group(3)
        if section == "spaces":
            return f"{org}/{name}", "space"
        if section == "datasets":
            return f"{org}/{name}", "dataset"
        return f"{org}/{name}", "model" if section else None
    return "", None


def resolve_repo(
    data,
    request: Request | None = None,
    token: Optional[OAuthToken] = None,
) -> str:
    raw = data[0] if data else ""
    try:
        hf_token = _resolve_token(data, 1, token, request)
        repo_id, kind_hint = _parse_repo_input(raw)

        def _try(rid: str, repo_type: str) -> Optional[dict]:
            try:
                url = (
                    f"https://huggingface.co/api/{repo_type}s/"
                    f"{urllib.parse.quote(rid, safe='/')}"
                )
                return json.loads(_hf_request(url, hf_token))
            except Exception:
                return None

        if not repo_id:
            sub = re.match(
                r"^(?:https?://)?([^/]+)\.hf\.space", raw.strip(), re.IGNORECASE
            )
            if sub:
                parts = sub.group(1).split("-")
                for i in range(1, len(parts)):
                    candidate = f"{'-'.join(parts[:i])}/{'-'.join(parts[i:])}"
                    rec = _try(candidate, "space")
                    if rec and rec.get("id"):
                        return json.dumps(
                            {"kind": "space", "id": rec["id"], "record": rec}
                        )
            return json.dumps({"error": "not_a_repo"})

        repo_types: list[str] = (
            [kind_hint]
            if kind_hint in ("space", "model", "dataset")
            else ["space", "model"]
        )
        for repo_type in repo_types:
            rec = _try(repo_id, repo_type)
            if rec and rec.get("id"):
                return json.dumps({"kind": repo_type, "id": rec["id"], "record": rec})
        return json.dumps({"error": "not_found", "id": repo_id})
    except Exception as e:
        logger.error("resolve_repo failed (raw=%s): %s", raw, e, exc_info=True)
        return json.dumps({"error": str(e)})


def search_datasets(
    data, request: Optional[Request] = None, token: Optional[OAuthToken] = None
) -> str:
    query = data[0] if data else ""
    try:
        hf_token = _resolve_token(data, 1, token, request)
        search_param = f"search={urllib.parse.quote(query)}&" if query else ""
        url = f"https://huggingface.co/api/datasets?{search_param}sort=likes&direction=-1&limit=20"
        return _hf_request(url, hf_token)
    except Exception as e:
        logger.error("search_datasets failed (query=%s): %s", query, e, exc_info=True)
        return json.dumps({"error": str(e)})


def get_dataset_schema(
    data, request: Optional[Request] = None, token: Optional[OAuthToken] = None
) -> str:
    dataset_id = data[0] if data else ""
    try:
        hf_token = _resolve_token(data, 1, token, request)
        try:
            splits_data = json.loads(
                _hf_request(
                    f"https://datasets-server.huggingface.co/splits?dataset={urllib.parse.quote(dataset_id)}",
                    hf_token,
                    timeout=30,
                )
            )
        except Exception as exc:
            raise Exception(
                "Could not load dataset — it may not be viewer-compatible"
            ) from exc
        splits = splits_data.get("splits", [])
        if not splits:
            raise Exception("No available splits found for this dataset")
        picked = next((s for s in splits if s["split"] == "train"), splits[0])
        try:
            rows_data = json.loads(
                _hf_request(
                    "https://datasets-server.huggingface.co/first-rows?"
                    + urllib.parse.urlencode(
                        {
                            "dataset": dataset_id,
                            "config": picked["config"],
                            "split": picked["split"],
                        }
                    ),
                    hf_token,
                    timeout=30,
                )
            )
        except Exception as exc:
            raise Exception(
                "Could not load dataset — it may not be viewer-compatible"
            ) from exc
        return json.dumps(
            {
                "config": picked["config"],
                "split": picked["split"],
                "features": rows_data.get("features", []),
            }
        )
    except Exception as e:
        logger.error(
            "get_dataset_schema failed for %s: %s", dataset_id, e, exc_info=True
        )
        return json.dumps({"error": str(e)})


class Workflow(Blocks):
    """
    Build and launch a visual AI workflow as a Gradio app.

    Reads a workflow topology from a JSON file and optionally binds Python functions
    that can be used as nodes in the workflow.

    Example:
        ```python
        from gradio import Workflow

        def summarize(text: str) -> str:
            return text[:200]

        Workflow(graph="workflow.json", bind={"summarize": summarize}).launch()
        ```

    The graph file uses schema version 2 and defines references, operators,
    subjects, and edges:
        ```json
        {
          "schema_version": "2",
          "references": [
            {
              "id": "prompt", "role": "reference", "label": "Prompt",
              "asset_type": "text",
              "inputs": [{"id": "in", "label": "Text", "type": "text"}],
              "outputs": [{"id": "out", "label": "Text", "type": "text"}],
              "data": {"out": "A sunset over the ocean"}
            }
          ],
          "operators": [
            {
              "id": "image", "role": "operator", "kind": "model",
              "model_id": "black-forest-labs/FLUX.1-schnell",
              "pipeline_tag": "text-to-image", "endpoint": "text_to_image",
              "inputs": [{"id": "prompt", "label": "Prompt", "type": "text", "required": true}],
              "outputs": [{"id": "out_0", "label": "Image", "type": "image", "output_index": 0}],
              "data": {}
            }
          ],
          "subjects": [
            {
              "id": "result", "role": "subject", "label": "Image",
              "asset_type": "image",
              "inputs": [{"id": "in", "label": "Image", "type": "image"}],
              "outputs": [{"id": "out", "label": "Image", "type": "image"}],
              "data": {}
            }
          ],
          "edges": [
            {"id": "e1", "from_node_id": "prompt", "from_port_id": "out", "to_node_id": "image", "to_port_id": "prompt", "type": "text"},
            {"id": "e2", "from_node_id": "image", "from_port_id": "out_0", "to_node_id": "result", "to_port_id": "in", "type": "image"}
          ]
        }
        ```
    """

    def __init__(
        self,
        graph: str | None = None,
        *,
        bind: dict[str, Callable] | list[Callable] | None = None,
        edges: list[tuple[str, str]] | None = None,
    ):
        """
        Parameters:
            graph: Path to the workflow JSON file describing the canvas graph
                (nodes + edges). Defaults to `workflow.json` in the same
                directory as the calling script. The file is created on first
                save if it doesn't exist.
            bind: Functions callable from the canvas frontend via the `call_fn` server
                function. Pass a list of callables (keys default to ``fn.__name__``) or
                a dict mapping explicit names to callables.
            edges: List of ``(from_endpoint, to_endpoint)`` tuples that wire nodes
                together when generating a workflow from ``bind`` (ignored when an
                existing ``graph`` file is loaded). Each endpoint is either
                ``"fn_name"`` (uses the first available port) or
                ``"fn_name.port_label"`` to target a specific port.

                Example::

                    edges=[
                        ("shout", "reverse"),         # first output → first input
                        ("clean.output", "tag.text"), # by port label
                    ]
        """
        if graph is None:
            caller_filename = sys._getframe(1).f_code.co_filename
            caller_dir = os.path.dirname(os.path.abspath(caller_filename))
            graph = os.path.join(caller_dir, "workflow.json")

        if isinstance(bind, list):
            bind = {getattr(fn, "__name__", repr(fn)): fn for fn in bind}

        self._workflow_file = graph
        self._workflow_name = (
            os.path.splitext(os.path.basename(graph))[0]
            .replace("_", " ")
            .replace("-", " ")
            .title()
        )
        self._bound: dict[str, Callable] = bind or {}
        self._edges: list[tuple[str, str]] = edges or []

        if Context.root_block is not None:
            raise ValueError(
                "gr.Workflow cannot be created inside another gr.Blocks context."
            )

        warnings.warn(
            "gr.Workflow is currently in beta. Its API and UX may change in future releases.",
            UserWarning,
        )

        super().__init__(mode="workflow")
        self._build()

    def _build(self):
        # Set once the API endpoints are registered (post UI build); save_workflow
        # re-syncs it so /info + /call track edits to the graph.
        self._api_endpoints: WorkflowEndpointManager | None = None

        if self._edges and os.path.exists(self._workflow_file):
            logger.warning(
                "Workflow: edges= is ignored because '%s' already exists. "
                "Delete the file to regenerate the workflow from bind/edges.",
                self._workflow_file,
            )

        # Callable so each browser session re-reads `workflow.json`, picking up
        # writes from `save_workflow` instead of the construction-time snapshot.
        def _load_initial() -> str | None:
            try:
                with open(self._workflow_file, encoding="utf-8") as f:
                    return f.read()
            except FileNotFoundError:
                if self._bound:
                    return _workflow_from_bind(
                        self._bound, self._edges, name=self._workflow_name
                    )
                return None

        bound = self._bound
        _save_lock = threading.Lock()

        def call_fn(
            data, request: Optional[Request] = None, token: Optional[OAuthToken] = None
        ) -> str:
            fn_name = data[0] if data else ""
            try:
                args_json = data[1] if len(data) > 1 else "[]"
                fn = bound.get(fn_name)
                if fn is None:
                    return json.dumps(
                        {
                            "error": f"No function '{fn_name}' bound to this workflow",
                            "error_type": "unknown",
                            "suggestion": "Check the bind= argument to Workflow()",
                        }
                    )
                args = json.loads(args_json)
                if not isinstance(args, list):
                    args = [args]
                args, *_ = _special_args(fn, args, request, None, token=token)
                if inspect.iscoroutinefunction(fn):
                    import asyncio

                    result = asyncio.run(fn(*args))
                else:
                    result = fn(*args)
                out = list(result) if isinstance(result, (list, tuple)) else [result]
                return json.dumps(out)
            except Exception as e:
                logger.error("call_fn failed for %s: %s", fn_name, e, exc_info=True)
                return json.dumps(
                    {"error": str(e), "error_type": "unknown", "suggestion": ""}
                )

        workflow_file = self._workflow_file

        _max_workflow_bytes = 5 * 1024 * 1024

        def list_bound_fns(_data=None, _token: Optional[OAuthToken] = None) -> str:
            """Return the bound functions' signatures so the canvas can offer
            them as add-able nodes via a dedicated bottom-bar button. The
            output port shape mirrors `_workflow_from_bind` so re-adding a
            previously-deleted node produces an identical template.
            """
            templates = []
            for fn_name, fn in bound.items():
                try:
                    sig = inspect.signature(fn)
                except (ValueError, TypeError):
                    sig = inspect.Signature()
                try:
                    _hints = get_type_hints(fn)
                except Exception:
                    _hints = getattr(fn, "__annotations__", {})
                inputs = [
                    {
                        "id": f"in_{p}",
                        "label": p,
                        "type": _PY_TO_PORT.get(param.annotation, "text"),
                    }
                    for p, param in sig.parameters.items()
                    if p != "self" and not _is_injected_param(_hints.get(p))
                ]
                if not inputs:
                    inputs = [{"id": "in_0", "label": "input", "type": "text"}]
                outputs = [
                    {
                        "id": "out_0",
                        "label": "output",
                        "type": _PY_TO_PORT.get(sig.return_annotation, "text"),
                    }
                ]
                templates.append(
                    {
                        "fn": fn_name,
                        "label": fn_name,
                        "inputs": inputs,
                        "outputs": outputs,
                    }
                )
            return json.dumps(templates)

        def get_workflow_api(_data=None, _request: Optional[Request] = None) -> str:
            """Describe the workflow's API endpoints (one per subgraph) for the
            frontend "View API" panel. Re-reads the current graph so it tracks
            live edits, same as the registered endpoints."""
            from gradio.workflow_api import WorkflowGraph, describe_workflow_api

            graph = WorkflowGraph.from_json(_load_initial())
            endpoints = describe_workflow_api(graph) if graph is not None else []
            return json.dumps({"endpoints": endpoints})

        def save_workflow(
            data,
            request: Optional[Request] = None,
            token: Optional[OAuthToken] = None,
        ) -> str:
            if not has_write_access(request, token):
                return json.dumps(
                    {
                        "error": "Write access required to save this workflow",
                        "error_type": "auth",
                        "suggestion": "Open the app via the write-access link "
                        "printed at launch (or sign in as the Space owner)",
                    }
                )
            try:
                payload = data[0] if isinstance(data, list) and data else str(data)
                if len(payload.encode()) > _max_workflow_bytes:
                    return json.dumps({"error": "Workflow payload exceeds 5 MB limit"})
                try:
                    parsed = json.loads(payload)
                except json.JSONDecodeError as exc:
                    return json.dumps({"error": f"Invalid workflow JSON: {exc}"})
                if not isinstance(parsed, dict) or parsed.get("schema_version") != "2":
                    return json.dumps(
                        {"error": "Workflow payload must use schema_version 2"}
                    )
                try:
                    from gradio.workflow_api import WorkflowGraph

                    WorkflowGraph(parsed)
                except ValueError as exc:
                    return json.dumps({"error": f"Invalid workflow schema: {exc}"})
                with _save_lock:
                    with open(workflow_file, "w", encoding="utf-8") as f:
                        f.write(payload)
                    if self._api_endpoints is not None:
                        try:
                            self._api_endpoints.sync()
                        except Exception:
                            logger.error(
                                "Workflow: endpoint sync after save failed",
                                exc_info=True,
                            )
                return "ok"
            except Exception as e:
                logger.error("save_workflow failed: %s", e, exc_info=True)
                return json.dumps({"error": str(e)})

        server_functions = [
            get_token,
            get_write_access,
            get_oauth_available,
            call_space,
            call_model,
            fetch_dataset,
            search_spaces,
            search_models,
            search_datasets,
            search_quick,
            resolve_repo,
            is_curated,
            curated_modalities,
            curated_modality_tasks,
            get_dataset_schema,
            list_bound_fns,
            get_workflow_api,
            get_model_endpoints,
            save_workflow,
        ]

        from gradio.workflow_api import WorkflowGraph, register_workflow_endpoints

        # Operator-kind → server-function used to execute that node. The same
        # functions back the canvas's client-side run; the API executor reuses
        # them (with request/token threaded for token resolution).
        callers = {
            "space": call_space,
            "model": call_model,
            "fn": call_fn,
            "dataset": fetch_dataset,
        }

        def _current_graph() -> WorkflowGraph | None:
            return WorkflowGraph.from_json(_load_initial())

        with self:
            if get_space() is not None and os.getenv("OAUTH_CLIENT_ID"):
                gr.LoginButton(visible=False)
            WorkflowCanvas(
                value=_load_initial,
                server_functions=server_functions,
            )

        def _wrap_bound_fn(fn: Callable) -> Callable:
            async def wrapper(
                args_json: str,
                _request: Optional[Request] = None,
                _token: Optional[OAuthToken] = None,
            ) -> str:
                args = json.loads(args_json)
                if not isinstance(args, list):
                    args = [args]
                args, *_ = _special_args(fn, args, _request, None, token=_token)
                try:
                    result = (
                        await fn(*args)
                        if inspect.iscoroutinefunction(fn)
                        else await anyio.to_thread.run_sync(
                            lambda: fn(*args), limiter=self.limiter
                        )
                    )
                except Exception as e:
                    raise gr.Error(str(e)) from e
                out = list(result) if isinstance(result, (list, tuple)) else [result]
                return json.dumps(out)

            return wrapper

        if bound:
            from gradio.workflow_api import _active_blocks

            if len(bound) != len({_SANITIZE_RE.sub("_", n) for n in bound}):
                sanitized = [_SANITIZE_RE.sub("_", n) for n in bound]
                dupes = {s for s in sanitized if sanitized.count(s) > 1}
                raise ValueError(
                    f"gr.Workflow: bound function names produce duplicate endpoint "
                    f"names after sanitizing: {dupes}. Rename one."
                )

            with _active_blocks(self):
                for fn_name, fn in bound.items():
                    sanitized_name = _SANITIZE_RE.sub("_", fn_name)
                    gr.api(
                        _wrap_bound_fn(fn),
                        api_name=f"predict_fn_{sanitized_name}",
                        concurrency_limit="default",
                        api_visibility="undocumented",
                    )
        # Expose each subject (output) as a named API endpoint reusing /info +
        # /call. The manager re-syncs on every save_workflow, so adding,
        # removing, renaming, or retyping an output updates the live API.
        self._api_endpoints = register_workflow_endpoints(self, _current_graph, callers)

    def launch(self, *args, **kwargs):  # type: ignore[override]
        """Launch the workflow as a Gradio app. Accepts the same arguments as `gr.Blocks.launch()`.
        `call_space` / `_save_tmp` write inference outputs to the system tempdir
        and serve them back as `/gradio_api/file=…` URLs; the tempdir is added
        to `allowed_paths` so those URLs resolve.

        Locally, editing requires the write token: the full edit link is printed
        after the standard launch output (and used for `inbrowser`). Plain
        local/share URLs open the app read-only."""
        if args:
            names = list(inspect.signature(super().launch).parameters)
            kwargs.update(dict(zip(names, args)))
        kwargs["allowed_paths"] = [
            tempfile.gettempdir(),
            *(kwargs.get("allowed_paths") or []),
        ]
        # We need the edit link to print (and the browser to open to it) before
        # the main thread is blocked, which means super().launch() must return
        # first. Rather than forcing `debug=False` — which would also strip
        # `debug` from `create_app()` (FastAPI error display) and the Colab
        # error-printing messages — we pass `debug` through unchanged and simply
        # neutralize `block_thread` for the duration of the inner launch, then
        # replicate Blocks.launch()'s blocking behavior ourselves below.
        prevent_thread_lock = bool(kwargs.get("prevent_thread_lock", False))
        debug = bool(kwargs.get("debug", False))
        inbrowser = bool(kwargs.get("inbrowser", False))
        kwargs["inbrowser"] = False

        real_block_thread = self.block_thread
        self.block_thread = lambda: None  # type: ignore[method-assign]
        try:
            launch_result = super().launch(**kwargs)
        finally:
            self.block_thread = real_block_thread  # type: ignore[method-assign]
        _, local_url, share_url = launch_result

        write_url = None
        if get_space() is None and local_url:
            sep = "&" if "?" in local_url else "?"
            write_url = f"{local_url}{sep}write_token={WRITE_TOKEN}"
            if not kwargs.get("quiet", False):
                print(
                    f"\n* Workflow write-access link (keep private as it lets you edit the workflow that all users see): {write_url}"
                )
        if inbrowser:
            webbrowser.open(
                write_url or (share_url if self.share and share_url else local_url)
            )

        is_in_interactive_mode = bool(getattr(sys, "ps1", sys.flags.interactive))
        if (
            debug
            or int(os.getenv("GRADIO_DEBUG", "0")) == 1
            or (not prevent_thread_lock and not is_in_interactive_mode)
        ):
            self.block_thread()
        return launch_result
