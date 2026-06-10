import json
import os
import tempfile

import pytest

import gradio as gr
from gradio.oauth import OAuthToken
from gradio.workflow import (
    Workflow,
    _normalize_space_result,
    _resolve_token,
    _workflow_from_bind,
)


def _make_oauth(token: str) -> OAuthToken:
    obj = OAuthToken.__new__(OAuthToken)
    obj.token = token
    obj.scope = "openid"
    obj.expires_at = 0
    return obj


def _shout(text: str) -> str:
    return text.upper()


def _add(a: int, b: int) -> int:
    return a + b


def _flag(on: bool) -> str:
    return "yes" if on else "no"


# ─────────────────────────────────────────────────────────────────────────────
# Construction
# ─────────────────────────────────────────────────────────────────────────────


class TestConstruction:
    def test_subclasses_blocks(self):
        wf = Workflow(graph=os.path.join(tempfile.gettempdir(), "wf_test.json"))
        assert isinstance(wf, gr.Blocks)

    def test_default_graph_path_is_caller_dir(self):
        wf = Workflow()
        assert os.path.basename(wf._workflow_file) == "workflow.json"
        # Caller of __init__ is this test file → graph should resolve next to it.
        assert os.path.dirname(wf._workflow_file) == os.path.dirname(
            os.path.abspath(__file__)
        )

    def test_graph_parameter_honored(self, tmp_path):
        graph = tmp_path / "custom.json"
        wf = Workflow(graph=str(graph))
        assert wf._workflow_file == str(graph)

    def test_bind_accepts_list(self, tmp_path):
        wf = Workflow(graph=str(tmp_path / "wf.json"), bind=[_shout, _add])
        assert set(wf._bound.keys()) == {"_shout", "_add"}

    def test_bind_accepts_dict(self, tmp_path):
        wf = Workflow(
            graph=str(tmp_path / "wf.json"),
            bind={"upper": _shout, "sum": _add},
        )
        assert set(wf._bound.keys()) == {"upper", "sum"}

    def test_workflow_name_derived_from_filename(self, tmp_path):
        wf = Workflow(graph=str(tmp_path / "marketing_image_creator.json"))
        assert wf._workflow_name == "Marketing Image Creator"


# ─────────────────────────────────────────────────────────────────────────────
# OAuth gating
# ─────────────────────────────────────────────────────────────────────────────


class TestOAuthGating:
    def test_no_login_button_off_space(self, tmp_path, monkeypatch):
        # Local dev: no Space, no LoginButton, no oauth wiring.
        monkeypatch.delenv("SYSTEM", raising=False)
        monkeypatch.delenv("SPACE_ID", raising=False)
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        assert wf.expects_oauth is False

    def test_no_login_button_on_space_without_oauth_env(self, tmp_path, monkeypatch):
        # The wftest 500 case: on a Space but `hf_oauth: true` either isn't
        # set or env vars haven't propagated. Construction must NOT raise.
        monkeypatch.setenv("SYSTEM", "spaces")
        monkeypatch.setenv("SPACE_ID", "u/r")
        monkeypatch.delenv("OAUTH_CLIENT_ID", raising=False)
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        assert wf.expects_oauth is False


# ─────────────────────────────────────────────────────────────────────────────
# launch() — allowed_paths merging
# ─────────────────────────────────────────────────────────────────────────────


class TestLaunchAllowedPaths:
    def test_tempdir_added_by_default(self, tmp_path, monkeypatch):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        captured = {}

        def fake_super_launch(*args, **kwargs):
            captured["allowed_paths"] = kwargs.get("allowed_paths")

        monkeypatch.setattr(gr.Blocks, "launch", fake_super_launch)
        wf.launch()
        assert tempfile.gettempdir() in captured["allowed_paths"]

    def test_user_allowed_paths_preserved(self, tmp_path, monkeypatch):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        captured = {}

        def fake_super_launch(*args, **kwargs):
            captured["allowed_paths"] = kwargs.get("allowed_paths")

        monkeypatch.setattr(gr.Blocks, "launch", fake_super_launch)
        wf.launch(allowed_paths=["/extra/path"])
        assert "/extra/path" in captured["allowed_paths"]
        assert tempfile.gettempdir() in captured["allowed_paths"]

    def test_none_allowed_paths_handled(self, tmp_path, monkeypatch):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        captured = {}

        def fake_super_launch(*args, **kwargs):
            captured["allowed_paths"] = kwargs.get("allowed_paths")

        monkeypatch.setattr(gr.Blocks, "launch", fake_super_launch)
        wf.launch(allowed_paths=None)
        assert captured["allowed_paths"] == [tempfile.gettempdir()]


# ─────────────────────────────────────────────────────────────────────────────
# Token resolution
# ─────────────────────────────────────────────────────────────────────────────


class TestResolveToken:
    def test_explicit_data_wins(self):
        assert (
            _resolve_token(["x", "y", "z", "manual"], 3, _make_oauth("oauth"))
            == "manual"
        )

    def test_oauth_used_when_no_manual(self):
        assert _resolve_token([], 3, _make_oauth("oauth-tok")) == "oauth-tok"

    def test_none_when_no_source(self):
        assert _resolve_token([], 3, None) is None


# ─────────────────────────────────────────────────────────────────────────────
# _workflow_from_bind — graph generation from Python functions
# ─────────────────────────────────────────────────────────────────────────────


class TestWorkflowFromBind:
    def test_generates_nodes_for_each_bound_fn(self):
        result = json.loads(_workflow_from_bind({"shout": _shout, "add": _add}))
        fns = {n["fn"] for n in result["nodes"]}
        assert fns == {"shout", "add"}

    def test_port_type_from_annotation(self):
        result = json.loads(_workflow_from_bind({"add": _add}))
        node = result["nodes"][0]
        assert all(p["type"] == "number" for p in node["inputs"])

    def test_bool_annotation_maps_to_boolean(self):
        result = json.loads(_workflow_from_bind({"flag": _flag}))
        node = result["nodes"][0]
        assert node["inputs"][0]["type"] == "boolean"

    def test_unannotated_param_defaults_to_text(self):
        def plain(x):  # no annotation
            return x

        result = json.loads(_workflow_from_bind({"plain": plain}))
        node = result["nodes"][0]
        assert node["inputs"][0]["type"] == "text"

    def test_edges_resolve_by_function_name(self):
        result = json.loads(
            _workflow_from_bind(
                {"shout": _shout, "add": _add},
                edges=[("shout", "add")],
            )
        )
        assert len(result["edges"]) == 1
        edge = result["edges"][0]
        assert edge["from_node_id"] == "fn_shout"
        assert edge["to_node_id"] == "fn_add"

    def test_edges_resolve_by_port_label(self):
        result = json.loads(
            _workflow_from_bind(
                {"add": _add, "shout": _shout},
                edges=[("add.output", "shout.text")],
            )
        )
        edge = result["edges"][0]
        assert edge["from_port_id"] == "out_0"
        assert edge["to_port_id"] == "in_text"

    def test_unknown_function_in_edge_raises(self):
        with pytest.raises(ValueError, match="no function 'nope'"):
            _workflow_from_bind({"shout": _shout}, edges=[("nope", "shout")])

    def test_unknown_port_label_raises(self):
        with pytest.raises(ValueError, match="no .* port"):
            _workflow_from_bind(
                {"shout": _shout}, edges=[("shout.bogus", "shout.text")]
            )

    def test_zero_input_fn_gets_synthetic_input_port(self):
        def noargs() -> str:
            return ""

        result = json.loads(_workflow_from_bind({"noargs": noargs}))
        node = result["nodes"][0]
        assert node["inputs"] == [{"id": "in_0", "label": "input", "type": "text"}]


# ─────────────────────────────────────────────────────────────────────────────
# _normalize_space_result — HF Hub result reshaping
# ─────────────────────────────────────────────────────────────────────────────


class TestNormalizeSpaceResult:
    def test_preserves_id_and_likes(self):
        result = _normalize_space_result({"id": "owner/repo", "likes": 42}, "")
        assert result["id"] == "owner/repo"
        assert result["likes"] == 42

    def test_explicit_pipeline_tag_wins_over_ai_category(self):
        result = _normalize_space_result(
            {"ai_category": "image-generation"}, "text-to-image"
        )
        assert result["pipeline_tag"] == "text-to-image"

    def test_falls_back_to_ai_category(self):
        result = _normalize_space_result({"ai_category": "image-generation"}, "")
        assert result["pipeline_tag"] == "image-generation"

    def test_short_description_falls_back(self):
        # shortDescription preferred, ai_short_description fallback
        s = {"ai_short_description": "from ai"}
        assert (
            _normalize_space_result(s, "")["cardData"]["short_description"] == "from ai"
        )
        s = {"shortDescription": "from card", "ai_short_description": "from ai"}
        assert (
            _normalize_space_result(s, "")["cardData"]["short_description"]
            == "from card"
        )

    def test_missing_likes_defaults_zero(self):
        assert _normalize_space_result({}, "")["likes"] == 0


# ─────────────────────────────────────────────────────────────────────────────
# server functions — basic shape
# ─────────────────────────────────────────────────────────────────────────────


class TestServerFunctions:
    def test_get_token_returns_oauth_when_present(self):
        from gradio.workflow import get_token

        assert get_token(None, _make_oauth("oauth-tok")) == "oauth-tok"

    def test_get_token_empty_string_when_no_oauth(self):
        from gradio.workflow import get_token

        assert get_token(None, None) == ""
