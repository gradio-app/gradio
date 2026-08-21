"""Shims for `huggingface_hub` inference-provider client fragility.

The per-task client methods hardcode both the task string and the response key
path, so any drift in a provider's registration or response shape breaks every
caller until upstream cuts a release. Prefer fixing upstream over adding here.
"""

from __future__ import annotations

import inspect
import json
import re

import httpx

# Raised by `TaskProviderHelper._prepare_mapping_info` when the client method's
# hardcoded task doesn't match the model's provider registration.
PROVIDER_TASK_MISMATCH_RE = re.compile(
    r"is not supported for task (\S+) and provider (\S+)\. "
    r"Supported task: ([^.\s]+)\."
)


def run_via_helper(client, helper, fn, clean: dict):
    """Bypass the client's per-task method. Falls back to URL-envelope fetch."""
    input_key = next(iter(inspect.signature(fn).parameters), "inputs")
    req = helper.prepare_request(
        inputs=clean.pop(input_key, None),
        parameters=clean,
        headers=client.headers,
        model=client.model,
        api_key=client.token,
    )
    response = client._inner_post(req)
    try:
        return helper.get_response(response, req)
    except (KeyError, TypeError):
        try:
            output = json.loads(response) if isinstance(response, (bytes, bytearray)) else None
        except Exception:
            output = None
        url = _extract_url(output)
        if not url:
            raise
        return httpx.get(url, timeout=60).content


def _extract_url(output):
    """Common URL-envelope shapes: {media: {url}}, {media_url}, {medias: [{url}]}."""
    if not isinstance(output, dict):
        return None
    for key in ("video", "image", "audio", "file"):
        v = output.get(key)
        if isinstance(v, dict) and isinstance(v.get("url"), str):
            return v["url"]
    for key in ("videos", "images", "audios", "files"):
        v = output.get(key)
        if isinstance(v, list) and v and isinstance(v[0], dict) and isinstance(v[0].get("url"), str):
            return v[0]["url"]
    for key in ("video_url", "image_url", "audio_url", "url"):
        v = output.get(key)
        if isinstance(v, str):
            return v
    return None
