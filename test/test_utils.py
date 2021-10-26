from gradio.utils import *
import unittest
import pkg_resources
import unittest.mock as mock
import warnings
import requests


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

        mock_get.side_effect = requests.ConnectionError()

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
            
            
    @mock.patch("requests.post")
    def test_error_analytics_doesnt_crash_on_connection_error(self, mock_post):

        mock_post.side_effect = requests.ConnectionError()
        error_analytics("placeholder")
     
    @mock.patch("requests.post")   
    def test_error_analytics_successful(self, mock_post):
        error_analytics("placeholder")
        
            
    @mock.patch("IPython.get_ipython")
    @mock.patch("gradio.utils.error_analytics")
    def test_colab_check_sends_analytics_on_import_fail(self, mock_error_analytics, mock_get_ipython):

        mock_get_ipython.side_effect = ImportError()
        colab_check()
        mock_error_analytics.assert_called_with("NameError")
        
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


if __name__ == '__main__':
    unittest.main()
