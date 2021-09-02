from gradio.utils import *
import unittest
import pkg_resources
import unittest.mock as mock


class TestUtils(unittest.TestCase):
    @mock.patch("pkg_resources.require")
    def test_should_fail_with_distribution_not_found(self, mock_require):

        mock_require.side_effect = pkg_resources.DistributionNotFound()

        with self.assertRaises(RuntimeError) as e:
            version_check()
        self.assertEqual(str(e.exception), "gradio is not setup or installed properly. Unable to get version info.")

    @mock.patch("requests.get")
    def test_should_warn_with_unable_to_parse(self, mock_get):

        mock_get.side_effect = json.decoder.JSONDecodeError("Expecting value", "", 0)

        with self.assertRaises(RuntimeWarning) as e:
            version_check()
        self.assertEqual(str(e.exception), "Unable to parse version details from package URL.")

    @mock.patch("requests.get")
    def test_should_warn_with_connection_error(self, mock_get):

        mock_get.side_effect = ConnectionError()

        with self.assertRaises(RuntimeWarning) as e:
            version_check()
        self.assertEqual(str(e.exception), "Unable to connect with package URL to collect version info.")

    @mock.patch("requests.Response.json")
    def test_should_warn_url_not_having_version(self, mock_json):

        mock_json.return_value = {"foo": "bar"}

        with self.assertRaises(RuntimeWarning) as e:
            version_check()
        self.assertEqual(str(e.exception), "Package URL does not contain version info.")


if __name__ == '__main__':
    unittest.main()
