import os
import unittest.mock as mock

import paramiko
import requests

from gradio import Interface, networking, tunneling

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestTunneling:
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
