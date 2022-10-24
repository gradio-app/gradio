import os
import unittest

import requests

from gradio import Interface, tunneling

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestTunneling(unittest.TestCase):
    def test_create_tunnel(self):
        io = Interface(lambda x: x, "text", "text")
        _, path_to_local_server, _ = io.launch(prevent_thread_lock=True, share=False)
        _, _, port = path_to_local_server.split(":")
        share_url = tunneling.create_tunnel(port)
        response = requests.head(share_url)
        assert response.status_code == 200

if __name__ == "__main__":
    unittest.main()
