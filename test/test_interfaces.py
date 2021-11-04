from gradio.interface import *
import unittest
import unittest.mock as mock
import requests
import sys
from contextlib import contextmanager
import io
import threading

@contextmanager
def captured_output():
    new_out, new_err = io.StringIO(), io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    try:
        sys.stdout, sys.stderr = new_out, new_err
        yield sys.stdout, sys.stderr
    finally:
        sys.stdout, sys.stderr = old_out, old_err


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
            
    def test_test_launch(self):
        with captured_output() as (out, err):
            prediction_fn = lambda x: x
            prediction_fn.__name__ = "prediction_fn"
            interface = Interface(prediction_fn, "textbox", "label")
            interface.test_launch()
            output = out.getvalue().strip()
            self.assertEqual(output, 'Test launch: prediction_fn()... PASSED')
            
    @mock.patch("time.sleep")
    def test_run_until_interupted(self, mock_sleep):
        with self.assertRaises(KeyboardInterrupt):
            with captured_output() as (out, err):
                mock_sleep.side_effect = KeyboardInterrupt()
                interface = Interface(lambda x: x, "textbox", "label")
                interface.enable_queue = False
                thread = threading.Thread()
                thread.keep_running = mock.MagicMock()
                interface.run_until_interrupted(thread, None)
                output = out.getvalue().strip()
                self.assertEqual(output, 'Keyboard interruption in main thread... closing server.')

if __name__ == '__main__':
    unittest.main()