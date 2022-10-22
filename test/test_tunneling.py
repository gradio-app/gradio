import io
import json
import os
import sys
import threading
import unittest
import unittest.mock as mock

import requests

from gradio import Interface, networking, tunneling

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


# class TestTunneling(unittest.TestCase):
#     def test_create_tunnel(self):
#         response = requests.get(networking.GRADIO_API_SERVER)
#         payload = response.json()[0]
#         io = Interface(lambda x: x, "text", "text")
#         _, path_to_local_server, _ = io.launch(prevent_thread_lock=True, share=False)
#         _, localhost, port = path_to_local_server.split(":")
#         paramiko.SSHClient.connect = mock.MagicMock(return_value=None)
#         tunneling.create_tunnel(payload, localhost, port)
#         paramiko.SSHClient.connect.assert_called_once()
#         io.close()

if __name__ == "__main__":
    unittest.main()
