"""Shims for `huggingface_hub` inference-provider client fragility.

The per-task client methods hardcode both the task string and the response key
path, so any drift in a provider's registration or response shape breaks every
caller until upstream cuts a release. Prefer fixing upstream over adding here.
"""

from __future__ import annotations

import inspect
import re

import httpx

# Raised by `TaskProviderHelper._prepare_mapping_info` when the client method's
# hardcoded task doesn't match the model's provider registration.
PROVIDER_TASK_MISMATCH_RE = re.compile(
    r"is not supported for task (\S+) and provider (\S+)\. "
    r"Supported task: ([^.\s]+)\."
)


def run_via_helper(client, helper, fn, endpoint: str, clean: dict):
    """Bypass the per-task client method by calling the provider helper directly.

    Preserves the input key the client method uses (first positional param) and
    forwards remaining kwargs as parameters. Handles fal_ai image_to_video's
    URL-in-response quirk inline.
    """
    from huggingface_hub.inference._providers.fal_ai import FalAIQueueTask

    input_key = next(iter(inspect.signature(fn).parameters), "inputs")
    req = helper.prepare_request(
        inputs=clean.pop(input_key, None),
        parameters=clean,
        headers=client.headers,
        model=client.model,
        api_key=client.token,
    )
    response = client._inner_post(req)
    if endpoint != "image_to_video" or not isinstance(helper, FalAIQueueTask):
        return helper.get_response(response, req)

    # fal_ai returns a JSON envelope with a hosted video URL; the client's
    # default get_response tries to read raw bytes at a fixed key and KeyErrors.
    output = FalAIQueueTask.get_response(helper, response, req)
    d = output if isinstance(output, dict) else {}
    videos = d.get("videos") if isinstance(d.get("videos"), list) else None
    url = (
        (d.get("video") or {}).get("url")
        or d.get("video_url")
        or (videos[0].get("url") if videos else None)
    )
    if not url:
        raise ValueError(f"Unexpected fal-ai response shape: {output}")
    return httpx.get(url, timeout=60).content
