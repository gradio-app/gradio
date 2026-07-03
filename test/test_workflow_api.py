import json
import os
from inspect import signature as inspect_signature

import pytest

from gradio.workflow_api import (
    WorkflowExecutionError,
    WorkflowExecutor,
    WorkflowGraph,
    describe_workflow_api,
    free_inputs,
    subject_groups,
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
        assert len(g.operators) == 3

    def test_non_v2_returns_none(self):
        assert WorkflowGraph.from_json(json.dumps({"nodes": []})) is None
        assert WorkflowGraph.from_json("not json") is None
        assert WorkflowGraph.from_json(None) is None

    def test_malformed_v2_returns_none(self):
        assert (
            WorkflowGraph.from_json(
                json.dumps({"schema_version": "2", "subjects": [{"label": "Out"}]})
            )
            is None
        )


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
        # Nodes with no edges are unreachable; exclude them from the expected set.
        nodes_in_edges = {e["from_node_id"] for e in g.edges} | {e["to_node_id"] for e in g.edges}
        expected = set(g.node_by_id.keys()) & (nodes_in_edges | {subject})
        assert ids == expected

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
                {
                    "error": "Space is sleeping",
                    "error_type": "sleeping",
                    "suggestion": "try again in a minute",
                }
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
                [
                    {
                        "path": "/tmp/out.png",
                        "url": "/gradio_api/file=/tmp/out.png",
                        "is_file": True,
                    },
                    7,
                ]
            )

        fn = _build_endpoint_fn(
            lambda: g, [subject_id], [image_ref["id"]], {"space": fake_call_space}
        )
        # Synthesized signature must advertise request + token for injection.
        params = list(inspect_signature(fn).parameters)
        assert params[-2:] == ["request", "token"]

        # Called the way Gradio would: positional inputs, then request, token.
        out = fn("/tmp/in.png", None, "MY_TOKEN")
        assert out == "/tmp/out.png"
        assert seen_token["token"] == "MY_TOKEN"

    def test_describe_parameter_names_match_info(self, tmp_path):
        import gradio as gr

        path = tmp_path / "wf.json"
        path.write_text(_graph_with_subjects(1))
        wf = gr.Workflow(graph=str(path))
        graph = WorkflowGraph.from_json(path.read_text())
        assert graph is not None

        described = describe_workflow_api(graph)[0]
        info_param = wf.get_api_info()["named_endpoints"]["/out0"]["parameters"][0]
        assert described["parameters"][0]["parameter_name"] == "in_0"
        assert (
            described["parameters"][0]["parameter_name"] == info_param["parameter_name"]
        )


# ─────────────────────────────────────────────────────────────────────────────
# Live schema updates — endpoint set re-derives on save (Option 2)
# ─────────────────────────────────────────────────────────────────────────────


def _graph_with_subjects(n: int) -> str:
    """A minimal v2 graph with `n` text input→output passthroughs (one free
    reference feeding one subject each)."""
    refs, subs, edges = [], [], []
    for i in range(n):
        rid, sid = f"ref{i}", f"sub{i}"
        refs.append(
            {
                "id": rid,
                "label": f"In{i}",
                "role": "reference",
                "asset_type": "text",
                "inputs": [{"id": "in", "type": "text"}],
                "outputs": [{"id": "out", "type": "text"}],
                "data": {},
            }
        )
        subs.append(
            {
                "id": sid,
                "label": f"Out{i}",
                "role": "subject",
                "asset_type": "text",
                "inputs": [{"id": "in", "type": "text"}],
                "outputs": [{"id": "out", "type": "text"}],
                "data": {},
            }
        )
        edges.append(
            {
                "id": f"e{i}",
                "from_node_id": rid,
                "from_port_id": "out",
                "to_node_id": sid,
                "to_port_id": "in",
                "type": "text",
            }
        )
    return json.dumps(
        {
            "schema_version": "2",
            "name": "T",
            "references": refs,
            "operators": [],
            "subjects": subs,
            "edges": edges,
        }
    )


def _endpoint_names(wf) -> set:
    # Exclude the canvas's own initial-value loader (value=_load_initial), which
    # is registered as a load event independent of the workflow API endpoints.
    return set(wf.get_api_info()["named_endpoints"].keys()) - {"/_load_initial"}


class TestLiveSchemaUpdate:
    def test_sync_adds_and_removes_endpoints(self, tmp_path):
        import gradio as gr

        path = tmp_path / "wf.json"
        path.write_text(_graph_with_subjects(1))
        wf = gr.Workflow(graph=str(path))
        assert _endpoint_names(wf) == {"/out0"}
        fns_after_one = len(wf.fns)

        assert wf._api_endpoints is not None

        # Add a second output → endpoint appears after sync.
        path.write_text(_graph_with_subjects(2))
        wf._api_endpoints.sync()
        assert _endpoint_names(wf) == {"/out0", "/out1"}

        # Remove it again → endpoint disappears and the fn is not leaked.
        path.write_text(_graph_with_subjects(1))
        wf._api_endpoints.sync()
        assert _endpoint_names(wf) == {"/out0"}
        assert len(wf.fns) == fns_after_one

    def test_rename_changes_api_name(self, tmp_path):
        import gradio as gr

        path = tmp_path / "wf.json"
        path.write_text(_graph_with_subjects(1))
        wf = gr.Workflow(graph=str(path))
        assert _endpoint_names(wf) == {"/out0"}

        renamed = json.loads(_graph_with_subjects(1))
        renamed["subjects"][0]["label"] = "Final Image"
        path.write_text(json.dumps(renamed))
        assert wf._api_endpoints is not None
        wf._api_endpoints.sync()
        assert _endpoint_names(wf) == {"/final_image"}

    def test_save_workflow_resyncs_endpoints(self, tmp_path):
        import gradio as gr
        from gradio.route_utils import Request
        from gradio.workflow import WRITE_TOKEN

        path = tmp_path / "wf.json"
        path.write_text(_graph_with_subjects(1))
        wf = gr.Workflow(graph=str(path))
        canvas = next(
            b for b in wf.blocks.values() if b.get_block_name() == "workflowcanvas"
        )
        write_req = Request(
            headers={"cookie": f"gradio_workflow_write_token_7860={WRITE_TOKEN}"},
            query_params={},
        )
        result = canvas.save_workflow([_graph_with_subjects(2)], write_req, None)
        assert result == "ok"
        assert _endpoint_names(wf) == {"/out0", "/out1"}

    def test_save_workflow_rejects_malformed_schema(self, tmp_path):
        import gradio as gr
        from gradio.route_utils import Request
        from gradio.workflow import WRITE_TOKEN

        path = tmp_path / "wf.json"
        original = _graph_with_subjects(1)
        path.write_text(original)
        wf = gr.Workflow(graph=str(path))
        canvas = next(
            b for b in wf.blocks.values() if b.get_block_name() == "workflowcanvas"
        )
        write_req = Request(
            headers={"cookie": f"gradio_workflow_write_token_7860={WRITE_TOKEN}"},
            query_params={},
        )
        bad = json.dumps({"schema_version": "2", "subjects": [{"label": "Out"}]})
        result = canvas.save_workflow([bad], write_req, None)

        assert json.loads(result)["error"].startswith("Invalid workflow schema")
        assert path.read_text() == original
        assert _endpoint_names(wf) == {"/out0"}


# ─────────────────────────────────────────────────────────────────────────────
# End-to-end through real /info + /call via gradio_client
# ─────────────────────────────────────────────────────────────────────────────

DEMO_API = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "demo",
    "workflow_api",
    "workflow.json",
)


def _frontend_built() -> bool:
    import gradio as gr

    return os.path.exists(
        os.path.join(
            os.path.dirname(gr.__file__ or ""),
            "templates",
            "frontend",
            "index.html",
        )
    )


class TestEndToEndClient:
    @pytest.mark.skipif(
        not _frontend_built(),
        reason="frontend build required (gradio_client fetches the root page)",
    )
    def test_multi_output_endpoint_callable_via_gradio_client(self):
        from gradio_client import Client

        import gradio as gr

        def shout(text: str) -> str:
            return (text or "").upper()

        def reverse(text: str) -> str:
            return (text or "")[::-1]

        # "Loud" and "Reversed" share the "Text" input, so they're one subgraph
        # → one endpoint (slug from the first subject) returning both outputs.
        demo = gr.Workflow(graph=DEMO_API, bind={"shout": shout, "reverse": reverse})
        _, local_url, _ = demo.launch(prevent_thread_lock=True, quiet=True)
        try:
            client = Client(local_url, verbose=False)
            api = client.view_api(return_format="dict")
            assert isinstance(api, dict)
            named = api["named_endpoints"]
            assert "/loud" in named and "/reversed" not in named

            assert client.predict("hello", api_name="/loud") == ("HELLO", "olleh")
        finally:
            demo.close()

    def test_info_route_lists_endpoints(self):
        """The HTTP /info route serves the workflow endpoints (no frontend build
        needed — this is the discovery half; gradio_client covers /call in CI)."""
        from fastapi.testclient import TestClient

        import gradio as gr

        def shout(text: str) -> str:
            return (text or "").upper()

        def reverse(text: str) -> str:
            return (text or "")[::-1]

        demo = gr.Workflow(graph=DEMO_API, bind={"shout": shout, "reverse": reverse})
        client = TestClient(demo.app)
        resp = client.get("/gradio_api/info")
        assert resp.status_code == 200
        named = resp.json()["named_endpoints"]
        # One subgraph (shared "Text" input) → one endpoint with two returns.
        assert "/loud" in named and "/reversed" not in named
        assert len(named["/loud"]["parameters"]) == 1
        assert len(named["/loud"]["returns"]) == 2


# ─────────────────────────────────────────────────────────────────────────────
# Multi-output subgraph — outputs of one pipeline are a SINGLE endpoint
# ─────────────────────────────────────────────────────────────────────────────


def _graph_two_outputs() -> str:
    """One image reference → an operator with two outputs → two subject nodes.
    All nodes form a single weakly-connected subgraph, so it must expose ONE
    endpoint that returns both outputs (not one endpoint per output)."""
    return json.dumps(
        {
            "schema_version": "2",
            "name": "Two Outputs",
            "references": [
                {
                    "id": "ref0",
                    "label": "Image",
                    "role": "reference",
                    "asset_type": "image",
                    "inputs": [{"id": "in", "type": "image"}],
                    "outputs": [{"id": "out", "type": "image"}],
                    "data": {},
                }
            ],
            "operators": [
                {
                    "id": "op",
                    "label": "Split",
                    "role": "operator",
                    "kind": "space",
                    "space_id": "owner/repo",
                    "endpoint": "/predict",
                    "inputs": [
                        {
                            "id": "in_0",
                            "label": "Image",
                            "type": "image",
                            "required": True,
                        }
                    ],
                    "outputs": [
                        {
                            "id": "out_0",
                            "label": "A",
                            "type": "image",
                            "output_index": 0,
                        },
                        {
                            "id": "out_1",
                            "label": "B",
                            "type": "image",
                            "output_index": 1,
                        },
                    ],
                    "data": {},
                }
            ],
            "subjects": [
                {
                    "id": "sa",
                    "label": "Cutout",
                    "role": "subject",
                    "asset_type": "image",
                    "inputs": [{"id": "in", "type": "image"}],
                    "outputs": [{"id": "out", "type": "image"}],
                    "data": {},
                },
                {
                    "id": "sb",
                    "label": "Mask",
                    "role": "subject",
                    "asset_type": "image",
                    "inputs": [{"id": "in", "type": "image"}],
                    "outputs": [{"id": "out", "type": "image"}],
                    "data": {},
                },
            ],
            "edges": [
                {
                    "id": "e0",
                    "from_node_id": "ref0",
                    "from_port_id": "out",
                    "to_node_id": "op",
                    "to_port_id": "in_0",
                    "type": "image",
                },
                {
                    "id": "e1",
                    "from_node_id": "op",
                    "from_port_id": "out_0",
                    "to_node_id": "sa",
                    "to_port_id": "in",
                    "type": "image",
                },
                {
                    "id": "e2",
                    "from_node_id": "op",
                    "from_port_id": "out_1",
                    "to_node_id": "sb",
                    "to_port_id": "in",
                    "type": "image",
                },
            ],
        }
    )


class TestMultiOutputSubgraph:
    def test_subjects_in_one_component_form_one_group(self):
        graph = WorkflowGraph.from_json(_graph_two_outputs())
        assert graph is not None
        groups = subject_groups(graph)
        assert len(groups) == 1
        assert [s["id"] for s in groups[0]] == ["sa", "sb"]

    def test_one_endpoint_with_two_returns(self, tmp_path):
        import gradio as gr

        graph = WorkflowGraph.from_json(_graph_two_outputs())
        assert graph is not None
        described = describe_workflow_api(graph)
        assert len(described) == 1
        # One shared input (the single Image reference), two outputs.
        assert len(described[0]["parameters"]) == 1
        assert len(described[0]["returns"]) == 2

        path = tmp_path / "wf.json"
        path.write_text(_graph_two_outputs())
        wf = gr.Workflow(graph=str(path))
        assert _endpoint_names(wf) == {"/cutout"}
        assert len(wf.get_api_info()["named_endpoints"]["/cutout"]["returns"]) == 2

    def test_shared_operator_runs_once_and_returns_both(self):
        graph = WorkflowGraph.from_json(_graph_two_outputs())
        assert graph is not None
        calls = []

        def fake_space(data, request=None, token=None):
            calls.append(data[0])
            return json.dumps(
                [
                    {
                        "path": "/tmp/a.png",
                        "url": "/gradio_api/file=/tmp/a.png",
                        "is_file": True,
                    },
                    {
                        "path": "/tmp/b.png",
                        "url": "/gradio_api/file=/tmp/b.png",
                        "is_file": True,
                    },
                ]
            )

        out = WorkflowExecutor(graph, {"space": fake_space}).run_many(
            ["sa", "sb"], {"ref0": "/tmp/in.png"}
        )
        assert out == ["/tmp/a.png", "/tmp/b.png"]
        # The operator feeding both outputs is executed exactly once.
        assert calls == ["owner/repo"]


class TestPortComponents:
    def test_file_port_maps_to_file_component(self):
        import gradio as gr
        from gradio.workflow_api import port_to_component

        # "file" is a media port type (advertised as filepath); it must map to a
        # File component, not fall through to the Textbox default.
        c = port_to_component("file", "Document")
        assert isinstance(c, gr.File)
        assert c.type == "filepath"


class TestModelNodeDispatch:
    def _make_graph(self, endpoint, port_id):
        data = {
            "schema_version": "2",
            "references": [{"id": "r", "label": "P", "role": "reference", "inputs": [{"id": "in", "label": "P", "type": "text"}], "outputs": [{"id": "out", "label": "P", "type": "text"}]}],
            "operators": [{"id": "m", "label": "M", "role": "operator", "kind": "model", "model_id": "o/m", "pipeline_tag": "text-to-image", **({"endpoint": endpoint} if endpoint else {}), "inputs": [{"id": port_id, "label": "Prompt", "type": "text", "required": True}], "outputs": [{"id": "out_0", "label": "Image", "type": "image", "output_index": 0}]}],
            "subjects": [{"id": "s", "label": "Out", "role": "subject", "inputs": [{"id": "in", "label": "I", "type": "image"}], "outputs": [{"id": "out", "label": "I", "type": "image"}]}],
            "edges": [{"id": "e1", "from_node_id": "r", "from_port_id": "out", "to_node_id": "m", "to_port_id": port_id, "type": "text"}, {"id": "e2", "from_node_id": "m", "from_port_id": "out_0", "to_node_id": "s", "to_port_id": "in", "type": "image"}],
        }
        return WorkflowGraph.from_json(json.dumps(data))

    def test_endpoint_sends_kwargs_dict_legacy_sends_list(self):
        file_out = json.dumps([{"path": "/tmp/out.png", "url": "/f", "is_file": True}])
        calls = {}

        def capture(data, request=None, token=None):
            calls[data[1]] = json.loads(data[2])
            return file_out

        g = self._make_graph("text_to_image", "prompt")
        assert g is not None
        WorkflowExecutor(g, {"model": capture}).run(g.subjects[0]["id"], {g.references[0]["id"]: "cat"})
        assert isinstance(calls["text_to_image"], dict) and calls["text_to_image"]["prompt"] == "cat"

        g2 = self._make_graph(None, "in_0")
        assert g2 is not None
        WorkflowExecutor(g2, {"model": capture}).run(g2.subjects[0]["id"], {g2.references[0]["id"]: "cat"})
        assert isinstance(calls["text-to-image"], list) and calls["text-to-image"][0] == "cat"
