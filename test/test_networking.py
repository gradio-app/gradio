"""Contains tests for networking.py and app.py"""

import os
import unittest
import unittest.mock as mock
import urllib.request
import warnings

import aiohttp
from fastapi.testclient import TestClient

from gradio import Interface, flagging, networking, reset_all, utils

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


class TestRoutes(unittest.TestCase):
    def setUp(self) -> None:
        self.io = Interface(lambda x: x, "text", "text")
        self.app, _, _ = self.io.launch(prevent_thread_lock=True)
        self.client = TestClient(self.app)

    def test_get_main_route(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)

    def test_get_api_route(self):
        response = self.client.get("/api/")
        self.assertEqual(response.status_code, 200)

    def test_static_files_served_safely(self):
        # Make sure things outside the static folder are not accessible
        response = self.client.get(r"/static/..%2findex.html")
        self.assertEqual(response.status_code, 404)
        response = self.client.get(r"/static/..%2f..%2fapi_docs.html")
        self.assertEqual(response.status_code, 404)

    def test_get_config_route(self):
        response = self.client.get("/config/")
        self.assertEqual(response.status_code, 200)

    def test_predict_route(self):
        response = self.client.post("/api/predict/", json={"data": ["test"]})
        self.assertEqual(response.status_code, 200)
        output = dict(response.json())
        self.assertEqual(output["data"], ["test"])
        self.assertTrue("durations" in output)
        self.assertTrue("avg_durations" in output)

    # def test_queue_push_route(self):
    #     networking.queue.push = mock.MagicMock(return_value=(None, None))
    #     response = self.client.post('/api/queue/push/', json={"data": "test", "action": "test"})
    #     self.assertEqual(response.status_code, 200)

    # def test_queue_push_route(self):
    #     networking.queue.get_status = mock.MagicMock(return_value=(None, None))
    #     response = self.client.post('/api/queue/status/', json={"hash": "test"})
    #     self.assertEqual(response.status_code, 200)

    def tearDown(self) -> None:
        self.io.close()
        reset_all()


class TestAuthenticatedRoutes(unittest.TestCase):
    def setUp(self) -> None:
        self.io = Interface(lambda x: x, "text", "text")
        self.app, _, _ = self.io.launch(
            auth=("test", "correct_password"), prevent_thread_lock=True
        )
        self.client = TestClient(self.app)

    def test_post_login(self):
        response = self.client.post(
            "/login", data=dict(username="test", password="correct_password")
        )
        self.assertEqual(response.status_code, 302)
        response = self.client.post(
            "/login", data=dict(username="test", password="incorrect_password")
        )
        self.assertEqual(response.status_code, 400)

    def tearDown(self) -> None:
        self.io.close()
        reset_all()


class TestInterfaceCustomParameters(unittest.TestCase):
    def test_show_error(self):
        io = Interface(lambda x: 1 / x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post("/api/predict/", json={"data": [0]})
        self.assertEqual(response.status_code, 500)
        self.assertTrue("error" in response.json())
        io.close()


class TestFlagging(unittest.TestCase):
    def test_flagging_analytics(self):
        callback = flagging.CSVLogger()
        callback.flag = mock.MagicMock()
        aiohttp.ClientSession.post = mock.MagicMock()
        aiohttp.ClientSession.post.__aenter__ = None
        aiohttp.ClientSession.post.__aexit__ = None
        io = Interface(
            lambda x: x,
            "text",
            "text",
            analytics_enabled=True,
            flagging_callback=callback,
        )
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = TestClient(app)
        response = client.post(
            "/api/flag/",
            json={"data": {"input_data": ["test"], "output_data": ["test"]}},
        )
        aiohttp.ClientSession.post.assert_called()
        callback.flag.assert_called_once()
        self.assertEqual(response.status_code, 200)
        io.close()


class TestInterpretation(unittest.TestCase):
    def test_interpretation(self):
        io = Interface(
            lambda x: len(x),
            "text",
            "label",
            interpretation="default",
            analytics_enabled=True,
        )
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = TestClient(app)
        aiohttp.ClientSession.post = mock.MagicMock()
        aiohttp.ClientSession.post.__aenter__ = None
        aiohttp.ClientSession.post.__aexit__ = None
        io.interpret = mock.MagicMock(return_value=(None, None))
        response = client.post("/api/interpret/", json={"data": ["test test"]})
        aiohttp.ClientSession.post.assert_called()
        self.assertEqual(response.status_code, 200)
        io.close()


class TestURLs(unittest.TestCase):
    def test_url_ok(self):
        urllib.request.urlopen = mock.MagicMock(return_value="test")
        res = networking.url_request("http://www.gradio.app")
        self.assertEqual(res, "test")

    def test_setup_tunnel(self):
        networking.create_tunnel = mock.MagicMock(return_value="test")
        res = networking.setup_tunnel(None, None)
        self.assertEqual(res, "test")

    def test_url_ok(self):
        res = networking.url_ok("https://www.gradio.app")
        self.assertTrue(res)


# class TestQueuing(unittest.TestCase):
#     def test_queueing(self):
#         # mock queue methods and post method
#         networking.queue.pop = mock.MagicMock(return_value=(None, None, None, 'predict'))
#         networking.queue.pass_job = mock.MagicMock(return_value=(None, None))
#         networking.queue.fail_job = mock.MagicMock(return_value=(None, None))
#         networking.queue.start_job = mock.MagicMock(return_value=None)
#         requests.post = mock.MagicMock(return_value=mock.MagicMock(status_code=200))
#         # execute queue action successfully
#         networking.queue_thread('test_path', test_mode=True)
#         networking.queue.pass_job.assert_called_once()
#         # execute queue action unsuccessfully
#         requests.post = mock.MagicMock(return_value=mock.MagicMock(status_code=500))
#         networking.queue_thread('test_path', test_mode=True)
#         networking.queue.fail_job.assert_called_once()
#         # no more things on the queue so methods shouldn't be called any more times
#         networking.queue.pop = mock.MagicMock(return_value=None)
#         networking.queue.pass_job.assert_called_once()
#         networking.queue.fail_job.assert_called_once()


if __name__ == "__main__":
    unittest.main()
