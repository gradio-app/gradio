"""Harvest workflow-curated *candidates* from the Hugging Face Hub.

This does the automatable half of building the curated catalog: for each task in
the taxonomy it pulls the most-liked running Spaces, derives the objective fields
(id, zero_gpu, title, modality, space_category), and emits a candidate pool in the
same envelope `scripts/validate_workflow_curated.py` and `gradio/workflow.py` expect.

It deliberately does NOT pick the final set. Review the output, drop the junk, set
`featured`, polish `description`, then run:

    python scripts/build_workflow_curated.py --per-task 15 --out curated.candidates.json
    # ... hand-trim curated.candidates.json into curated.json ...
    python scripts/validate_workflow_curated.py --source curated.json --dry-run

Selection: top-N Spaces per task (coverage), not global popularity.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("build_workflow_curated")

# task -> (modality, space_category). Keys define which tasks we query.
# space_category is None for tasks that aren't a distinct generative node category.
TASK_META: dict[str, tuple[str, Optional[str]]] = {
    "text-to-image": ("image", "image-generation"),
    "image-to-image": ("image", "image-editing"),
    "image-to-text": ("text", None),
    "image-to-3d": ("3d", "3d-modeling"),
    "text-to-3d": ("3d", "3d-modeling"),
    "text-to-video": ("video", "video-generation"),
    "image-to-video": ("video", "video-generation"),
    "text-to-speech": ("audio", "speech-synthesis"),
    "text-to-audio": ("audio", "music-generation"),
    "automatic-speech-recognition": ("audio", "automatic-speech-recognition"),
    "audio-to-audio": ("audio", None),
    "image-classification": ("image", None),
    "image-segmentation": ("image", None),
    "object-detection": ("image", None),
    "depth-estimation": ("image", None),
    "text-generation": ("text", None),
    "summarization": ("text", None),
    "translation": ("text", None),
    "question-answering": ("text", None),
}

# Hub runtime stages we treat as "usable enough to keep as a candidate".
LIVE_STAGES = {"RUNNING", "SLEEPING", "RUNNING_BUILDING", "RUNNING_APP_STARTING"}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _attr(obj: Any, name: str, default: Any = None) -> Any:
    """Read `name` from an object attr or a dict key, whichever exists."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(name, default)
    return getattr(obj, name, default)


def _card_dict(space: Any) -> dict:
    cd = _attr(space, "card_data") or _attr(space, "cardData")
    if cd is None:
        return {}
    if isinstance(cd, dict):
        return cd
    if hasattr(cd, "to_dict"):
        try:
            return cd.to_dict()
        except Exception:
            pass
    return {}


def _detect_zero_gpu(space: Any) -> bool:
    runtime = _attr(space, "runtime") or {}
    hw = _attr(runtime, "hardware") or {}
    # hardware can be {"current": "zero-a10g", "requested": "zero-a10g"} or a bare str
    vals = []
    if isinstance(hw, dict):
        vals = [hw.get("current"), hw.get("requested")]
    else:
        vals = [hw]
    return any(isinstance(v, str) and "zero" in v.lower() for v in vals)


def _stage(space: Any) -> Optional[str]:
    runtime = _attr(space, "runtime") or {}
    return _attr(runtime, "stage")


def _title(space: Any, repo_id: str) -> str:
    card = _card_dict(space)
    title = (card.get("title") or "").strip()
    if title:
        return title
    name = repo_id.split("/")[-1].replace("-", " ").replace("_", " ").strip()
    return name[:1].upper() + name[1:] if name else repo_id


def _description(space: Any) -> str:
    card = _card_dict(space)
    return (card.get("short_description") or "").strip()


def harvest_task(
    api: Any,
    task: str,
    per_task: int,
    min_likes: int,
    allowed_sdks: set[str],
    running_only: bool,
) -> list[dict]:
    modality, category = TASK_META[task]
    try:
        spaces = api.list_spaces(
            filter=task,
            sort="likes",
            direction=-1,
            limit=max(per_task * 4, 40),  # over-fetch; filtering drops many
            expand=["cardData", "likes", "trendingScore", "sdk", "runtime"],
        )
    except Exception as e:
        logger.warning("list_spaces(%s) failed: %s", task, e)
        return []

    out: list[dict] = []
    for space in spaces:
        repo_id = _attr(space, "id")
        if not repo_id:
            continue
        sdk = (_attr(space, "sdk") or "").lower()
        if allowed_sdks and sdk and sdk not in allowed_sdks:
            continue
        likes = _attr(space, "likes") or 0
        if likes < min_likes:
            continue
        stage = _stage(space)
        if running_only and stage is not None and stage not in LIVE_STAGES:
            continue

        out.append(
            {
                "kind": "space",
                "id": repo_id,
                "task": task,
                "space_category": category,
                "modality": modality,
                "title": _title(space, repo_id),
                "description": _description(space),
                "added_at": now_iso(),
                "featured": False,
                "zero_gpu": _detect_zero_gpu(space),
                "_likes": likes,  # kept only for sorting/trimming; strip before upload
            }
        )
        if len(out) >= per_task:
            break
    logger.info("task %-28s -> %d candidates", task, len(out))
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--per-task", type=int, default=12, help="Max Spaces kept per task.")
    ap.add_argument("--min-likes", type=int, default=5, help="Drop Spaces below this many likes.")
    ap.add_argument(
        "--tasks",
        default=None,
        help="Comma-separated subset of tasks to query (default: all in TASK_META).",
    )
    ap.add_argument(
        "--sdk",
        default="gradio,docker",
        help="Allowed Space SDKs, comma-separated. Empty string = any.",
    )
    ap.add_argument(
        "--all-stages",
        action="store_true",
        help="Keep Spaces regardless of runtime stage (default keeps only live-ish ones).",
    )
    ap.add_argument("--out", default="curated.candidates.json", help="Output path.")
    args = ap.parse_args()

    try:
        from huggingface_hub import HfApi
    except Exception as e:
        logger.error("huggingface_hub is required: %s", e)
        return 2

    api = HfApi()
    tasks = (
        [t.strip() for t in args.tasks.split(",") if t.strip()]
        if args.tasks
        else list(TASK_META)
    )
    unknown = [t for t in tasks if t not in TASK_META]
    if unknown:
        logger.error("unknown tasks (add them to TASK_META first): %s", unknown)
        return 2

    allowed_sdks = {s.strip().lower() for s in args.sdk.split(",") if s.strip()}

    by_id: dict[str, dict] = {}
    for task in tasks:
        for cand in harvest_task(
            api, task, args.per_task, args.min_likes, allowed_sdks, not args.all_stages
        ):
            # First task that surfaces a Space wins; record the dupe for review.
            if cand["id"] in by_id:
                by_id[cand["id"]].setdefault("_also_matched", []).append(task)
                continue
            by_id[cand["id"]] = cand

    items = sorted(by_id.values(), key=lambda e: e.pop("_likes", 0), reverse=True)

    payload = {"snapshot_version": 2, "fetched_at": now_iso(), "items": items}
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # summary
    import collections

    by_modality = collections.Counter(e["modality"] for e in items)
    zero = sum(1 for e in items if e["zero_gpu"])
    logger.info(
        "wrote %d candidate spaces to %s  (%d zero-gpu)  modalities=%s",
        len(items),
        args.out,
        zero,
        dict(by_modality),
    )
    logger.info(
        "next: trim %s by hand (drop junk, set `featured`, write `description`, "
        "remove any `_also_matched`), rename to curated.json, then run "
        "`python scripts/validate_workflow_curated.py --source curated.json --dry-run`",
        args.out,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
