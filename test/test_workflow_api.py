import json
import os
from inspect import signature as inspect_signature

import pytest

from gradio.workflow_api import (
    WorkflowExecutionError,
    WorkflowExecutor,
    WorkflowGraph,
    free_inputs,
    topo_sort,
    upstream_node_ids,
)

DEMO = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "demo",
    "workflow",
    "workflow.json",
)


def _demo_graph() -> WorkflowGraph:
    with open(DEMO, encoding="utf-8") as f:
        graph = WorkflowGraph.from_json(f.read())
    assert graph is not None
    return graph


# ─────────────────────────────────────────────────────────────────────────────
# Graph helpers
# ─────────────────────────────────────────────────────────────────────────────


class TestGraphParsing:
    def test_parses_demo_roles(self):
        g = _demo_graph()
        assert {r["label"] for r in g.references} == {"Text", "Image"}
        assert {s["label"] for s in g.subjects} == {"Marketing Image"}
        assert len(g.operators) == 2

    def test_non_v2_returns_none(self):
        assert WorkflowGraph.from_json(json.dumps({"nodes": []})) is None
        assert WorkflowGraph.from_json("not json") is None
        assert WorkflowGraph.from_json(None) is None


class TestTopoSort:
    def test_orders_dependencies_first(self):
        edges = [{"from_node_id": "a", "to_node_id": "b"}]
        order = topo_sort(["a", "b"], edges)
        assert order.index("a") < order.index("b")

    def test_detects_cycle(self):
        edges = [
            {"from_node_id": "a", "to_node_id": "b"},
            {"from_node_id": "b", "to_node_id": "a"},
        ]
        with pytest.raises(ValueError, match="cycle"):
            topo_sort(["a", "b"], edges)


class TestSubgraph:
    def test_upstream_includes_transitive_deps(self):
        g = _demo_graph()
        subject = g.subjects[0]["id"]
        ids = upstream_node_ids(g, subject)
        # The whole demo feeds the single output, so every node is included.
        assert ids == set(g.node_by_id.keys())

    def test_free_inputs_excludes_computed_reference(self):
        g = _demo_graph()
        subject = g.subjects[0]["id"]
        ids = upstream_node_ids(g, subject)
        frees = free_inputs(g, ids)
        # "Text" has an incoming edge (computed); only "Image" is free.
        assert [f["label"] for f in frees] == ["Image"]
        assert frees[0]["type"] == "image"


# ─────────────────────────────────────────────────────────────────────────────
# Executor (callers mocked)
# ─────────────────────────────────────────────────────────────────────────────


class TestExecutor:
    def test_runs_demo_end_to_end(self):
        g = _demo_graph()
        subject_id = g.subjects[0]["id"]
        image_ref = next(r for r in g.references if r["label"] == "Image")

        calls = []

        def fake_call_space(data, request=None, token=None):
            space_id, args_json = data[0], data[2]
            calls.append((space_id, json.loads(args_json)))
            if space_id == "ovi054/image-to-prompt":
                return json.dumps(["a serene mountain lake"])
            if space_id == "multimodalart/FLUX.1-merged":
                # multi-output: image + seed
                return json.dumps(
                    [
                        {
                            "path": "/tmp/flux.png",
                            "url": "/gradio_api/file=/tmp/flux.png",
                            "is_file": True,
                        },
                        42,
                    ]
                )
            raise AssertionError(f"unexpected space {space_id}")

        executor = WorkflowExecutor(g, {"space": fake_call_space})
        out = executor.run(subject_id, {image_ref["id"]: "/tmp/input.png"})

        # Subject output is the FLUX image (picked from the multi-output by shape).
        assert out == "/tmp/flux.png"

        # image-to-prompt received the user image wrapped as a file dict.
        i2p_args = next(a for s, a in calls if s == "ovi054/image-to-prompt")
        assert i2p_args == [{"path": "/tmp/input.png"}]

        # FLUX received the generated prompt threaded through the Text relay.
        flux_args = next(a for s, a in calls if s == "multimodalart/FLUX.1-merged")
        assert flux_args == ["a serene mountain lake"]

    def test_error_dict_raises(self):
        g = _demo_graph()
        subject_id = g.subjects[0]["id"]
        image_ref = next(r for r in g.references if r["label"] == "Image")

        def failing_space(data, request=None, token=None):
            return json.dumps(
                {"error": "Space is sleeping", "error_type": "sleeping",
                 "suggestion": "try again in a minute"}
            )

        executor = WorkflowExecutor(g, {"space": failing_space})
        with pytest.raises(WorkflowExecutionError, match="try again in a minute"):
            executor.run(subject_id, {image_ref["id"]: "/tmp/input.png"})

    def test_unknown_subject_raises(self):
        g = _demo_graph()
        executor = WorkflowExecutor(g, {})
        with pytest.raises(WorkflowExecutionError, match="No such workflow output"):
            executor.run("does-not-exist", {})


# ─────────────────────────────────────────────────────────────────────────────
# Endpoint registration (B2) — schema via get_api_info() + fn wiring
# ─────────────────────────────────────────────────────────────────────────────


class TestEndpointRegistration:
    def test_demo_exposes_named_endpoint(self):
        import gradio as gr

        wf = gr.Workflow(graph=DEMO)
        info = wf.get_api_info()
        named = info["named_endpoints"]
        # One endpoint for the single subject "Marketing Image".
        assert "/marketing_image" in named
        ep = named["/marketing_image"]
        # One free input (the "Image" reference); output is the subject image.
        assert len(ep["parameters"]) == 1
        assert ep["parameters"][0]["python_type"]["type"] in ("filepath", "str", "Dict")
        assert len(ep["returns"]) == 1

    def test_endpoint_fn_runs_with_injected_request_token(self):
        from gradio.workflow_api import _build_endpoint_fn

        g = _demo_graph()
        subject_id = g.subjects[0]["id"]
        image_ref = next(r for r in g.references if r["label"] == "Image")

        seen_token = {}

        def fake_call_space(data, request=None, token=None):
            seen_token["token"] = token
            if data[0] == "ovi054/image-to-prompt":
                return json.dumps(["a prompt"])
            return json.dumps(
                [{"path": "/tmp/out.png", "url": "/gradio_api/file=/tmp/out.png",
                  "is_file": True}, 7]
            )

        fn = _build_endpoint_fn(
            lambda: g, subject_id, [image_ref["id"]], {"space": fake_call_space}
        )
        # Synthesized signature must advertise request + token for injection.
        params = list(inspect_signature(fn).parameters)
        assert params[-2:] == ["request", "token"]

        # Called the way Gradio would: positional inputs, then request, token.
        out = fn("/tmp/in.png", None, "MY_TOKEN")
        assert out == "/tmp/out.png"
        assert seen_token["token"] == "MY_TOKEN"
