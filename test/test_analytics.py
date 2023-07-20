import ipaddress
import json
import os
import warnings
from unittest import mock as mock

import pytest
import requests

from gradio import analytics
from gradio.context import Context

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestAnalytics:
    @mock.patch("requests.get")
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

    @mock.patch("requests.post")
    def test_error_analytics_doesnt_crash_on_connection_error(
        self, mock_post, monkeypatch
    ):
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        mock_post.side_effect = requests.ConnectionError()
        analytics._do_analytics_request("placeholder", {})
        mock_post.assert_called()

    @mock.patch("requests.post")
    def test_error_analytics_successful(self, mock_post, monkeypatch):
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        analytics.error_analytics("placeholder")
        mock_post.assert_called()


class TestIPAddress:
    @pytest.mark.flaky
    def test_get_ip(self):
        Context.ip_address = None
        ip = analytics.get_local_ip_address()
        if ip == "No internet connection" or ip == "Analytics disabled":
            return
        ipaddress.ip_address(ip)

    @mock.patch("requests.get")
    def test_get_ip_without_internet(self, mock_get, monkeypatch):
        mock_get.side_effect = requests.ConnectionError()
        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "True")
        Context.ip_address = None
        ip = analytics.get_local_ip_address()
        assert ip == "No internet connection"

        monkeypatch.setenv("GRADIO_ANALYTICS_ENABLED", "False")
        Context.ip_address = None
        ip = analytics.get_local_ip_address()
        assert ip == "Analytics disabled"
