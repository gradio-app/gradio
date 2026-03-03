"""
Security regression test: arbitrary file paths in dictionaries must NOT be moved
to the Gradio cache.

This tests three scenarios:
1. A plain dict with a "path" key but no FileData meta — should be ignored entirely
   by the traversal and never trigger caching.
2. A dict that looks like a proper FileData (has meta) but points to a file outside
   allowed directories (e.g. /etc/passwd) — should raise InvalidPathError.
3. BrowserState with Pydantic models (PR #12954) — model_dump() should not produce
   dicts that trick the file caching system into caching arbitrary files.
"""

import tempfile
from contextlib import contextmanager
from pathlib import Path

import pytest
from pydantic import BaseModel

import gradio as gr
from gradio import processing_utils
from gradio.context import LocalContext
from gradio.exceptions import InvalidPathError


@contextmanager
def launched_blocks_context():
    """Set up a Blocks instance that looks launched, with LocalContext wired up."""
    blocks = gr.Blocks()
    blocks.has_launched = True
    blocks.allowed_paths = []
    blocks.blocked_paths = []
    token = LocalContext.blocks.set(blocks)
    try:
        yield blocks
    finally:
        LocalContext.blocks.reset(token)


def _make_file_data_dict(path: str) -> dict:
    """Create a dict with the full FileData shape including meta."""
    return {
        "path": path,
        "url": None,
        "size": None,
        "orig_name": None,
        "mime_type": None,
        "is_stream": False,
        "meta": {"_type": "gradio.FileData"},
    }


class TestPlainDictNotTreatedAsFile:
    """Dicts that lack the FileData meta signature must pass through untouched."""

    def test_dict_with_path_key_only(self):
        """A dict like {"path": "/etc/passwd"} should not be touched."""
        data = {"path": "/etc/passwd"}
        result = processing_utils.move_files_to_cache(
            data, gr.Textbox(), postprocess=True
        )
        assert result == data

    def test_dict_with_path_and_wrong_meta(self):
        """A dict with a meta key but wrong _type should not be touched."""
        data = {"path": "/etc/passwd", "meta": {"_type": "not.gradio.FileData"}}
        result = processing_utils.move_files_to_cache(
            data, gr.Textbox(), postprocess=True
        )
        assert result == data

    def test_dict_with_path_and_no_type_in_meta(self):
        """A dict with a meta key but missing _type should not be touched."""
        data = {"path": "/etc/passwd", "meta": {"foo": "bar"}}
        result = processing_utils.move_files_to_cache(
            data, gr.Textbox(), postprocess=True
        )
        assert result == data

    def test_nested_dict_with_path_key(self):
        """A nested dict containing a path key should not be treated as a file."""
        data = {
            "results": [
                {"path": "/etc/shadow", "score": 0.9},
                {"path": "/root/.ssh/id_rsa", "score": 0.1},
            ]
        }
        result = processing_utils.move_files_to_cache(data, gr.JSON(), postprocess=True)
        assert result == data

    def test_arbitrary_dict_in_list(self):
        """A list of plain dicts with path keys should pass through."""
        data = [
            {"path": "/etc/passwd", "label": "users"},
            {"path": "/var/log/syslog", "label": "logs"},
        ]
        result = processing_utils.move_files_to_cache(data, gr.JSON(), postprocess=True)
        assert result == data


class TestFileDataWithDisallowedPath:
    """Dicts that match the FileData signature but reference files outside
    allowed directories must raise InvalidPathError."""

    def test_etc_passwd_raises(self):
        """A FileData pointing to /etc/passwd must be rejected after launch."""
        data = _make_file_data_dict("/etc/passwd")
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(data, gr.File(), postprocess=True)

    def test_root_ssh_key_raises(self):
        """A FileData pointing to an SSH key must be rejected."""
        data = _make_file_data_dict("/root/.ssh/id_rsa")
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(data, gr.File(), postprocess=True)

    def test_path_traversal_raises(self):
        """A path traversal attempt must be rejected."""
        data = _make_file_data_dict("../../../etc/passwd")
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(data, gr.File(), postprocess=True)

    def test_nested_filedata_with_disallowed_path_raises(self):
        """FileData nested inside a larger structure must still be validated."""
        data = {
            "chatbot": [
                {
                    "role": "assistant",
                    "content": _make_file_data_dict("/etc/shadow"),
                }
            ]
        }
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(
                    data, gr.Chatbot(), postprocess=True
                )

    def test_allowed_temp_file_succeeds(self):
        """A FileData pointing to an allowed temp file should succeed."""
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
            f.write(b"hello")
            temp_path = f.name

        data = _make_file_data_dict(temp_path)
        with launched_blocks_context():
            # tempdir is in the default allowed paths, so this should work
            result = processing_utils.move_files_to_cache(
                data, gr.File(), postprocess=True
            )
            assert result["meta"]["_type"] == "gradio.FileData"
            # The path should have been changed (moved to cache)
            assert result["path"] != temp_path

        Path(temp_path).unlink(missing_ok=True)


class TestAsyncVariants:
    """Ensure the async code paths have the same protections."""

    @pytest.mark.asyncio
    async def test_plain_dict_ignored_async(self):
        data = {"path": "/etc/passwd"}
        result = await processing_utils.async_move_files_to_cache(
            data, gr.Textbox(), postprocess=True
        )
        assert result == data

    @pytest.mark.asyncio
    async def test_disallowed_path_raises_async(self):
        data = _make_file_data_dict("/etc/passwd")
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                await processing_utils.async_move_files_to_cache(
                    data, gr.File(), postprocess=True
                )


class TestBrowserStatePydanticNoFileCaching:
    """Ensure that Pydantic models converted via model_dump() in BrowserState
    do not produce dicts that trick move_files_to_cache into caching files."""

    def test_model_with_path_field_not_treated_as_file(self):
        """A Pydantic model with a 'path' field should not be treated as FileData
        because model_dump() won't produce the meta signature."""

        class Config(BaseModel):
            path: str
            name: str

        state = gr.BrowserState()
        result = state.postprocess(Config(path="/etc/passwd", name="secret"))
        assert result == {"path": "/etc/passwd", "name": "secret"}

        # Now verify move_files_to_cache ignores it (no meta field)
        cached = processing_utils.move_files_to_cache(result, state, postprocess=True)
        assert cached == result  # unchanged, not treated as a file

    def test_model_with_path_and_meta_fields_blocked(self):
        """Adversarial case: a Pydantic model whose model_dump() output
        matches the FileData signature. Even if it does, _check_allowed
        must block paths outside allowed directories."""

        class MaliciousModel(BaseModel):
            path: str
            url: str | None = None
            size: int | None = None
            orig_name: str | None = None
            mime_type: str | None = None
            is_stream: bool = False
            meta: dict = {"_type": "gradio.FileData"}

        state = gr.BrowserState()
        result = state.postprocess(MaliciousModel(path="/etc/passwd"))

        # model_dump() produces a dict that looks exactly like FileData
        assert result["path"] == "/etc/passwd"
        assert result["meta"]["_type"] == "gradio.FileData"

        # But _check_allowed must block it after launch
        with launched_blocks_context():
            with pytest.raises(InvalidPathError):
                processing_utils.move_files_to_cache(result, state, postprocess=True)

    def test_model_with_nested_path_not_treated_as_file(self):
        """A nested Pydantic model with path fields should not trigger caching."""

        class FileRef(BaseModel):
            path: str
            label: str

        class Report(BaseModel):
            title: str
            files: list[FileRef]

        state = gr.BrowserState()
        report = Report(
            title="Test",
            files=[
                FileRef(path="/etc/passwd", label="passwords"),
                FileRef(path="/etc/shadow", label="shadow"),
            ],
        )
        result = state.postprocess(report)

        # No meta field → move_files_to_cache should ignore these
        cached = processing_utils.move_files_to_cache(result, state, postprocess=True)
        assert cached == result

    def test_default_value_pydantic_with_path_not_cached(self):
        """A Pydantic default_value with a path field should be converted
        to a plain dict and not trigger file caching."""

        class Settings(BaseModel):
            path: str
            debug: bool

        state = gr.BrowserState(default_value=Settings(path="/etc/passwd", debug=True))
        assert state.default_value == {"path": "/etc/passwd", "debug": True}
        assert isinstance(state.default_value, dict)

        # Verify it's not treated as a file
        cached = processing_utils.move_files_to_cache(
            state.default_value, state, postprocess=True
        )
        assert cached == state.default_value
