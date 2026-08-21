"""Shims for `huggingface_hub` inference-provider client fragility.

Client methods hardcode task + response-key paths; provider drift breaks
callers until upstream cuts a release. Prefer fixing upstream over adding here.
"""

from __future__ import annotations

import inspect
import json
import re

from gradio_client.utils import synchronize_async

PROVIDER_TASK_MISMATCH_RE = re.compile(
    r"is not supported for task (\S+) and provider (\S+)\. "
    r"Supported task: ([^.\s]+)\."
)

_MAX_MEDIA_BYTES = 100 * 1024 * 1024
_ALLOWED_MEDIA_PREFIXES = (
    "image/",
    "audio/",
    "video/",
    "application/octet-stream",
)


class _ResponseRecorder:
    def __init__(self, client):
        self.client = client
        self.last_response = None
        self._orig = client._inner_post

        def wrapper(req):
            self.last_response = self._orig(req)
            return self.last_response

        client._inner_post = wrapper

    def restore(self):
        self.client._inner_post = self._orig


def call_with_recovery(client, fn, clean: dict):
    from huggingface_hub.inference._providers import get_provider_helper

    recorder = _ResponseRecorder(client)
    try:
        try:
            return fn(**clean)
        except ValueError as exc:
            m = PROVIDER_TASK_MISMATCH_RE.search(str(exc))
            if not m:
                raise
            helper = get_provider_helper(
                m.group(2),  # ty: ignore[invalid-argument-type]
                task=m.group(1),
                model=client.model,
            )
            helper.task = m.group(3)
            return _run_via_helper(client, helper, fn, clean)
        except (KeyError, TypeError):
            url = _extract_url(_decode(recorder.last_response))
            if not url:
                raise
            return _fetch_media_bytes(url)
    finally:
        recorder.restore()


def _run_via_helper(client, helper, fn, clean: dict):
    input_key = next(iter(inspect.signature(fn).parameters), "inputs")
    req = helper.prepare_request(
        inputs=clean.pop(input_key, None),
        parameters=clean,
        headers=client.headers,
        model=client.model,
        api_key=client.token,
    )
    response = client._inner_post(req)
    return _parse_or_fetch_url(response, helper, req)


def _parse_or_fetch_url(response, helper, req):
    try:
        return helper.get_response(response, req)
    except (KeyError, TypeError):
        url = _extract_url(_decode(response))
        if not url:
            raise
        return _fetch_media_bytes(url)


def _decode(response):
    if isinstance(response, (bytes, bytearray)):
        try:
            return json.loads(response)
        except Exception:
            return None
    return None


def _extract_url(output):
    if not isinstance(output, dict):
        return None
    for key in ("video", "image", "audio", "file"):
        v = output.get(key)
        if isinstance(v, dict) and isinstance(v.get("url"), str):
            return v["url"]
    for key in ("videos", "images", "audios", "files"):
        v = output.get(key)
        if (
            isinstance(v, list)
            and v
            and isinstance(v[0], dict)
            and isinstance(v[0].get("url"), str)
        ):
            return v[0]["url"]
    for key in ("video_url", "image_url", "audio_url", "url"):
        v = output.get(key)
        if isinstance(v, str):
            return v
    return None


def _fetch_media_bytes(url: str) -> bytes:
    from gradio.processing_utils import async_ssrf_protected_get

    async def _get() -> bytes:
        response = await async_ssrf_protected_get(url)
        if response.status_code != 200:
            raise ValueError(f"provider URL returned {response.status_code}")
        declared = response.headers.get("content-length")
        if declared and declared.isdigit() and int(declared) > _MAX_MEDIA_BYTES:
            raise ValueError(f"provider URL exceeds {_MAX_MEDIA_BYTES}-byte cap")
        ct = response.headers.get("content-type", "").split(";", 1)[0].strip().lower()
        if not ct.startswith(_ALLOWED_MEDIA_PREFIXES):
            raise ValueError(f"unexpected content-type from provider: {ct!r}")
        # ponytail: safehttpx buffers the whole body; no streaming cap available.
        data = response.content
        if len(data) > _MAX_MEDIA_BYTES:
            raise ValueError(f"provider URL exceeds {_MAX_MEDIA_BYTES}-byte cap")
        return data

    return synchronize_async(_get)
