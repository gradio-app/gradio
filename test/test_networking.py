import unittest
from gradio import networking
import socket
import tempfile
import os
LOCALHOST_NAME = 'localhost'


class TestGetAvailablePort(unittest.TestCase):
    def test_get_first_available_port_by_blocking_port(self):
        initial = 7000
        final = 8000
        port_found = False
        for port in range(initial, final):
            try:
                s = socket.socket()  # create a socket object
                s.bind((LOCALHOST_NAME, port))  # Bind to the port
                s.close()
                port_found = True
                break
            except OSError:
                pass
        if port_found:
            s = socket.socket()  # create a socket object
            s.bind((LOCALHOST_NAME, port))  # Bind to the port
            new_port = networking.get_first_available_port(initial, final)
            s.close()
        self.assertFalse(port==new_port)


# class TestCopyFiles(unittest.TestCase):
    # def test_copy_files(self):
    #     filename = "a.txt"
    #     with tempfile.TemporaryDirectory() as temp_src:
    #         with open(os.path.join(temp_src, "a.txt"), "w+") as f:
    #             f.write('Hi')
    #         with tempfile.TemporaryDirectory() as temp_dest:
    #             self.assertFalse(os.path.exists(os.path.join(temp_dest, filename)))
    #             networking.copy_files(temp_src, temp_dest)
    #             self.assertTrue(os.path.exists(os.path.join(temp_dest, filename)))


if __name__ == '__main__':
    unittest.main()
