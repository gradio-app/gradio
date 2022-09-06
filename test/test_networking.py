"""Contains tests for networking.py and app.py"""

import os
import unittest
import unittest.mock as mock
import urllib
import warnings

from fastapi.testclient import TestClient

import gradio as gr
from gradio import Interface, networking

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestPort(unittest.TestCase):
    def test_port_is_in_range(self):
        start = 7860
        end = 7960
        try:
            port = networking.get_first_available_port(start, end)
            self.assertTrue(start <= port <= end)
        except OSError:
            warnings.warn("Unable to test, no ports available")

    def test_same_port_is_returned(self):
        start = 7860
        end = 7960
        try:
            port1 = networking.get_first_available_port(start, end)
            port2 = networking.get_first_available_port(start, end)
            self.assertEqual(port1, port2)
        except OSError:
            warnings.warn("Unable to test, no ports available")


class TestInterfaceErrors(unittest.TestCase):
    def test_processing_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/predict/", json={"data": [0], "fn_index": 0})
        self.assertEqual(response.status_code, 500)
        self.assertTrue("error" in response.json())
        io.close()

    def test_validation_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/predict/", json={"fn_index": [0]})
        self.assertEqual(response.status_code, 422)
        io.close()


class TestStartServer(unittest.TestCase):
    def test_start_server(self):
        io = Interface(lambda x: x, "number", "number")
        io.favicon_path = None
        io.config = io.get_config_file()
        io.show_error = True
        io.flagging_callback.setup(gr.Number(), io.flagging_dir)
        io.auth = None

        port = networking.get_first_available_port(
            networking.INITIAL_PORT_VALUE,
            networking.INITIAL_PORT_VALUE + networking.TRY_NUM_PORTS,
        )
        io.enable_queue = False
        _, _, local_path, _, server = networking.start_server(io, server_port=port)
        url = urllib.parse.urlparse(local_path)
        self.assertEquals(url.scheme, "http")
        self.assertEquals(url.port, port)
        server.close()


# class TestFlagging(unittest.TestCase):
#     def test_flagging_analytics(self):
#         callback = flagging.CSVLogger()
#         callback.flag = mock.MagicMock()
#         aiohttp.ClientSession.post = mock.MagicMock()
#         aiohttp.ClientSession.post.__aenter__ = None
#         aiohttp.ClientSession.post.__aexit__ = None
#         io = Interface(
#             lambda x: x,
#             "text",
#             "text",
#             analytics_enabled=True,
#             flagging_callback=callback,
#         )
#         app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
#         client = TestClient(app)
#         response = client.post(
#             "/api/flag/",
#             json={"data": {"input_data": ["test"], "output_data": ["test"]}},
#         )
#         aiohttp.ClientSession.post.assert_called()
#         callback.flag.assert_called_once()
#         self.assertEqual(response.status_code, 200)
#         io.close()


# class TestInterpretation(unittest.TestCase):
#     def test_interpretation(self):
#         io = Interface(
#             lambda x: len(x),
#             "text",
#             "label",
#             interpretation="default",
#             analytics_enabled=True,
#         )
#         app, _, _ = io.launch(prevent_thread_lock=True)
#         client = TestClient(app)
#         aiohttp.ClientSession.post = mock.MagicMock()
#         aiohttp.ClientSession.post.__aenter__ = None
#         aiohttp.ClientSession.post.__aexit__ = None
#         io.interpret = mock.MagicMock(return_value=(None, None))
#         response = client.post("/api/interpret/", json={"data": ["test test"]})
#         aiohttp.ClientSession.post.assert_called()
#         self.assertEqual(response.status_code, 200)
#         io.close()


class TestURLs(unittest.TestCase):
    def test_setup_tunnel(self):
        networking.create_tunnel = mock.MagicMock(return_value="test")
        res = networking.setup_tunnel(None, None)
        self.assertEqual(res, "test")

    def test_url_ok(self):
        res = networking.url_ok("https://www.gradio.app")
        self.assertTrue(res)


if __name__ == "__main__":
    unittest.main()
