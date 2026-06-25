"""Pure graph helpers for `gr.Workflow` — parsing, traversal, and topological
ordering. No Gradio or network dependencies; unit-tested directly."""

from __future__ import annotations

import json
from collections import deque
from typing import Any


class WorkflowGraph:
    """Parsed, indexed view of a schema-v2 workflow dict.

    Holds the three role collections (references / operators / subjects) plus a
    flat id index and edge adjacency, so the executor and endpoint registration
    don't re-scan lists repeatedly.
    """

    def __init__(self, data: dict[str, Any]):
        if not isinstance(data, dict):
            raise ValueError("Workflow graph must be a JSON object")
        self.raw = data
        self.name: str = data.get("name") or "Workflow"
        self.references: list[dict] = self._list_field(data, "references")
        self.operators: list[dict] = self._list_field(data, "operators")
        self.subjects: list[dict] = self._list_field(data, "subjects")
        self.edges: list[dict] = self._list_field(data, "edges")

        self.node_by_id: dict[str, dict] = {}
        self.role_by_id: dict[str, str] = {}
        for role, nodes in (
            ("reference", self.references),
            ("operator", self.operators),
            ("subject", self.subjects),
        ):
            for i, n in enumerate(nodes):
                if not isinstance(n, dict):
                    raise ValueError(f"Workflow {role} at index {i} must be an object")
                node_id = n.get("id")
                if not isinstance(node_id, str) or not node_id:
                    raise ValueError(f"Workflow {role} at index {i} is missing an id")
                if node_id in self.node_by_id:
                    raise ValueError(f"Workflow contains duplicate node id: {node_id}")
                self.node_by_id[node_id] = n
                self.role_by_id[node_id] = role

        for i, e in enumerate(self.edges):
            if not isinstance(e, dict):
                raise ValueError(f"Workflow edge at index {i} must be an object")
            for key in ("from_node_id", "from_port_id", "to_node_id", "to_port_id"):
                if not isinstance(e.get(key), str) or not e.get(key):
                    raise ValueError(f"Workflow edge at index {i} is missing {key}")

    @staticmethod
    def _list_field(data: dict[str, Any], key: str) -> list[dict]:
        value = data.get(key) or []
        if not isinstance(value, list):
            raise ValueError(f"Workflow field '{key}' must be a list")
        return list(value)

    @classmethod
    def from_json(cls, text: str | None) -> WorkflowGraph | None:
        if not text:
            return None
        try:
            data = json.loads(text)
        except (json.JSONDecodeError, TypeError):
            return None
        if not isinstance(data, dict):
            return None
        if data.get("schema_version") != "2":
            # Only the current schema is executable server-side; the frontend
            # migrates v1→v2 on load, so saved files are v2.
            return None
        try:
            return cls(data)
        except ValueError:
            return None

    def has_incoming(self, node_id: str) -> bool:
        return any(e.get("to_node_id") == node_id for e in self.edges)

    def incoming_edge(self, node_id: str, port_id: str) -> dict | None:
        for e in self.edges:
            if e.get("to_node_id") == node_id and e.get("to_port_id") == port_id:
                return e
        return None


def topo_layers(node_ids: list[str], edges: list[dict]) -> list[list[str]]:
    """Kahn's algorithm returning nodes grouped by layer. All nodes in a layer
    have no dependency on each other and can execute in parallel. Edges
    referencing nodes outside the set are ignored."""
    ids = set(node_ids)
    indeg = dict.fromkeys(node_ids, 0)
    adj: dict[str, list[str]] = {nid: [] for nid in node_ids}
    for e in edges:
        a, b = e.get("from_node_id"), e.get("to_node_id")
        if a in ids and b in ids:
            indeg[b] += 1
            adj[a].append(b)
    current = [nid for nid in node_ids if indeg[nid] == 0]
    layers: list[list[str]] = []
    processed = 0
    while current:
        layers.append(current)
        processed += len(current)
        nxt: list[str] = []
        for n in current:
            for m in adj[n]:
                indeg[m] -= 1
                if indeg[m] == 0:
                    nxt.append(m)
        current = nxt
    if processed != len(node_ids):
        raise ValueError("Workflow contains a cycle and cannot be executed")
    return layers


def topo_sort(node_ids: list[str], edges: list[dict]) -> list[str]:
    """Flat topological order derived from `topo_layers`. Mirrors `topoSort` in
    workflow-graph.ts."""
    return [nid for layer in topo_layers(node_ids, edges) for nid in layer]


def upstream_node_ids(graph: WorkflowGraph, target_id: str) -> set[str]:
    """All nodes transitively feeding `target_id` (inclusive). Mirrors
    `buildUpstreamSubgraph` in workflow-graph.ts."""
    include = {target_id}
    queue = deque([target_id])
    while queue:
        cur = queue.popleft()
        for e in graph.edges:
            src = e.get("from_node_id")
            # Skip edges whose source node doesn't exist: a hand-edited file can
            # carry a dangling `from_node_id`. Including it would crash later in
            # `_execute_node`'s raw `node_by_id[...]` lookup; leaving it out lets
            # the downstream input resolve to None (and `_require` surface a
            # clean "required but not provided" error if it mattered).
            if (
                e.get("to_node_id") == cur
                and src in graph.node_by_id
                and src not in include
            ):
                include.add(src)
                queue.append(src)
    return include


def free_inputs(graph: WorkflowGraph, subgraph_ids: set[str]) -> list[dict]:
    """The reference nodes in the subgraph that the caller must supply (no
    incoming edge → user-provided input). Returned in a stable order (graph
    declaration order) so endpoint parameters are deterministic.

    Each entry: `{"node": <reference dict>, "port": <output port dict>,
    "type": <port type>, "label": <node label>}`.
    """
    result = []
    for ref in graph.references:
        if ref["id"] not in subgraph_ids:
            continue
        if graph.has_incoming(ref["id"]):
            continue  # computed relay, not a free input
        outputs = ref.get("outputs") or []
        port = outputs[0] if outputs else None
        port_type = (port or {}).get("type") or ref.get("asset_type") or "text"
        result.append(
            {
                "node": ref,
                "port": port,
                "type": port_type,
                "label": ref.get("label", ""),
            }
        )
    return result


def subject_output_type(subject: dict) -> str:
    inputs = subject.get("inputs") or []
    if inputs:
        return inputs[0].get("type") or subject.get("asset_type") or "text"
    return subject.get("asset_type") or "text"


def subject_groups(graph: WorkflowGraph) -> list[list[dict]]:
    """Group subjects by weakly-connected component (edges undirected), mirroring
    `countSubgraphs` in workflow-graph.ts. Each component is one independent
    pipeline, so all of its outputs become a *single* API endpoint that returns
    a tuple — matching how a Gradio Space with multiple outputs exposes one
    endpoint, not one per output.

    Groups are ordered by the declaration order of their first subject; subjects
    within a group keep declaration order (this fixes the output tuple order)."""
    parent: dict[str, str] = {nid: nid for nid in graph.node_by_id}

    def find(x: str) -> str:
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:  # path compression
            parent[x], x = root, parent[x]
        return root

    for e in graph.edges:
        a, b = e.get("from_node_id"), e.get("to_node_id")
        if a in parent and b in parent:
            parent[find(a)] = find(b)

    groups: dict[str, list[dict]] = {}
    order: list[str] = []
    for subject in graph.subjects:
        root = find(subject["id"])
        if root not in groups:
            groups[root] = []
            order.append(root)
        groups[root].append(subject)
    return [groups[root] for root in order]


def group_free_inputs(graph: WorkflowGraph, group: list[dict]) -> list[dict]:
    """The free inputs feeding a subject group: the union of each subject's
    upstream subgraph, deduped and returned in graph declaration order (so a
    reference shared by two outputs in the group becomes a single parameter)."""
    sub_ids: set[str] = set()
    for subject in group:
        sub_ids |= upstream_node_ids(graph, subject["id"])
    return free_inputs(graph, sub_ids)
