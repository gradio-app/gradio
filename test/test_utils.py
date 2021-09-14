from gradio.utils import *
import unittest
import pkg_resources
import unittest.mock as mock
import warnings


class TestUtils(unittest.TestCase):
    @mock.patch("pkg_resources.require")
    def test_should_fail_with_distribution_not_found(self, mock_require):

        mock_require.side_effect = pkg_resources.DistributionNotFound()

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(str(w[-1].message), "gradio is not setup or installed properly. Unable to get version info.")

    @mock.patch("requests.get")
    def test_should_warn_with_unable_to_parse(self, mock_get):

        mock_get.side_effect = json.decoder.JSONDecodeError("Expecting value", "", 0)

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(str(w[-1].message), "unable to parse version details from package URL.")

    @mock.patch("requests.get")
    def test_should_warn_with_connection_error(self, mock_get):

        mock_get.side_effect = ConnectionError()

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(str(w[-1].message), "unable to connect with package URL to collect version info.")

    @mock.patch("requests.Response.json")
    def test_should_warn_url_not_having_version(self, mock_json):

        mock_json.return_value = {"foo": "bar"}

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(str(w[-1].message), "package URL does not contain version info.")


if __name__ == '__main__':
    unittest.main()
