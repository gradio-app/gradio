from gradio import networking
import gradio as gr
import unittest
import unittest.mock as mock
import ipaddress
import requests
import warnings


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
        self.io =gr.Interface(lambda x: x, "text", "text") 
        self.app, _, _ = self.io.launch(prevent_thread_lock=True)
        self.client = self.app.test_client()

    def test_get_routes(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def tearDown(self) -> None:
        self.io.close()

if __name__ == '__main__':
    unittest.main()
