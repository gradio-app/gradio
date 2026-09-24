"""Build the workflow starter templates from live Space API schemas.

Each template is a short spec below; port lists are pulled from each Space's
`/gradio_api/info` at build time so they can't drift from the real signature.

    python scripts/build_workflow_templates.py            # write templates.json
    python scripts/build_workflow_templates.py --upload   # ... and push to the Hub
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from concurrent.futures import ThreadPoolExecutor
from typing import Any, Optional

import httpx

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("build_workflow_templates")

DATASET_REPO = "hmb/workflow-templates"
DATASET_FILE = "templates.json"


def ref(node_id: str, port_type: str, label: str, value: Any = None) -> dict:
    return {
        "role": "reference",
        "id": node_id,
        "asset_type": port_type,
        "label": label,
        "value": value,
    }


def sub(node_id: str, port_type: str, label: str) -> dict:
    return {"role": "subject", "id": node_id, "asset_type": port_type, "label": label}


def op(
    node_id: str,
    space_id: str,
    endpoint: str,
    label: str,
    *,
    overrides: Optional[dict[str, dict]] = None,
    defaults: Optional[dict[str, Any]] = None,
) -> dict:
    """`overrides` patches a badly-described port; `defaults` sets a stored input."""
    return {
        "role": "operator",
        "id": node_id,
        "space_id": space_id,
        "endpoint": endpoint,
        "label": label,
        "overrides": overrides or {},
        "defaults": defaults or {},
    }


FLUX = "black-forest-labs/FLUX.1-schnell"
CAPTION = "ovi054/image-to-prompt"
WHISPER = "openai/whisper"
EDGE_TTS = "innoai/Edge-TTS-Text-to-Speech"
RMBG = "briaai/BRIA-RMBG-2.0"
HUNYUAN3D = "tencent/Hunyuan3D-2.1"

TTS_VOICE = "en-GB-SoniaNeural - en-GB (Female)"

# Whisper labels its first parameter `parameter_0`.
WHISPER_FIX = {"in_0": {"label": "Audio"}, "out_0": {"label": "Transcript"}}
# Hunyuan3D returns the mesh through a generic `File` component.
MESH_FIX = {"out_0": {"label": "Mesh", "type": "model3d"}}


TEMPLATES: list[dict] = [
    {
        "id": "text-to-image",
        "name": "Text to Image",
        "category": "Image",
        "description": "Write a prompt, get an image back from FLUX",
        "accent": "#4fd1a5",
        "gradient": "radial-gradient(ellipse at 15% 85%, #2dd4bf 0%, #0d9488 40%, transparent 70%), radial-gradient(ellipse at 80% 10%, #38bdf8 0%, #0284c7 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #059669 0%, transparent 60%), #0d766e",
        "nodes": [
            ref("prompt", "text", "Prompt", "a lighthouse in a storm, oil painting"),
            op("flux", FLUX, "/infer", "FLUX.1 schnell"),
            sub("image", "image", "Image"),
        ],
        "edges": [("prompt:out", "flux:in_0"), ("flux:out_0", "image:in")],
    },
    {
        "id": "describe-image",
        "name": "Describe an Image",
        "category": "Vision",
        "description": "Get a written description of any photo",
        "accent": "#8b83e8",
        "gradient": "radial-gradient(ellipse at 15% 85%, #a78bfa 0%, #7c3aed 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #818cf8 0%, #4f46e5 45%, transparent 70%), radial-gradient(ellipse at 50% 55%, #6d28d9 0%, transparent 60%), #4c1d95",
        "nodes": [
            ref("photo", "image", "Photo"),
            op("caption", CAPTION, "/predict", "Image to Prompt"),
            sub("description", "text", "Description"),
        ],
        "edges": [("photo:out", "caption:in_0"), ("caption:out_0", "description:in")],
    },
    {
        "id": "transcribe-audio",
        "name": "Transcribe Audio",
        "category": "Audio",
        "description": "Turn a recording into text with Whisper",
        "accent": "#f5a623",
        "gradient": "radial-gradient(ellipse at 15% 85%, #fbbf24 0%, #d97706 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #fb923c 0%, #c2410c 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #b45309 0%, transparent 60%), #78350f",
        "nodes": [
            ref("recording", "audio", "Recording"),
            op("whisper", WHISPER, "/predict", "Whisper", overrides=WHISPER_FIX),
            sub("transcript", "text", "Transcript"),
        ],
        "edges": [
            ("recording:out", "whisper:in_0"),
            ("whisper:out_0", "transcript:in"),
        ],
    },
    {
        "id": "text-to-speech",
        "name": "Text to Speech",
        "category": "Audio",
        "description": "Read any text aloud in a natural voice",
        "accent": "#4d9cf5",
        "gradient": "radial-gradient(ellipse at 15% 85%, #60a5fa 0%, #2563eb 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #22d3ee 0%, #0891b2 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #1d4ed8 0%, transparent 60%), #1e3a8a",
        "nodes": [
            ref(
                "script",
                "text",
                "Script",
                "Hello! This sentence was spoken by a model.",
            ),
            op(
                "tts",
                EDGE_TTS,
                "/tts_interface",
                "Edge TTS",
                defaults={"in_1": TTS_VOICE},
            ),
            sub("speech", "audio", "Speech"),
        ],
        "edges": [("script:out", "tts:in_0"), ("tts:out_0", "speech:in")],
    },
    {
        "id": "remove-background",
        "name": "Remove Background",
        "category": "Image",
        "description": "Cut a subject out of its background",
        "accent": "#34d399",
        "gradient": "radial-gradient(ellipse at 15% 85%, #34d399 0%, #059669 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #a3e635 0%, #65a30d 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #047857 0%, transparent 60%), #064e3b",
        "nodes": [
            ref("photo", "image", "Photo"),
            op("rmbg", RMBG, "/image", "BRIA RMBG 2.0"),
            sub("cutout", "image", "Cutout"),
        ],
        "edges": [("photo:out", "rmbg:in_0"), ("rmbg:out_0", "cutout:in")],
    },
    {
        "id": "photo-to-3d",
        "name": "Photo to 3D Model",
        "category": "3D",
        "description": "Build a 3D mesh from a single photo",
        "accent": "#a78bfa",
        "gradient": "radial-gradient(ellipse at 15% 85%, #c084fc 0%, #7e22ce 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #f472b6 0%, #be185d 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #6b21a8 0%, transparent 60%), #3b0764",
        "nodes": [
            ref("photo", "image", "Photo"),
            op(
                "hunyuan",
                HUNYUAN3D,
                "/shape_generation",
                "Hunyuan3D 2.1",
                overrides=MESH_FIX,
            ),
            sub("mesh", "model3d", "Mesh"),
        ],
        "edges": [("photo:out", "hunyuan:in_0"), ("hunyuan:out_0", "mesh:in")],
    },
    {
        "id": "remix-photo",
        "name": "Remix a Photo",
        "category": "Creative",
        "description": "Describe a photo, then regenerate it as something new",
        "accent": "#f97316",
        "gradient": "radial-gradient(ellipse at 10% 85%, #fb923c 0%, #ea580c 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #f43f5e 0%, #be123c 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #dc2626 0%, transparent 60%), #9a3412",
        "nodes": [
            ref("photo", "image", "Photo"),
            op("caption", CAPTION, "/predict", "Image to Prompt"),
            op("flux", FLUX, "/infer", "FLUX.1 schnell"),
            sub("remix", "image", "Remix"),
        ],
        "edges": [
            ("photo:out", "caption:in_0"),
            ("caption:out_0", "flux:in_0"),
            ("flux:out_0", "remix:in"),
        ],
    },
    {
        "id": "product-cutout",
        "name": "Product Shot",
        "category": "Creative",
        "description": "Generate a product image and cut it out, ready to place",
        "accent": "#22d3ee",
        "gradient": "radial-gradient(ellipse at 15% 85%, #67e8f9 0%, #0891b2 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #818cf8 0%, #4338ca 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #0e7490 0%, transparent 60%), #164e63",
        "nodes": [
            ref(
                "prompt",
                "text",
                "Prompt",
                "a ceramic coffee mug on a plain white background, studio lighting",
            ),
            op("flux", FLUX, "/infer", "FLUX.1 schnell"),
            op("rmbg", RMBG, "/image", "BRIA RMBG 2.0"),
            sub("cutout", "image", "Cutout"),
        ],
        "edges": [
            ("prompt:out", "flux:in_0"),
            ("flux:out_0", "rmbg:in_0"),
            ("rmbg:out_0", "cutout:in"),
        ],
    },
    {
        "id": "speak-an-image",
        "name": "Speak an Image",
        "category": "Multimodal",
        "description": "Say what you want out loud and get a picture of it",
        "accent": "#e879a8",
        "gradient": "radial-gradient(ellipse at 15% 85%, #f472b6 0%, #db2777 40%, transparent 70%), radial-gradient(ellipse at 85% 15%, #fbbf24 0%, #d97706 45%, transparent 70%), radial-gradient(ellipse at 50% 50%, #9d174d 0%, transparent 60%), #831843",
        "nodes": [
            ref("recording", "audio", "Recording"),
            op("whisper", WHISPER, "/predict", "Whisper", overrides=WHISPER_FIX),
            op("flux", FLUX, "/infer", "FLUX.1 schnell"),
            sub("image", "image", "Image"),
        ],
        "edges": [
            ("recording:out", "whisper:in_0"),
            ("whisper:out_0", "flux:in_0"),
            ("flux:out_0", "image:in"),
        ],
    },
]


# Mirrors componentToPortType() in js/workflowcanvas/workflow/space-api.ts.
COMPONENT_PORT: dict[str, str] = {
    "image": "image",
    "imageeditor": "image",
    "imageslider": "image",
    "gallery": "gallery",
    "audio": "audio",
    "video": "video",
    "number": "number",
    "slider": "number",
    "checkbox": "boolean",
    "file": "file",
    "uploadbutton": "file",
    "downloadbutton": "file",
    "model3d": "model3d",
    "json": "json",
    "dataframe": "json",
    "state": "__skip__",
    "textbox": "text",
    "text": "text",
    "markdown": "text",
    "chatbot": "text",
    "label": "text",
    "code": "text",
    "highlightedtext": "text",
    "dropdown": "text",
    "radio": "text",
    "checkboxgroup": "text",
    "colorpicker": "text",
    "html": "text",
}

PRIMITIVE_PORT = {
    "str": "text",
    "string": "text",
    "int": "number",
    "integer": "number",
    "float": "number",
    "bool": "boolean",
    "boolean": "boolean",
}


def _python_type(param: dict) -> str:
    raw = (param.get("python_type") or {}).get("type") or ""
    return raw.lower().removeprefix("none |").removesuffix("| none").strip()


def port_type(param: dict) -> str:
    primitive = PRIMITIVE_PORT.get(_python_type(param))
    if primitive:
        return primitive
    return COMPONENT_PORT.get((param.get("component") or "").lower(), "any")


def choices(param: dict) -> dict:
    """Dropdown/radio enums, so the node stays editable on the canvas."""
    t = param.get("type")
    if not isinstance(t, dict):
        return {}
    if isinstance(t.get("enum"), list) and t["enum"]:
        return {"choices": [str(c) for c in t["enum"]], "multiselect": False}
    items = t.get("items")
    if t.get("type") == "array" and isinstance(items, dict) and items.get("enum"):
        return {"choices": [str(c) for c in items["enum"]], "multiselect": True}
    return {}


def space_url(space_id: str) -> str:
    return (
        "https://" + space_id.replace("/", "-").replace(".", "-").lower() + ".hf.space"
    )


def fetch_api(space_id: str) -> dict:
    last: Exception | None = None
    for path in ("/gradio_api/info", "/info", "/api/info"):
        try:
            resp = httpx.get(space_url(space_id) + path, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:  # noqa: BLE001 — try the next path
            last = e
    raise RuntimeError(f"{space_id}: no reachable API info ({last})")


def build_ports(endpoint_sig: dict, overrides: dict[str, dict]) -> tuple[list, list]:
    inputs = []
    for i, p in enumerate(endpoint_sig.get("parameters") or []):
        ptype = port_type(p)
        if ptype == "__skip__":
            continue
        has_default = p.get("parameter_has_default") is True
        port = {
            "id": f"in_{i}",
            "label": p.get("label") or p.get("parameter_name") or f"Input {i}",
            "type": ptype,
            "required": not has_default,
            **choices(p),
        }
        if has_default and p.get("parameter_default") is not None:
            port["default_value"] = p["parameter_default"]
        port.update(overrides.get(port["id"], {}))
        inputs.append(port)

    outputs = []
    for i, r in enumerate(endpoint_sig.get("returns") or []):
        rtype = port_type(r)
        if rtype == "__skip__":
            continue
        port = {
            "id": f"out_{i}",
            "label": r.get("label") or r.get("parameter_name") or f"Output {i}",
            "type": rtype,
            "output_index": i,
        }
        port.update(overrides.get(port["id"], {}))
        outputs.append(port)

    if not inputs:
        inputs = [{"id": "in", "label": "Input", "type": "any"}]
    if not outputs:
        outputs = [{"id": "out", "label": "Output", "type": "any"}]
    return inputs, outputs


def node_width(label: str, inputs: list, outputs: list) -> int:
    longest = max(len(p["label"]) for p in [*inputs, *outputs, {"label": label}])
    return max(280, min(400, longest * 9 + 100))


COL_GAP = 80
ROW_GAP = 30
ORIGIN = (80, 80)


def columns(nodes: list[dict], edges: list[tuple[str, str]]) -> dict[str, int]:
    """Longest-path depth per node."""
    deps: dict[str, list[str]] = {n["id"]: [] for n in nodes}
    for src, dst in edges:
        deps[dst.split(":")[0]].append(src.split(":")[0])

    depth: dict[str, int] = {}

    def resolve(node_id: str, seen: frozenset[str]) -> int:
        if node_id in depth:
            return depth[node_id]
        if node_id in seen:
            raise ValueError(f"cycle through {node_id}")
        parents = deps[node_id]
        d = 0 if not parents else 1 + max(resolve(p, seen | {node_id}) for p in parents)
        depth[node_id] = d
        return d

    for n in nodes:
        resolve(n["id"], frozenset())
    return depth


def lay_out(
    nodes: list[dict],
    edges: list[tuple[str, str]],
    size: dict[str, tuple[int, int]],
) -> dict[str, tuple[int, int]]:
    """Mirrors autoLayout() in WorkflowCanvas.svelte. Column pitch follows the
    widest node in the column — widths vary with the label, so a fixed one overlaps."""
    depth = columns(nodes, edges)
    by_col: dict[int, list[str]] = {}
    for n in nodes:
        by_col.setdefault(depth[n["id"]], []).append(n["id"])

    pos: dict[str, tuple[int, int]] = {}
    x = ORIGIN[0]
    for col in sorted(by_col):
        y = ORIGIN[1]
        widest = 0
        for node_id in by_col[col]:
            width, height = size[node_id]
            pos[node_id] = (x, y)
            y += height + ROW_GAP
            widest = max(widest, width)
        x += widest + COL_GAP
    return pos


def build_workflow(spec: dict, apis: dict[str, dict]) -> dict:
    references, operators, subjects = [], [], []
    ports_by_node: dict[str, dict[str, str]] = {}
    size: dict[str, tuple[int, int]] = {}

    for n in spec["nodes"]:
        if n["role"] in ("reference", "subject"):
            t = n["asset_type"]
            node = {
                "id": n["id"],
                "role": n["role"],
                "label": n["label"],
                "asset_type": t,
                "inputs": [{"id": "in", "label": n["label"], "type": t}],
                "outputs": [{"id": "out", "label": n["label"], "type": t}],
                "data": {"in": n.get("value")} if n.get("value") is not None else {},
                "x": 0,
                "y": 0,
                "width": 220,
                "height": 130 if t == "number" else 160,
            }
            ports_by_node[n["id"]] = {"in": t, "out": t}
            size[n["id"]] = (node["width"], node["height"])
            (references if n["role"] == "reference" else subjects).append(node)
            continue

        api = apis[n["space_id"]]
        named = api.get("named_endpoints") or {}
        if n["endpoint"] not in named:
            raise RuntimeError(
                f"{spec['id']}: {n['space_id']} has no endpoint {n['endpoint']} "
                f"(has {sorted(named)})"
            )
        inputs, outputs = build_ports(named[n["endpoint"]], n["overrides"])
        data = dict(n["defaults"])
        node = {
            "id": n["id"],
            "role": "operator",
            "kind": "space",
            "label": n["label"],
            "source": f"hf://spaces/{n['space_id']}",
            "space_id": n["space_id"],
            "endpoint": n["endpoint"],
            "runtime": "client",
            "inputs": inputs,
            "outputs": outputs,
            "data": data,
            "x": 0,
            "y": 0,
            "width": node_width(n["label"], inputs, outputs),
            "height": 90,
        }
        ports_by_node[n["id"]] = {p["id"]: p["type"] for p in [*inputs, *outputs]}
        size[n["id"]] = (node["width"], node["height"])
        operators.append(node)

    pos = lay_out(spec["nodes"], spec["edges"], size)
    for node in (*references, *operators, *subjects):
        node["x"], node["y"] = pos[node["id"]]

    edges = []
    for i, (src, dst) in enumerate(spec["edges"]):
        from_node, from_port = src.split(":")
        to_node, to_port = dst.split(":")
        src_type = ports_by_node[from_node][from_port]
        dst_type = ports_by_node[to_node][to_port]
        if src_type != dst_type and "any" not in (src_type, dst_type):
            raise RuntimeError(
                f"{spec['id']}: {src} ({src_type}) -> {dst} ({dst_type}) type mismatch"
            )
        edges.append(
            {
                "id": f"e{i}",
                "from_node_id": from_node,
                "from_port_id": from_port,
                "to_node_id": to_node,
                "to_port_id": to_port,
                "type": src_type,
            }
        )

    return {
        "schema_version": "2",
        "name": spec["name"],
        "description": spec["description"],
        "runtime": {"default": "client"},
        "references": references,
        "operators": operators,
        "subjects": subjects,
        "edges": edges,
        "view": {"default": "canvas"},
    }


def build_all() -> list[dict]:
    space_ids = sorted(
        {
            n["space_id"]
            for t in TEMPLATES
            for n in t["nodes"]
            if n["role"] == "operator"
        }
    )
    logger.info("fetching %d Space schemas", len(space_ids))
    with ThreadPoolExecutor(max_workers=8) as pool:
        apis = dict(zip(space_ids, pool.map(fetch_api, space_ids)))

    templates = []
    for spec in TEMPLATES:
        templates.append(
            {
                "id": spec["id"],
                "name": spec["name"],
                "category": spec["category"],
                "description": spec["description"],
                "accent": spec["accent"],
                "gradient": spec["gradient"],
                "workflow": build_workflow(spec, apis),
            }
        )
        logger.info("built %s", spec["id"])

    return templates


def upload(templates: list[dict]) -> None:
    from huggingface_hub import HfApi

    api = HfApi()
    api.create_repo(DATASET_REPO, repo_type="dataset", exist_ok=True)
    api.upload_file(
        path_or_fileobj=json.dumps(templates, indent=1).encode(),
        path_in_repo=DATASET_FILE,
        repo_id=DATASET_REPO,
        repo_type="dataset",
        commit_message=f"Update workflow templates ({len(templates)})",
    )
    logger.info(
        "uploaded to https://huggingface.co/datasets/%s/blob/main/%s",
        DATASET_REPO,
        DATASET_FILE,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--upload", action="store_true", help="push to the Hub dataset")
    parser.add_argument("--out", default=DATASET_FILE, help="where to write the JSON")
    args = parser.parse_args()

    templates = build_all()
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(templates, f, indent=1)
    logger.info("wrote %s", args.out)
    if args.upload:
        upload(templates)
    return 0


if __name__ == "__main__":
    sys.exit(main())
