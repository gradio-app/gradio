import ipaddress
import os
import unittest
import unittest.mock as mock
import warnings

import pkg_resources
import requests

from gradio.test_data.blocks_configs import (
    XRAY_CONFIG,
    XRAY_CONFIG_DIFF_IDS,
    XRAY_CONFIG_WITH_MISTAKE,
)
from gradio.utils import (
    assert_configs_are_equivalent_besides_ids,
    colab_check,
    error_analytics,
    format_ner_list,
    get_local_ip_address,
    ipython_check,
    json,
    launch_analytics,
    readme_to_html,
    version_check,
)

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestUtils(unittest.TestCase):
    @mock.patch("pkg_resources.require")
    def test_should_fail_with_distribution_not_found(self, mock_require):

        mock_require.side_effect = pkg_resources.DistributionNotFound()

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(
                str(w[-1].message),
                "gradio is not setup or installed properly. Unable to get version info.",
            )

    @mock.patch("requests.get")
    def test_should_warn_with_unable_to_parse(self, mock_get):

        mock_get.side_effect = json.decoder.JSONDecodeError("Expecting value", "", 0)

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(
                str(w[-1].message), "unable to parse version details from package URL."
            )

    @mock.patch("requests.Response.json")
    def test_should_warn_url_not_having_version(self, mock_json):

        mock_json.return_value = {"foo": "bar"}

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(
                str(w[-1].message), "package URL does not contain version info."
            )

    @mock.patch("requests.post")
    def test_error_analytics_doesnt_crash_on_connection_error(self, mock_post):

        mock_post.side_effect = requests.ConnectionError()
        error_analytics("placeholder", "placeholder")
        mock_post.assert_called()

    @mock.patch("requests.post")
    def test_error_analytics_successful(self, mock_post):
        error_analytics("placeholder", "placeholder")
        mock_post.assert_called()

    @mock.patch("requests.post")
    def test_launch_analytics_doesnt_crash_on_connection_error(self, mock_post):
        mock_post.side_effect = requests.ConnectionError()
        launch_analytics(data={})
        mock_post.assert_called()

    @mock.patch("IPython.get_ipython")
    def test_colab_check_no_ipython(self, mock_get_ipython):
        mock_get_ipython.return_value = None
        assert colab_check() is False

    @mock.patch("IPython.get_ipython")
    def test_ipython_check_import_fail(self, mock_get_ipython):
        mock_get_ipython.side_effect = ImportError()
        assert ipython_check() is False

    @mock.patch("IPython.get_ipython")
    def test_ipython_check_no_ipython(self, mock_get_ipython):
        mock_get_ipython.return_value = None
        assert ipython_check() is False

    @mock.patch("requests.get")
    def test_readme_to_html_doesnt_crash_on_connection_error(self, mock_get):
        mock_get.side_effect = requests.ConnectionError()
        readme_to_html("placeholder")

    def test_readme_to_html_correct_parse(self):
        readme_to_html("https://github.com/gradio-app/gradio/blob/master/README.md")


class TestIPAddress(unittest.TestCase):
    def test_get_ip(self):
        ip = get_local_ip_address()
        try:  # check whether ip is valid
            ipaddress.ip_address(ip)
        except ValueError:
            self.fail("Invalid IP address")

    @mock.patch("requests.get")
    def test_get_ip_without_internet(self, mock_get):
        mock_get.side_effect = requests.ConnectionError()
        ip = get_local_ip_address()
        self.assertEqual(ip, "No internet connection")


class TestAssertConfigsEquivalent(unittest.TestCase):
    def test_same_configs(self):
        self.assertTrue(
            assert_configs_are_equivalent_besides_ids(XRAY_CONFIG, XRAY_CONFIG)
        )

    def test_equivalent_configs(self):
        self.assertTrue(
            assert_configs_are_equivalent_besides_ids(XRAY_CONFIG, XRAY_CONFIG_DIFF_IDS)
        )

    def test_different_configs(self):
        with self.assertRaises(AssertionError):
            assert_configs_are_equivalent_besides_ids(
                XRAY_CONFIG_WITH_MISTAKE, XRAY_CONFIG
            )


class TestFormatNERList(unittest.TestCase):
    def test_format_ner_list_standard(self):
        string = "Wolfgang lives in Berlin"
        groups = [
            {"entity_group": "PER", "start": 0, "end": 8},
            {"entity_group": "LOC", "start": 18, "end": 24},
        ]
        result = [
            ("", None),
            ("Wolfgang", "PER"),
            (" lives in ", None),
            ("Berlin", "LOC"),
            ("", None),
        ]
        self.assertEqual(format_ner_list(string, groups), result)

    def test_format_ner_list_empty(self):
        string = "I live in a city"
        groups = []
        result = [("I live in a city", None)]
        self.assertEqual(format_ner_list(string, groups), result)


if __name__ == "__main__":
    unittest.main()
