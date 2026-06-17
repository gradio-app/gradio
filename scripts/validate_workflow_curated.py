"""Daily validation job for the workflow tool's curated catalog."""

from __future__ import annotations

import argparse
import base64
import io
import json
import logging
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)
logger = logging.getLogger("validate_workflow_curated")

CURATED_DATASET = "gradio/workflow-curated"
CURATED_FILENAME = "curated.json"
SMOKE_TIMEOUT = 30  # seconds per smoke call
INFO_TIMEOUT = 10
INFO_PATHS = ("/gradio_api/info", "/info", "/api/info")

TASK_INPUT_TYPES: dict[str, list[str]] = {
    "text-to-image": ["text"],
    "text-to-video": ["text"],
    "text-to-speech": ["text"],
    "text-to-audio": ["text"],
    "text-to-3d": ["text"],
    "text-generation": ["text"],
    "summarization": ["text"],
    "translation": ["text"],
    "text-classification": ["text"],
    "question-answering": ["text"],
    "image-to-image": ["image"],
    "image-to-text": ["image"],
    "image-to-video": ["image"],
    "image-to-3d": ["image"],
    "image-classification": ["image"],
    "image-segmentation": ["image"],
    "object-detection": ["image"],
    "depth-estimation": ["image"],
    "automatic-speech-recognition": ["audio"],
    "audio-classification": ["audio"],
    "audio-to-audio": ["audio"],
}

TASK_OUTPUT_TYPES: dict[str, list[str]] = {
    "text-to-image": ["image"],
    "text-to-video": ["video"],
    "text-to-speech": ["audio"],
    "text-to-audio": ["audio"],
    "text-to-3d": ["model3d"],
    "text-generation": ["text"],
    "summarization": ["text"],
    "translation": ["text"],
    "text-classification": ["json"],
    "question-answering": ["text"],
    "image-to-image": ["image"],
    "image-to-text": ["text"],
    "image-to-video": ["video"],
    "image-to-3d": ["model3d"],
    "image-classification": ["json"],
    "image-segmentation": ["json"],
    "object-detection": ["json"],
    "depth-estimation": ["image"],
    "automatic-speech-recognition": ["text"],
    "audio-classification": ["json"],
    "audio-to-audio": ["audio"],
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def space_subdomain(repo_id: str) -> str:
    return repo_id.replace("/", "-").replace(".", "-").lower()


def fetch_space_info(repo_id: str) -> tuple[Optional[dict], Optional[str]]:
    base = f"https://{space_subdomain(repo_id)}.hf.space"
    last_err = "unreachable"
    for path in INFO_PATHS:
        try:
            r = httpx.get(base + path, timeout=INFO_TIMEOUT, follow_redirects=True)
        except httpx.HTTPError as e:
            last_err = f"{type(e).__name__}: {e}"
            continue
        if r.status_code == 200:
            try:
                return r.json(), None
            except json.JSONDecodeError:
                last_err = "non-json info response"
                continue
        if r.status_code in (401, 403):
            return None, "gated"
        last_err = f"http {r.status_code}"
    return None, last_err


def fetch_space_runtime(repo_id: str) -> Optional[dict]:
    try:
        r = httpx.get(
            f"https://huggingface.co/api/spaces/{repo_id}?expand[]=runtime",
            timeout=INFO_TIMEOUT,
        )
        if r.status_code == 200:
            return r.json()
    except httpx.HTTPError:
        pass
    return None


def primary_endpoint(info: dict, override: Optional[str]) -> Optional[tuple[str, dict]]:
    UTILITY = (
        "/on_",
        "/handle_",
        "/update_",
        "/prepare_",
        "/load_",
        "/clear_",
        "/reset_",
    )
    named = info.get("named_endpoints") or {}
    unnamed = info.get("unnamed_endpoints") or {}
    all_eps = [
        (n, ep)
        for n, ep in list(named.items()) + list(unnamed.items())
        if not any(n.startswith(p) for p in UTILITY)
    ]
    if override:
        for n, ep in all_eps:
            if n == override:
                return n, ep
    for n, ep in all_eps:
        if n == "/predict":
            return n, ep
    return (all_eps[0][0], all_eps[0][1]) if all_eps else None


def schema_cross_check(ep: dict, task: str) -> Optional[str]:
    expected_in = TASK_INPUT_TYPES.get(task)
    expected_out = TASK_OUTPUT_TYPES.get(task)
    if not expected_in and not expected_out:
        return None

    required_inputs = [
        p for p in (ep.get("parameters") or []) if not p.get("parameter_has_default")
    ]
    if expected_in:
        if len(required_inputs) > len(expected_in) + 2:
            return f"too many required inputs ({len(required_inputs)} > {len(expected_in)})"
    if expected_out:
        returns = ep.get("returns") or []
        if not returns:
            return "endpoint has no return values"
    return None


def default_smoke_inputs(task: str) -> list[Any]:
    if task in ("text-to-image", "text-to-video", "text-to-3d", "text-to-speech", "text-to-audio"):
        return ["a small red square"]
    if task in ("text-generation", "summarization", "translation", "text-classification", "question-answering"):
        return ["hello world"]
    if task in ("image-to-image", "image-to-text", "image-to-video", "image-to-3d",
                "image-classification", "image-segmentation", "object-detection",
                "depth-estimation"):
        return [_tiny_png_data_url()]
    if task in ("automatic-speech-recognition", "audio-classification", "audio-to-audio"):
        return [_tiny_wav_path()]
    return []


def _tiny_png_data_url() -> str:
    raw = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
    )
    return "data:image/png;base64," + base64.b64encode(raw).decode("ascii")


def _tiny_wav_path() -> str:
    import struct
    import tempfile
    import wave

    fd, path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(8000)
        w.writeframes(struct.pack("<" + "h" * 1600, *([0] * 1600)))
    return path


def smoke_inference(
    repo_id: str, endpoint: str, inputs: list[Any], hf_token: Optional[str]
) -> tuple[bool, Optional[str], int]:
    try:
        from gradio_client import Client
    except Exception as e:
        return False, f"gradio_client unavailable: {e}", 0

    started = time.monotonic()
    try:
        client = Client(repo_id, hf_token=hf_token)
        client.predict(*inputs, api_name=endpoint)
    except Exception as e:
        return False, f"{type(e).__name__}: {e}", int((time.monotonic() - started) * 1000)
    return True, None, int((time.monotonic() - started) * 1000)


def validate_space(entry: dict, hf_token: Optional[str], skip_smoke: bool) -> dict:
    repo_id = entry["id"]
    task = entry.get("task", "")
    logger.info("validating space %s", repo_id)
    info, err = fetch_space_info(repo_id)
    if err == "gated":
        return {"last_checked": now_iso(), "status": "gated", "error": "auth required"}
    if info is None:
        rt = fetch_space_runtime(repo_id)
        stage = (rt or {}).get("runtime", {}).get("stage") if rt else None
        if stage in ("SLEEPING", "PAUSED", "STOPPED"):
            return {"last_checked": now_iso(), "status": "sleeping", "error": stage}
        if stage and "ERROR" in str(stage).upper():
            return {"last_checked": now_iso(), "status": "broken", "error": stage}
        return {"last_checked": now_iso(), "status": "unreachable", "error": err}

    pick = primary_endpoint(info, entry.get("endpoint"))
    if not pick:
        return {"last_checked": now_iso(), "status": "broken", "error": "no usable endpoints"}
    ep_name, ep = pick

    if task:
        mismatch = schema_cross_check(ep, task)
        if mismatch:
            return {"last_checked": now_iso(), "status": "schema_mismatch", "error": mismatch}

    if skip_smoke:
        return {"last_checked": now_iso(), "status": "ok", "error": None, "latency_ms": 0, "endpoint": ep_name}

    inputs = entry.get("smoke_inputs")
    inputs_list = (
        list(inputs.values()) if isinstance(inputs, dict) else (inputs or default_smoke_inputs(task))
    )
    ok, err, latency = smoke_inference(repo_id, ep_name, inputs_list, hf_token)
    if not ok:
        msg = (err or "").lower()
        if "401" in msg or "403" in msg or "auth" in msg:
            status = "gated"
        else:
            status = "smoke_failed"
        return {"last_checked": now_iso(), "status": status, "error": err, "latency_ms": latency, "endpoint": ep_name}
    return {
        "last_checked": now_iso(),
        "status": "ok",
        "error": None,
        "latency_ms": latency,
        "endpoint": ep_name,
    }


def validate_model(entry: dict, hf_token: Optional[str]) -> dict:
    repo_id = entry["id"]
    task = entry.get("task", "")
    logger.info("validating model %s", repo_id)
    try:
        r = httpx.get(
            f"https://huggingface.co/api/models/{repo_id}",
            timeout=INFO_TIMEOUT,
            headers={"Authorization": f"Bearer {hf_token}"} if hf_token else {},
        )
    except httpx.HTTPError as e:
        return {"last_checked": now_iso(), "status": "unreachable", "error": str(e)}
    if r.status_code in (401, 403):
        return {"last_checked": now_iso(), "status": "gated", "error": "auth required"}
    if r.status_code != 200:
        return {"last_checked": now_iso(), "status": "unreachable", "error": f"http {r.status_code}"}

    body = r.json()
    actual_task = body.get("pipeline_tag")
    if task and actual_task and actual_task != task:
        return {
            "last_checked": now_iso(),
            "status": "schema_mismatch",
            "error": f"pipeline_tag is {actual_task!r}, manifest says {task!r}",
        }

    try:
        from huggingface_hub import HfApi

        api = HfApi(token=hf_token)
        files = api.list_repo_files(repo_id=repo_id, repo_type="model")
    except Exception as e:
        return {"last_checked": now_iso(), "status": "unreachable", "error": str(e)}

    has_weights = any(
        f.endswith((".safetensors", ".bin", ".gguf", ".onnx", ".pt"))
        for f in files
    )
    if not has_weights:
        return {
            "last_checked": now_iso(),
            "status": "missing_weights",
            "error": "no weight file found",
        }
    return {"last_checked": now_iso(), "status": "ok", "error": None}


def load_manifest(local_path: Optional[str], hf_token: Optional[str]) -> tuple[dict, str]:
    if local_path:
        with open(local_path, encoding="utf-8") as f:
            return json.load(f), local_path
    from huggingface_hub import hf_hub_download

    local = hf_hub_download(
        repo_id=CURATED_DATASET,
        filename=CURATED_FILENAME,
        repo_type="dataset",
        token=hf_token,
    )
    with open(local, encoding="utf-8") as f:
        return json.load(f), f"{CURATED_DATASET}/{CURATED_FILENAME}"


def upload_manifest(payload: dict, hf_token: str) -> None:
    from huggingface_hub import upload_file

    blob = json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8")
    upload_file(
        path_or_fileobj=io.BytesIO(blob),
        path_in_repo=CURATED_FILENAME,
        repo_id=CURATED_DATASET,
        repo_type="dataset",
        token=hf_token,
        commit_message=f"daily validation {now_iso()}",
    )


def main() -> int:
    ap = argparse.ArgumentParser(description="Validate the workflow curated catalog.")
    ap.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't upload the result; print the proposed manifest to stdout.",
    )
    ap.add_argument(
        "--source",
        default=None,
        help="Path to a local manifest JSON instead of the Hub dataset.",
    )
    ap.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Only validate the first N entries (debugging).",
    )
    ap.add_argument(
        "--skip-smoke",
        action="store_true",
        help="Skip the smoke inference; only run the info-endpoint check.",
    )
    ap.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Parallel workers for the info-check phase.",
    )
    args = ap.parse_args()

    hf_token = os.environ.get("HF_TOKEN") or os.environ.get("HF_JOBS_TOKEN")

    payload, src = load_manifest(args.source, hf_token)
    items = payload.get("items") if isinstance(payload, dict) else payload
    if not isinstance(items, list):
        logger.error("manifest at %s is malformed (no `items` array)", src)
        return 2
    if args.limit:
        items = items[: args.limit]

    spaces = [e for e in items if e.get("kind") == "space"]
    models = [e for e in items if e.get("kind") == "model"]
    logger.info(
        "loaded %d entries from %s (%d spaces, %d models)",
        len(items),
        src,
        len(spaces),
        len(models),
    )

    new_items: list[dict] = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {}
        for e in items:
            if e.get("kind") == "space":
                futures[pool.submit(validate_space, e, hf_token, args.skip_smoke)] = e
            elif e.get("kind") == "model":
                futures[pool.submit(validate_model, e, hf_token)] = e
            else:
                new_items.append(e)
        for fut in as_completed(futures):
            entry = futures[fut]
            try:
                result = fut.result()
            except Exception as e:
                result = {
                    "last_checked": now_iso(),
                    "status": "broken",
                    "error": f"validator crashed: {e}",
                }
            updated = dict(entry)
            updated["validation"] = result
            new_items.append(updated)

    order = {e.get("id", ""): i for i, e in enumerate(items)}
    new_items.sort(key=lambda e: order.get(e.get("id", ""), len(items)))

    out_payload = (
        {**payload, "items": new_items, "fetched_at": now_iso()}
        if isinstance(payload, dict)
        else new_items
    )

    statuses: dict[str, int] = {}
    for e in new_items:
        s = (e.get("validation") or {}).get("status", "unknown")
        statuses[s] = statuses.get(s, 0) + 1
    logger.info("results: %s", statuses)

    if args.dry_run:
        json.dump(out_payload, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 0

    if not hf_token:
        logger.error("no HF_TOKEN / HF_JOBS_TOKEN — cannot upload (use --dry-run to preview)")
        return 3
    upload_manifest(out_payload, hf_token)
    logger.info("uploaded manifest to %s", CURATED_DATASET)
    return 0


if __name__ == "__main__":
    sys.exit(main())
