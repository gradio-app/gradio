"""Server-side execution of `gr.Workflow` graphs, for exposing each workflow
subject (output node) as a regular Gradio API endpoint.

The canvas executes a workflow client-side (see
`js/workflowcanvas/workflow/workflow-executor.ts`). This module ports that
orchestration to Python so a workflow can be run headlessly — once per subject's
upstream sub-DAG — and wired into Gradio's normal `/info` + `/call` machinery.

Pure graph helpers live in `workflow_graph.py`; they are re-exported here for
backward compatibility.
"""

from __future__ import annotations

import concurrent.futures
import contextlib
import inspect
import json
import logging
import re
from collections.abc import Callable
from typing import Any, Optional

from gradio.workflow_graph import (
    WorkflowGraph,
    free_inputs,
    group_free_inputs,
    subject_groups,
    subject_output_type,
    topo_layers,
    topo_sort,
    upstream_node_ids,
)

__all__ = [
    "WorkflowGraph",
    "free_inputs",
    "group_free_inputs",
    "subject_groups",
    "subject_output_type",
    "topo_layers",
    "topo_sort",
    "upstream_node_ids",
]

logger = logging.getLogger(__name__)


@contextlib.contextmanager
def _active_blocks(blocks):
    """Make `blocks` the active render target so components/events register into
    it, without entering `Blocks.__exit__` — which would re-run
    `attach_load_events` (duplicating the canvas's callable-`value` load event)
    and recreate the running `App`. We only need the render-context primitives,
    restored afterward."""
    from gradio.context import Context

    prev_root, prev_block = Context.root_block, Context.block
    Context.root_block = blocks
    Context.block = blocks
    try:
        yield
    finally:
        Context.root_block = prev_root
        Context.block = prev_block


# Port types the canvas treats as files/media (mirrors MEDIA_PORT_TYPES in
# workflow-executor.ts). Values for these ports travel as `{path|url}` dicts
# rather than scalars.
MEDIA_PORT_TYPES = {"image", "audio", "video", "file", "gallery", "model3d"}


# ─────────────────────────────────────────────────────────────────────────────
# Value marshalling (port of toGradioArg / fromGradioOutput / pick_response_item)
# ─────────────────────────────────────────────────────────────────────────────


def _to_arg(value: Any, port_type: str) -> Any:
    """Convert an endpoint input value into the shape the workflow server
    functions expect. Media ports arrive as a local filepath (from the output
    component) or a FileData-like dict; wrap a bare path as `{"path": ...}` so
    `call_space` runs it through `handle_file`. Scalars pass through."""
    if value is None:
        return None
    if port_type in MEDIA_PORT_TYPES:
        if isinstance(value, dict):
            return value  # already {path|url|...}
        if isinstance(value, str):
            return {"path": value}
        return value
    return value


def _output_matches_port_type(item: Any, port_type: str) -> bool:
    if item is None:
        return False
    if port_type in MEDIA_PORT_TYPES:
        if isinstance(item, str):
            return item.startswith(("http://", "https://", "blob:", "data:", "/"))
        return isinstance(item, dict) and ("path" in item or "url" in item)
    if port_type == "text":
        return isinstance(item, str)
    if port_type == "number":
        return isinstance(item, (int, float)) and not isinstance(item, bool)
    if port_type == "boolean":
        return isinstance(item, bool)
    if port_type == "json":
        return isinstance(item, (dict, list))
    return True


def _pick_response_item(
    port: dict, port_index: int, output_data: list, total_ports: int
) -> Any:
    """Select which element of a multi-output response feeds a given output
    port. Mirrors `pick_response_item` in workflow-executor.ts: honor an
    explicit `output_index`, else position, else shape-match by port type."""
    output_index = port.get("output_index")
    if isinstance(output_index, int):
        primary = output_data[output_index] if output_index < len(output_data) else None
    elif total_ports == 1 and len(output_data) > 1:
        primary = None
    else:
        primary = output_data[port_index] if port_index < len(output_data) else None

    if primary is not None and _output_matches_port_type(primary, port.get("type", "")):
        return primary

    for item in output_data:
        if _output_matches_port_type(item, port.get("type", "")):
            return item

    if primary is not None:
        return primary
    return output_data[0] if output_data else None


def _from_output(value: Any) -> Any:
    """Normalize a value coming out of the executor for the endpoint's output
    component. File dicts → local path (preferred) or url; scalars pass
    through. The internal `{path,url,is_file}` shape (from `call_space`) is
    consumable by downstream operators as-is, so this only runs for the final
    subject value handed to the output component."""
    if isinstance(value, dict):
        return value.get("path") or value.get("url") or value
    return value


# ─────────────────────────────────────────────────────────────────────────────
# Executor
# ─────────────────────────────────────────────────────────────────────────────


class WorkflowExecutionError(Exception):
    """Raised when a node in the workflow fails; the message is suitable for
    surfacing to an API caller."""


class WorkflowExecutor:
    """Runs a subject's upstream sub-DAG server-side.

    `callers` maps operator kinds to the workflow server-functions, each with
    the signature `(data: list, request, token) -> str` (a JSON string, either
    a list of outputs or an `{"error": ...}` dict) — exactly the existing
    `call_space` / `call_model` / `call_fn` / `fetch_dataset`.
    """

    def __init__(self, graph: WorkflowGraph, callers: dict[str, Callable]):
        self.graph = graph
        self.callers = callers

    def run(
        self,
        subject_id: str,
        inputs: dict[str, Any],
        request: Any = None,
        token: Any = None,
    ) -> Any:
        """Execute the subgraph feeding `subject_id`. `inputs` maps free-input
        reference node id → value. Returns the subject's output value."""
        return self.run_many([subject_id], inputs, request, token)[0]

    def run_many(
        self,
        subject_ids: list[str],
        inputs: dict[str, Any],
        request: Any = None,
        token: Any = None,
    ) -> list[Any]:
        """Execute the combined subgraph feeding all `subject_ids` in a single
        pass and return one output value per subject, in order. Nodes shared
        between outputs (e.g. an operator with two outputs wired to two subjects)
        run exactly once rather than once per subject."""
        graph = self.graph
        for sid in subject_ids:
            if graph.role_by_id.get(sid) != "subject":
                raise WorkflowExecutionError(f"No such workflow output: {sid}")

        sub_ids: set[str] = set()
        for sid in subject_ids:
            sub_ids |= upstream_node_ids(graph, sid)
        layers = topo_layers(sorted(sub_ids), graph.edges)
        data_map: dict[str, dict[str, Any]] = {}

        self._request = request
        self._token = token

        max_width = max((len(layer) for layer in layers), default=1)
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_width) as pool:
            for layer in layers:
                futs = [
                    pool.submit(self._execute_node, nid, data_map, inputs)
                    for nid in layer
                ]
                for fut in concurrent.futures.as_completed(futs):
                    fut.result()  # propagate any node exception immediately

        outputs: list[Any] = []
        for sid in subject_ids:
            in_ports = graph.node_by_id[sid].get("inputs") or []
            if not in_ports:
                outputs.append(None)
                continue
            value = data_map.get(sid, {}).get(in_ports[0]["id"])
            outputs.append(_from_output(value))
        return outputs

    # -- internals ----------------------------------------------------------

    def _resolve_inputs(
        self, node: dict, data_map: dict[str, dict[str, Any]]
    ) -> dict[str, Any]:
        graph = self.graph
        resolved: dict[str, Any] = {}
        for port in node.get("inputs") or []:
            edge = graph.incoming_edge(node["id"], port["id"])
            if edge:
                resolved[port["id"]] = data_map.get(edge["from_node_id"], {}).get(
                    edge["from_port_id"]
                )
            else:
                data = node.get("data") or {}
                resolved[port["id"]] = data.get(port["id"], port.get("default_value"))
        return resolved

    def _execute_node(
        self,
        node_id: str,
        data_map: dict[str, dict[str, Any]],
        inputs: dict[str, Any],
    ) -> None:
        graph = self.graph
        node = graph.node_by_id[node_id]
        role = graph.role_by_id[node_id]

        if role == "reference":
            if graph.has_incoming(node_id):
                self._relay(node, data_map)  # computed reference (relay)
            else:
                self._seed_input(node, data_map, inputs)  # free input
            return

        if role == "subject":
            self._relay(node, data_map)
            return

        # operator
        kind = node.get("kind")
        if kind == "fn":
            self._run_fn(node, data_map)
        elif kind == "model":
            self._run_model(node, data_map)
        elif kind == "dataset":
            self._run_dataset(node, data_map)
        else:  # "space" (default)
            self._run_space(node, data_map)

    def _seed_input(
        self, node: dict, data_map: dict[str, dict[str, Any]], inputs: dict[str, Any]
    ) -> None:
        value = inputs.get(node["id"])
        bucket: dict[str, Any] = {}
        for port in node.get("outputs") or []:
            bucket[port["id"]] = _to_arg(value, port.get("type", "text"))
        data_map[node["id"]] = bucket

    def _relay(self, node: dict, data_map: dict[str, dict[str, Any]]) -> None:
        resolved = self._resolve_inputs(node, data_map)
        in_ports = node.get("inputs") or []
        bucket: dict[str, Any] = {}
        if in_ports:
            value = resolved[in_ports[0]["id"]]
            bucket[in_ports[0]["id"]] = value
            for port in node.get("outputs") or []:
                bucket[port["id"]] = value
        data_map[node["id"]] = bucket

    def _require(self, node: dict, resolved: dict[str, Any]) -> None:
        for port in node.get("inputs") or []:
            if port.get("required") and resolved.get(port["id"]) is None:
                raise WorkflowExecutionError(
                    f'"{port.get("label", port["id"])}" is required by '
                    f'"{node.get("label", node["id"])}" but was not provided'
                )

    def _call(self, kind: str, data: list) -> list:
        caller = self.callers.get(kind)
        if caller is None:
            raise WorkflowExecutionError(f"No executor available for '{kind}' nodes")
        result_json = caller(data, self._request, self._token)
        parsed = json.loads(result_json)
        if isinstance(parsed, dict) and "error" in parsed:
            msg = (
                parsed.get("suggestion")
                or parsed.get("error")
                or "Workflow node failed"
            )
            raise WorkflowExecutionError(msg)
        return parsed if isinstance(parsed, list) else [parsed]

    def _map_outputs(
        self, node: dict, output_data: list, data_map: dict[str, dict[str, Any]]
    ) -> None:
        bucket: dict[str, Any] = {}
        out_ports = node.get("outputs") or []
        for i, port in enumerate(out_ports):
            bucket[port["id"]] = _pick_response_item(
                port, i, output_data, len(out_ports)
            )
        data_map[node["id"]] = bucket

    def _run_space(self, node: dict, data_map: dict[str, dict[str, Any]]) -> None:
        resolved = self._resolve_inputs(node, data_map)
        self._require(node, resolved)
        args = [resolved[p["id"]] for p in node.get("inputs") or []]
        endpoint = node.get("endpoint") or "/predict"
        output_data = self._call(
            "space", [node.get("space_id"), endpoint, json.dumps(args)]
        )
        self._map_outputs(node, output_data, data_map)

    def _run_model(self, node: dict, data_map: dict[str, dict[str, Any]]) -> None:
        resolved = self._resolve_inputs(node, data_map)
        self._require(node, resolved)
        args = [resolved[p["id"]] for p in node.get("inputs") or []]
        tag = node.get("pipeline_tag") or "text-generation"
        provider = node.get("provider") or "auto"
        output_data = self._call(
            "model", [node.get("model_id"), tag, json.dumps(args), None, provider]
        )
        self._map_outputs(node, output_data, data_map)

    def _run_fn(self, node: dict, data_map: dict[str, dict[str, Any]]) -> None:
        resolved = self._resolve_inputs(node, data_map)
        self._require(node, resolved)
        args = [resolved[p["id"]] for p in node.get("inputs") or []]
        output_data = self._call("fn", [node.get("fn"), json.dumps(args)])
        self._map_outputs(node, output_data, data_map)

    def _run_dataset(self, node: dict, data_map: dict[str, dict[str, Any]]) -> None:
        resolved = self._resolve_inputs(node, data_map)
        raw = resolved.get("row_index") or 0
        try:
            offset = max(0, int(raw))
        except (TypeError, ValueError):
            offset = 0
        output_data = self._call(
            "dataset",
            [
                node.get("dataset_id"),
                node.get("dataset_config") or "default",
                node.get("dataset_split") or "train",
                str(offset),
                "1",
            ],
        )
        # fetch_dataset returns {config, split, features, rows}; map the first
        # row onto output ports by label (mirrors the dataset branch in the TS
        # executor). Media cells arrive as `{src: url}` → normalize to a file
        # value. Kept lenient — dataset operators are rarely terminal.
        result = output_data[0] if output_data else {}
        rows = result.get("rows") if isinstance(result, dict) else None
        row = (rows[0] if rows else {}) if isinstance(rows, list) else {}
        bucket: dict[str, Any] = {}
        for port in node.get("outputs") or []:
            value = row.get(port.get("label"))
            if isinstance(value, dict) and "src" in value:
                value = {"url": value["src"]}
            bucket[port["id"]] = value
        data_map[node["id"]] = bucket


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint registration (B2: explicit, hidden components reusing /info + /call)
# ─────────────────────────────────────────────────────────────────────────────


def _slugify(label: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", (label or "").strip().lower()).strip("_")
    return slug or "endpoint"


# Workflow port type → the Python type a gradio_client caller passes/receives,
# for display in the "View API" panel and generated snippets.
_PY_TYPE = {
    "text": "str",
    "number": "float",
    "boolean": "bool",
    "image": "filepath",
    "audio": "filepath",
    "video": "filepath",
    "model3d": "filepath",
    "3d": "filepath",
    "file": "filepath",
    "gallery": "list[filepath]",
    "dataframe": "list[list]",
    "json": "dict",
}


def _group_slug_iter(groups: list[list[dict]]):
    """Yield (group, api_name) with the dedup used at registration, so the
    described endpoints line up with the ones actually registered. The slug is
    derived from the group's first subject label."""
    used: set[str] = set()
    for group in groups:
        api_name = _slugify(group[0].get("label", "output"))
        while api_name in used:
            api_name = f"{api_name}_"
        used.add(api_name)
        yield group, api_name


def describe_workflow_api(graph: WorkflowGraph) -> list[dict]:
    """Describe each subject endpoint for the frontend "View API" panel:
    `api_name`, label, parameters (free inputs), and the return type. Mirrors
    the schema that `register_workflow_endpoints` exposes via `/info`."""
    endpoints = []
    for group, api_name in _group_slug_iter(subject_groups(graph)):
        frees = group_free_inputs(graph, group)
        endpoints.append(
            {
                "api_name": "/" + api_name,
                "label": group[0].get("label", "output"),
                "parameters": [
                    {
                        "label": f["label"],
                        "parameter_name": f"in_{i}",
                        "type": f["type"],
                        "python_type": _PY_TYPE.get(f["type"], "str"),
                    }
                    for i, f in enumerate(frees)
                ],
                "returns": [
                    {
                        "label": subject.get("label", "output"),
                        "type": subject_output_type(subject),
                        "python_type": _PY_TYPE.get(
                            subject_output_type(subject), "str"
                        ),
                    }
                    for subject in group
                ],
            }
        )
    return endpoints


def port_to_component(port_type: str, label: str):
    """Map a workflow port type to a Gradio component for the API schema. Real
    components are used (not `gr.api` type hints) so multimodal I/O round-trips
    via their proven `api_info` / `FileData` handling. Created unrendered; the
    caller renders them inside a hidden container so they reach `/info`."""
    import gradio as gr

    label = label or port_type
    if port_type == "image":
        return gr.Image(label=label, type="filepath", render=False)
    if port_type == "audio":
        return gr.Audio(label=label, type="filepath", render=False)
    if port_type == "video":
        return gr.Video(label=label, render=False)
    if port_type in ("model3d", "3d"):
        return gr.Model3D(label=label, render=False)
    if port_type == "file":
        return gr.File(label=label, type="filepath", render=False)
    if port_type == "number":
        return gr.Number(label=label, render=False)
    if port_type == "boolean":
        return gr.Checkbox(label=label, render=False)
    if port_type == "dataframe":
        return gr.Dataframe(label=label, render=False)
    if port_type == "gallery":
        return gr.Gallery(label=label, render=False)
    if port_type == "json":
        return gr.JSON(label=label, render=False)
    return gr.Textbox(label=label, render=False)


def _build_endpoint_fn(
    get_graph: Callable[[], Optional[WorkflowGraph]],
    subject_ids: list[str],
    free_ids: list[str],
    callers: dict[str, Callable],
):
    """Build the callable backing one subgraph endpoint. `subject_ids` are all
    the outputs of the subgraph; with more than one the endpoint returns a tuple
    (matching its multiple output components), otherwise a single value.

    Execution re-reads the *current* graph via `get_graph()` so operator and
    wiring edits take effect without a restart. The advertised signature
    (positional input per free reference, plus `request`/`token`) is synthesized
    so Gradio's `special_args` injects the request and OAuth token, letting the
    executor reuse the workflow's token resolution for downstream calls.
    """
    from gradio.oauth import OAuthToken
    from gradio.route_utils import Request

    def endpoint(*args):
        *input_values, request, token = args
        graph = get_graph()
        if graph is None:
            raise WorkflowExecutionError("Workflow graph is unavailable")
        inputs = dict(zip(free_ids, input_values))
        results = WorkflowExecutor(graph, callers).run_many(
            subject_ids, inputs, request, token
        )
        return results[0] if len(results) == 1 else tuple(results)

    params = [
        inspect.Parameter(f"in_{i}", inspect.Parameter.POSITIONAL_OR_KEYWORD)
        for i in range(len(free_ids))
    ]
    params.append(
        inspect.Parameter(
            "request",
            inspect.Parameter.POSITIONAL_OR_KEYWORD,
            default=None,
            annotation=Optional[Request],
        )
    )
    params.append(
        inspect.Parameter(
            "token",
            inspect.Parameter.POSITIONAL_OR_KEYWORD,
            default=None,
            annotation=Optional[OAuthToken],
        )
    )
    endpoint.__signature__ = inspect.Signature(params)  # type: ignore[attr-defined]
    endpoint.__annotations__ = {
        "request": Optional[Request],
        "token": Optional[OAuthToken],
    }
    return endpoint


class WorkflowEndpointManager:
    """Owns the lifecycle of the per-subject API endpoints and keeps them in
    sync with the workflow graph.

    Each `sync()` tears down the previously-registered endpoints (their
    components via `unrender()` and their event triggers from `blocks.fns`) and
    rebuilds from the current graph, then refreshes the cached `/config` and
    invalidates the `/info` cache so a running server reflects the change. This
    lets the API track live edits: adding, removing, renaming, or retyping a
    subject all re-derive the endpoint set on the next save.
    """

    def __init__(
        self,
        blocks,
        get_graph: Callable[[], Optional[WorkflowGraph]],
        callers: dict[str, Callable],
    ):
        self.blocks = blocks
        self.get_graph = get_graph
        self.callers = callers
        self._blocks_created: list = []
        self._fn_ids: list[int] = []
        self.api_names: list[str] = []

    def sync(self) -> list[str]:
        """Re-derive endpoints from the current graph. Safe to call repeatedly;
        the first call registers, later calls reconcile."""
        self._teardown()
        graph = self.get_graph()
        if graph is not None and graph.subjects:
            self._register(graph)
        self._refresh_app()
        return list(self.api_names)

    # -- internals ----------------------------------------------------------

    def _teardown(self) -> None:
        if self._blocks_created:
            # unrender() needs the Blocks as the active context to remove blocks
            # from its layout + id map.
            with _active_blocks(self.blocks):
                for block in self._blocks_created:
                    block.unrender()
        for fn_id in self._fn_ids:
            self.blocks.fns.pop(fn_id, None)
        self._blocks_created = []
        self._fn_ids = []
        self.api_names = []

    def _register(self, graph: WorkflowGraph) -> None:
        import gradio as gr

        before = set(self.blocks.fns.keys())
        with _active_blocks(self.blocks), gr.Column(visible=False) as col:
            self._blocks_created.append(col)
            for group, api_name in _group_slug_iter(subject_groups(graph)):
                frees = group_free_inputs(graph, group)
                input_components = [
                    port_to_component(f["type"], f["label"]) for f in frees
                ]
                for c in input_components:
                    c.render()
                    self._blocks_created.append(c)
                output_components = []
                for subject in group:
                    oc = port_to_component(
                        subject_output_type(subject), subject.get("label", "output")
                    )
                    oc.render()
                    self._blocks_created.append(oc)
                    output_components.append(oc)

                fn = _build_endpoint_fn(
                    self.get_graph,
                    [s["id"] for s in group],
                    [f["node"]["id"] for f in frees],
                    self.callers,
                )
                trigger = gr.Button(visible=False)
                self._blocks_created.append(trigger)
                trigger.click(
                    fn,
                    inputs=input_components,
                    outputs=output_components
                    if len(output_components) > 1
                    else output_components[0],
                    api_name=api_name,
                )
                self.api_names.append(api_name)
        # New event triggers added during registration (the order of insertion
        # into the fns dict is the set difference from the pre-register snapshot).
        self._fn_ids = [fid for fid in self.blocks.fns if fid not in before]

    def _refresh_app(self) -> None:
        """After the endpoint set changes, refresh the cached config and (if
        running) invalidate the `/info` cache.

        `get_api_info` reads `self.config`, and `/config` serves a copy of it to
        new page loads / `gradio_client` connections — so it must be regenerated
        whenever the components or dependencies change. (The normal
        `Blocks.__exit__` does this; our manual render context does not.)"""
        try:
            self.blocks.config = self.blocks.get_config_file()
        except Exception:
            logger.debug("Workflow: failed to refresh config", exc_info=True)
        app = getattr(self.blocks, "server_app", None)
        if app is not None:
            app.api_info = None
            app.all_app_info = None


def register_workflow_endpoints(
    blocks,
    get_graph: Callable[[], Optional[WorkflowGraph]],
    callers: dict[str, Callable],
) -> WorkflowEndpointManager:
    """Create a `WorkflowEndpointManager` and register the initial endpoint set
    from the current graph. Returns the manager so the caller can `.sync()` it
    again whenever the graph is saved."""
    manager = WorkflowEndpointManager(blocks, get_graph, callers)
    manager.sync()
    return manager
