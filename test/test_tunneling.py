import io
import json
import os
import sys
import threading
import unittest
import unittest.mock as mock

import paramiko
import requests

from gradio import Interface, networking, tunneling

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestTunneling(unittest.TestCase):
    def test_create_tunnel(self):
        response = requests.get(networking.GRADIO_API_SERVER)
        payload = response.json()[0]
        io = Interface(lambda x: x, "text", "text")
        _, path_to_local_server, _ = io.launch(prevent_thread_lock=True, share=False)
        _, localhost, port = path_to_local_server.split(":")
        paramiko.SSHClient.connect = mock.MagicMock(return_value=None)
        tunneling.create_tunnel(payload, localhost, port)
        paramiko.SSHClient.connect.assert_called_once()
        io.close()


class TestVerbose(unittest.TestCase):
    """Not absolutely needed but just including them for the sake of completion."""

    def setUp(self):
        self.message = "print test"
        self.capturedOutput = io.StringIO()  # Create StringIO object
        sys.stdout = self.capturedOutput  # and redirect stdout.

    def test_verbose_debug_true(self):
        tunneling.verbose(self.message, debug_mode=True)
        self.assertEqual(self.capturedOutput.getvalue().strip(), self.message)

    def test_verbose_debug_false(self):
        tunneling.verbose(self.message, debug_mode=False)
        self.assertEqual(self.capturedOutput.getvalue().strip(), "")

    def tearDown(self):
        sys.stdout = sys.__stdout__


if __name__ == "__main__":
    unittest.main()
