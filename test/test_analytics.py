import asyncio
import json
import os
import warnings
from unittest.mock import patch

import pytest

from gradio import analytics, wasm_utils

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestAnalytics:
    @patch("httpx.get")
    def test_should_warn_with_unable_to_parse(self, mock_get, monkeypatch):
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        mock_get.side_effect = json.decoder.JSONDecodeError("Expecting value", "", 0)

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            analytics.version_check()
            assert (
                str(w[-1].message)
                == "unable to parse version details from package URL."
            )

    @patch("gradio.analytics._send_telemetry_in_thread")
    def test_error_analytics_doesnt_crash_on_connection_error(
        self, mock_send, monkeypatch
    ):
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        mock_send.side_effect = Exception("Connection error")
        analytics._do_normal_analytics_request("placeholder", {})
        mock_send.assert_called()

    @patch("gradio.analytics._send_telemetry_in_thread")
    def test_error_analytics_successful(self, mock_post, monkeypatch):
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        analytics.error_analytics("placeholder")

    @patch.object(wasm_utils, "IS_WASM", True)
    @patch("gradio.analytics.pyodide_pyfetch")
    @pytest.mark.asyncio
    async def test_error_analytics_successful_in_wasm_mode(
        self, pyodide_pyfetch, monkeypatch
    ):
        loop = asyncio.get_event_loop()
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")

        analytics.error_analytics("placeholder")

        # Await all background tasks.
        # Ref: https://superfastpython.com/asyncio-wait-for-tasks/#How_to_Wait_for_All_Background_Tasks
        all_tasks = asyncio.all_tasks(loop)
        current_task = asyncio.current_task()
        assert current_task
        all_tasks.remove(current_task)
        await asyncio.wait(all_tasks)

        pyodide_pyfetch.assert_called()
