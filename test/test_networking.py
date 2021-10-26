from gradio import networking
import gradio as gr
import unittest
import unittest.mock as mock
import ipaddress
import requests
import warnings
import tempfile
from unittest.mock import ANY
import urllib.request


class TestUser(unittest.TestCase):
    def test_id(self):
        user = networking.User("test")
        self.assertEqual(user.get_id(), "test")
    
    def test_load_user(self):
        user = networking.load_user("test")
        self.assertEqual(user.get_id(), "test")

class TestIPAddress(unittest.TestCase):
    def test_get_ip(self):
        ip = networking.get_local_ip_address()
        try:  # check whether ip is valid
            ipaddress.ip_address(ip)
        except ValueError:
            self.fail("Invalid IP address")

    @mock.patch("requests.get")
    def test_get_ip_without_internet(self, mock_get):
        mock_get.side_effect = requests.ConnectionError()
        ip = networking.get_local_ip_address()
        self.assertEqual(ip, "No internet connection")

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


class TestFlaskRoutes(unittest.TestCase):
    def setUp(self) -> None:
        self.io = gr.Interface(lambda x: x, "text", "text") 
        self.app, _, _ = self.io.launch(prevent_thread_lock=True)
        self.client = self.app.test_client()

    def test_get_main_route(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_get_config_route(self):
        response = self.client.get('/config/')
        self.assertEqual(response.status_code, 200)

    def test_get_static_route(self):
        response = self.client.get('/static/bundle.css')
        self.assertEqual(response.status_code, 200)

    def test_enable_sharing_route(self):
        path = "www.gradio.app"
        response = self.client.get('/enable_sharing/www.gradio.app')
        self.assertEqual(response.status_code, 200)  
        self.assertEqual(self.io.config["share_url"], path) 

    def test_predict_route(self):
        response = self.client.post('/api/predict/', json={"data": ["test"]})
        self.assertEqual(response.status_code, 200)  
        output = dict(response.get_json())
        self.assertEqual(output["data"], ["test"]) 
        self.assertTrue("durations" in output) 
        self.assertTrue("avg_durations" in output) 

    def test_queue_push_route(self):
        networking.queue.push = mock.MagicMock(return_value=(None, None))
        response = self.client.post('/api/queue/push/', json={"data": "test", "action": "test"})
        self.assertEqual(response.status_code, 200)  

    def test_queue_push_route(self):
        networking.queue.get_status = mock.MagicMock(return_value=(None, None))
        response = self.client.post('/api/queue/status/', json={"hash": "test"})
        self.assertEqual(response.status_code, 200)  

    def tearDown(self) -> None:
        self.io.close()
        gr.reset_all()


class TestAuthenticatedFlaskRoutes(unittest.TestCase):
    def setUp(self) -> None:
        self.io = gr.Interface(lambda x: x, "text", "text") 
        self.app, _, _ = self.io.launch(auth=("test", "correct_password"), prevent_thread_lock=True)
        self.client = self.app.test_client()

    def test_get_login_route(self):
        response = self.client.get('/login')  
        self.assertEqual(response.status_code, 200)

    def test_post_login(self):
        response = self.client.post('/login', data=dict(username="test", password="correct_password"))
        self.assertEqual(response.status_code, 302)
        response = self.client.post('/login', data=dict(username="test", password="incorrect_password"))
        self.assertEqual(response.status_code, 401) 

    def tearDown(self) -> None:
        self.io.close()
        gr.reset_all()

class TestInterfaceCustomParameters(unittest.TestCase):
    def test_show_error(self):
        io = gr.Interface(lambda x: 1/x, "number", "number")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = app.test_client()
        response = client.post('/api/predict/', json={"data": [0]})
        self.assertEqual(response.status_code, 500)
        self.assertTrue("error" in response.get_json())
        io.close()

    def test_feature_logging(self):
        io = gr.Interface(lambda x: 1/x, "number", "number")
        io.launch(show_error=True, prevent_thread_lock=True)
        with mock.patch('requests.post') as mock_post:
            networking.log_feature_analytics("test_feature")
            mock_post.assert_called_once_with(networking.GRADIO_FEATURE_ANALYTICS_URL, data=ANY, timeout=ANY)
        io = gr.Interface(lambda x: 1/x, "number", "number", analytics_enabled=False)
        io.launch(show_error=True, prevent_thread_lock=True)
        with mock.patch('requests.post') as mock_post:
            networking.log_feature_analytics("test_feature")
            mock_post.assert_not_called()
        io.close()

class TestFlagging(unittest.TestCase):
    def test_num_rows_written(self):
        io = gr.Interface(lambda x: x, "text", "text")
        io.launch(prevent_thread_lock=True)
        with tempfile.TemporaryDirectory() as tmpdirname:
            row_count = networking.flag_data(["test"], ["test"], flag_path=tmpdirname)
            self.assertEquals(row_count, 1)  # 2 rows written including header
            row_count = networking.flag_data("test", "test", flag_path=tmpdirname)
            self.assertEquals(row_count, 2)  # 3 rows written including header
        io.close()

    def test_flagging_analytics(self):
        io = gr.Interface(lambda x: x, "text", "text")
        app, _, _ = io.launch(show_error=True, prevent_thread_lock=True)
        client = app.test_client()
        with mock.patch('requests.post') as mock_post:
            with mock.patch('gradio.networking.flag_data') as mock_flag:
                response = client.post('/api/flag/', json={"data": {"input_data": ["test"], "output_data": ["test"]}})
                mock_post.assert_called_once()
                mock_flag.assert_called_once()
        self.assertEqual(response.status_code, 200)
        io.close()

class TestInterpretation(unittest.TestCase):
    def test_interpretation(self):
        io = gr.Interface(lambda x: len(x), "text", "label", interpretation="default")
        app, _, _ = io.launch(prevent_thread_lock=True)
        client = app.test_client()
        io.interpret = mock.MagicMock(return_value=(None, None))
        with mock.patch('requests.post') as mock_post:
            response = client.post('/api/interpret/', json={"data": ["test test"]})
            mock_post.assert_called_once()
        self.assertEqual(response.status_code, 200)
        io.close()

class TestState(unittest.TestCase):
    def test_state_initialization(self):
        io = gr.Interface(lambda x: len(x), "text", "label")
        app, _, _ = io.launch(prevent_thread_lock=True)
        with app.test_request_context():
            self.assertIsNone(networking.get_state())

    def test_state_value(self):
        io = gr.Interface(lambda x: len(x), "text", "label")
        io.launch(prevent_thread_lock=True)
        app, _, _ = io.launch(prevent_thread_lock=True)
        with app.test_request_context():
            networking.set_state("test")
            client = app.test_client()
            client.post('/api/predict/', json={"data": [0]})
            self.assertEquals(networking.get_state(), "test")

class TestURLs(unittest.TestCase):
    def test_url_ok(self):
        urllib.request.urlopen = mock.MagicMock(return_value="test")
        res = networking.url_request("http://www.gradio.app")
        self.assertEquals(res, "test")

    def test_setup_tunnel(self):
        networking.create_tunnel = mock.MagicMock(return_value="test")
        res = networking.setup_tunnel(None, None)
        self.assertEquals(res, "test")

    def test_url_ok(self):
        res = networking.url_ok("https://www.gradio.app")
        self.assertTrue(res)


if __name__ == '__main__':
    unittest.main()
