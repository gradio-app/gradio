import json
import os
import tempfile
from typing import Optional

import pytest

import gradio as gr
import gradio.workflow as workflow_module
from gradio.oauth import OAuthProfile, OAuthToken
from gradio.route_utils import Request
from gradio.workflow import (
    WRITE_TOKEN,
    Workflow,
    _get_locally_saved_hf_token,
    _request_has_write_token,
    _resolve_token,
    _workflow_from_bind,
    call_model,
    call_space,
    get_oauth_available,
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


class TestOAuthAvailable:
    # Drives whether the frontend shows the "Sign in" button: OAuth is only
    # wired up on a Space with hf_oauth enabled (OAUTH_CLIENT_ID provisioned).
    def test_false_locally(self, monkeypatch):
        monkeypatch.setattr(workflow_module, "get_space", lambda: None)
        assert get_oauth_available() == "false"

    def test_false_on_space_without_oauth(self, monkeypatch):
        monkeypatch.setattr(workflow_module, "get_space", lambda: "owner/space")
        monkeypatch.delenv("OAUTH_CLIENT_ID", raising=False)
        assert get_oauth_available() == "false"

    def test_true_on_space_with_oauth(self, monkeypatch):
        monkeypatch.setattr(workflow_module, "get_space", lambda: "owner/space")
        monkeypatch.setenv("OAUTH_CLIENT_ID", "client-id")
        assert get_oauth_available() == "true"


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
        # A valid schema_version 2 payload (save now validates the schema).
        assert save(['{"schema_version": "2"}'], _write_request(), None) == "ok"
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


class TestCallModelValidation:
    def test_url_shaped_model_id_is_rejected(self):
        result = json.loads(call_model(["http://169.254.169.254/latest/meta-data/"]))
        assert result.get("error_type") == "not_found"

    def test_https_url_is_rejected(self):
        result = json.loads(call_model(["https://attacker.example.com/endpoint"]))
        assert result.get("error_type") == "not_found"

    def test_empty_model_id_is_rejected(self):
        result = json.loads(call_model([""]))
        assert result.get("error_type") == "not_found"

    def test_bare_repo_name_is_rejected(self):
        result = json.loads(call_model(["gpt2"]))
        assert result.get("error_type") == "not_found"

    def test_valid_owner_repo_passes_validation(self, monkeypatch):
        class FakeClient:
            def __init__(self, **kwargs):
                pass

            def text_generation(self, *args, **kwargs):
                return "hello"

        monkeypatch.setattr(
            "gradio.workflow.InferenceClient", FakeClient, raising=False
        )
        import gradio.workflow as wf

        wf.call_model.__globals__.get("InferenceClient")

        import sys
        import types

        fake_hf = types.ModuleType("huggingface_hub")
        fake_hf.InferenceClient = FakeClient  # type: ignore[attr-defined]
        monkeypatch.setitem(sys.modules, "huggingface_hub", fake_hf)

        result = json.loads(call_model(["owner/model"]))
        assert "error" not in result


class TestCallFn:
    def _call_fn(self, tmp_path, bind):
        wf = Workflow(graph=str(tmp_path / "wf.json"), bind=bind)
        canvas = next(
            b for b in wf.blocks.values() if b.get_block_name() == "workflowcanvas"
        )
        return canvas.call_fn

    @pytest.mark.asyncio
    async def test_calls_bound_fn(self, tmp_path):
        call_fn = self._call_fn(tmp_path, {"echo": lambda x: x})
        result = json.loads(await call_fn(["echo", '["hello"]']))
        assert result == ["hello"]

    @pytest.mark.asyncio
    async def test_injects_oauth_token(self, tmp_path):
        received = {}

        def fn_with_token(text: str, token: Optional[OAuthToken]) -> str:
            received["token"] = token
            return text

        call_fn = self._call_fn(tmp_path, {"fn_with_token": fn_with_token})

        class _MockRequest:
            session = {
                "oauth_info": {
                    "access_token": "test-tok",
                    "scope": "openid",
                    "expires_at": 9999999999,
                }
            }

        result = json.loads(
            await call_fn(["fn_with_token", '["hi"]'], _request=_MockRequest())
        )
        assert result == ["hi"]
        assert received["token"].token == "test-tok"

    @pytest.mark.asyncio
    async def test_injects_direct_token_without_session(self, tmp_path):
        def fn(text: str, token: OAuthToken, profile: Optional[OAuthProfile]) -> str:
            return f"{token.token},{profile}"

        call_fn = self._call_fn(tmp_path, {"fn": fn})
        direct = OAuthToken.__new__(OAuthToken)
        direct.token = "direct-token"
        direct.scope = "openid"
        direct.expires_at = 9999999999
        result = json.loads(
            await call_fn(["fn", '["hello"]'], _request=None, _token=direct)
        )
        assert result == ["direct-token,None"]

    @pytest.mark.asyncio
    async def test_unknown_fn_returns_error(self, tmp_path):
        call_fn = self._call_fn(tmp_path, {"echo": lambda x: x})
        result = json.loads(await call_fn(["missing", "[]"]))
        assert result.get("error_type") == "unknown"


class TestCallSpaceValidation:
    def test_url_shaped_space_id_is_rejected(self):
        result = json.loads(call_space(["http://169.254.169.254/"]))
        assert result.get("error_type") == "not_found"

    def test_valid_owner_repo_format_accepted_by_regex(self):
        import re

        pattern = r"[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+"
        assert re.fullmatch(pattern, "owner/repo")
        assert re.fullmatch(pattern, "my-org/my-space")
        assert re.fullmatch(pattern, "http://host/path") is None
