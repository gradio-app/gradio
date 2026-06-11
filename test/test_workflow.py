import json
import os
import tempfile

import pytest

import gradio as gr
import gradio.workflow as workflow_module
from gradio.oauth import OAuthToken
from gradio.route_utils import Request
from gradio.workflow import (
    WRITE_TOKEN,
    Workflow,
    _get_locally_saved_hf_token,
    _normalize_space_result,
    _request_has_write_token,
    _resolve_token,
    _workflow_from_bind,
    get_token,
    has_write_access,
)


def _make_oauth(token: str) -> OAuthToken:
    obj = OAuthToken.__new__(OAuthToken)
    obj.token = token
    obj.scope = "openid"
    obj.expires_at = 0
    return obj


def _make_request(
    cookie: str | None = None,
    header: str | None = None,
    query: str | None = None,
) -> Request:
    headers = {}
    if cookie is not None:
        headers["cookie"] = cookie
    if header is not None:
        headers["x-gradio-workflow-write-token"] = header
    return Request(
        headers=headers,
        query_params={"write_token": query} if query is not None else {},
    )


def _write_request() -> Request:
    """A request that carries the process write token (cookie flavor)."""
    return _make_request(cookie=f"gradio_workflow_write_token_7860={WRITE_TOKEN}")


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
            return (None, "http://127.0.0.1:7860/", None)

        monkeypatch.setattr(gr.Blocks, "launch", fake_super_launch)
        wf.launch(prevent_thread_lock=True)
        assert tempfile.gettempdir() in captured["allowed_paths"]

    def test_user_allowed_paths_preserved(self, tmp_path, monkeypatch):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        captured = {}

        def fake_super_launch(*args, **kwargs):
            captured["allowed_paths"] = kwargs.get("allowed_paths")
            return (None, "http://127.0.0.1:7860/", None)

        monkeypatch.setattr(gr.Blocks, "launch", fake_super_launch)
        wf.launch(allowed_paths=["/extra/path"], prevent_thread_lock=True)
        assert "/extra/path" in captured["allowed_paths"]
        assert tempfile.gettempdir() in captured["allowed_paths"]

    def test_none_allowed_paths_handled(self, tmp_path, monkeypatch):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        captured = {}

        def fake_super_launch(*args, **kwargs):
            captured["allowed_paths"] = kwargs.get("allowed_paths")
            return (None, "http://127.0.0.1:7860/", None)

        monkeypatch.setattr(gr.Blocks, "launch", fake_super_launch)
        wf.launch(allowed_paths=None, prevent_thread_lock=True)
        assert captured["allowed_paths"] == [tempfile.gettempdir()]


class TestLaunchWriteTokenLink:
    def test_edit_link_printed_locally(self, tmp_path, monkeypatch, capsys):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        monkeypatch.setattr(
            gr.Blocks,
            "launch",
            lambda *a, **kw: (None, "http://127.0.0.1:7860/", None),
        )
        wf.launch(prevent_thread_lock=True)
        out = capsys.readouterr().out
        assert f"write_token={WRITE_TOKEN}" in out

    def test_no_edit_link_on_spaces(self, tmp_path, monkeypatch, capsys):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        monkeypatch.setattr(workflow_module, "get_space", lambda: "owner/space")
        monkeypatch.setattr(
            gr.Blocks,
            "launch",
            lambda *a, **kw: (None, "http://127.0.0.1:7860/", None),
        )
        wf.launch(prevent_thread_lock=True)
        out = capsys.readouterr().out
        assert "write_token" not in out


# ─────────────────────────────────────────────────────────────────────────────
# Token resolution
# ─────────────────────────────────────────────────────────────────────────────


class TestResolveToken:
    def test_explicit_data_wins(self, monkeypatch):
        monkeypatch.setattr(
            workflow_module, "_get_locally_saved_hf_token", lambda: None
        )
        assert (
            _resolve_token(["x", "y", "z", "manual"], 3, _make_oauth("oauth"))
            == "manual"
        )

    def test_oauth_used_when_no_manual(self, monkeypatch):
        monkeypatch.setattr(
            workflow_module, "_get_locally_saved_hf_token", lambda: None
        )
        assert _resolve_token([], 3, _make_oauth("oauth-tok")) == "oauth-tok"

    def test_local_token_requires_write_access(self, monkeypatch):
        # A share-link visitor (no write token) must never see the host's
        # locally saved HF token.
        monkeypatch.setattr(
            workflow_module,
            "_get_locally_saved_hf_token",
            lambda: "local-tok",
        )
        assert _resolve_token([], 3, None, _write_request()) == "local-tok"
        assert _resolve_token([], 3, None, _make_request()) is None
        assert _resolve_token([], 3, None, None) is None


class TestGetToken:
    def test_oauth_token_wins(self, monkeypatch):
        monkeypatch.setattr(
            workflow_module,
            "_get_locally_saved_hf_token",
            lambda: "local-tok",
        )
        assert get_token(token=_make_oauth("oauth-tok")) == "oauth-tok"

    def test_local_token_requires_write_access(self, monkeypatch):
        monkeypatch.setattr(
            workflow_module,
            "_get_locally_saved_hf_token",
            lambda: "local-tok",
        )
        assert get_token(request=_write_request()) == "local-tok"
        assert get_token(request=_make_request()) == ""
        assert get_token() == ""

    def test_local_hf_token_is_disabled_on_spaces(self, monkeypatch):
        monkeypatch.setattr(workflow_module, "get_space", lambda: "owner/space")
        assert _get_locally_saved_hf_token() is None


# ─────────────────────────────────────────────────────────────────────────────
# Write access — local write token + Spaces OAuth ownership
# ─────────────────────────────────────────────────────────────────────────────


class TestWriteAccess:
    def test_token_accepted_via_header_cookie_or_query(self):
        assert _request_has_write_token(_make_request(header=WRITE_TOKEN))
        assert _request_has_write_token(_write_request())
        assert _request_has_write_token(_make_request(query=WRITE_TOKEN))
        # Frontend suffixes the cookie name with the port; any suffix works.
        assert _request_has_write_token(
            _make_request(
                cookie=f"other=1; gradio_workflow_write_token_8080={WRITE_TOKEN}"
            )
        )

    def test_wrong_or_missing_token_denied(self):
        assert not _request_has_write_token(
            _make_request(cookie="gradio_workflow_write_token_7860=wrong")
        )
        assert not _request_has_write_token(_make_request(header="wrong"))
        assert not _request_has_write_token(_make_request(query="wrong"))
        assert not _request_has_write_token(_make_request())
        assert not _request_has_write_token(None)

    def test_write_token_ignored_on_spaces(self, monkeypatch):
        # On Spaces only OAuth ownership grants write access; a leaked write
        # token must not.
        monkeypatch.setattr(workflow_module, "get_space", lambda: "owner/space")
        assert has_write_access(_write_request(), None) is False


class TestSaveWorkflowGating:
    def _save_fn(self, tmp_path):
        wf = Workflow(graph=str(tmp_path / "wf.json"))
        canvas = next(
            b for b in wf.blocks.values() if b.get_block_name() == "workflowcanvas"
        )
        return canvas.save_workflow

    def test_save_rejected_without_write_access(self, tmp_path):
        save = self._save_fn(tmp_path)
        result = json.loads(save(['{"nodes": []}'], _make_request(), None))
        assert result["error_type"] == "auth"
        assert not os.path.exists(tmp_path / "wf.json")

    def test_save_allowed_with_write_access(self, tmp_path):
        save = self._save_fn(tmp_path)
        assert save(['{"nodes": []}'], _write_request(), None) == "ok"
        assert os.path.exists(tmp_path / "wf.json")


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
