from gradio.interface import *
import unittest
import unittest.mock as mock
import requests


class TestInterface(unittest.TestCase):
    
    # send_error_analytics should probably actually be a method of Interface
    # (so it doesn't have to take the 'enabled' argument)
    # and since it's specific to the launch method, it should probably be
    # renamed to send_launch_error_analytics.
    # these tests test its current behavior
    @mock.patch("requests.post")
    def test_error_analytics_doesnt_crash_on_connection_error(self, mock_post):
        mock_post.side_effect = requests.ConnectionError()
        send_error_analytics(True)
        mock_post.assert_called()
        
    @mock.patch("requests.post")
    def test_error_analytics_doesnt_post_if_not_enabled(self, mock_post):
        send_error_analytics(False)
        mock_post.assert_not_called()
     
    @mock.patch("requests.post")   
    def test_error_analytics_successful(self, mock_post):
        send_error_analytics(True)
        mock_post.assert_called()
                
    # as above, send_launch_analytics should probably be a method of Interface
    @mock.patch("requests.post")
    def test_launch_analytics_doesnt_crash_on_connection_error(self, mock_post):
        mock_post.side_effect = requests.ConnectionError()
        send_launch_analytics(analytics_enabled=True,
                              inbrowser=True, is_colab="is_colab",
	                              share="share", share_url="share_url")
        mock_post.assert_called()
        
    @mock.patch("requests.post")
    def test_launch_analytics_doesnt_post_if_not_enabled(self, mock_post):
        send_launch_analytics(analytics_enabled=False,
                              inbrowser=True, is_colab="is_colab",
	                              share="share", share_url="share_url")
        mock_post.assert_not_called()
     
    def test_reset_all(self):
        interface = Interface(lambda input: None, "textbox", "label")
        interface.close = mock.MagicMock()
        reset_all()
        interface.close.assert_called()
        
    def test_examples_invalid_input(self):
        with self.assertRaises(ValueError):
            Interface(lambda x: x, examples=1234)
        
    def test_examples_not_valid_path(self):
        with self.assertRaises(FileNotFoundError):
            interface = Interface(lambda x: x, "textbox", "label", examples='invalid-path')
            interface.launch()


if __name__ == '__main__':
    unittest.main()