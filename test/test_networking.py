import unittest
from gradio import networking
from gradio import inputs
from gradio import outputs
import socket
import tempfile
import os
import json


class TestGetAvailablePort(unittest.TestCase):
    def test_get_first_available_port_by_blocking_port(self):
        initial = 7000
        final = 8000
        port_found = False
        for port in range(initial, final):
            try:
                s = socket.socket()  # create a socket object
                s.bind((networking.LOCALHOST_NAME, port))  # Bind to the port
                s.close()
                port_found = True
                break
            except OSError:
                pass
        if port_found:
            s = socket.socket()  # create a socket object
            s.bind((networking.LOCALHOST_NAME, port))  # Bind to the port
            new_port = networking.get_first_available_port(initial, final)
            s.close()
        self.assertFalse(port==new_port)


# class TestSetSampleData(unittest.TestCase):
    # def test_set_sample_data(self):
    #     test_array = ["test1", "test2", "test3"]
    #     temp_dir = tempfile.mkdtemp()
    #     inp = inputs.Sketchpad()
    #     out = outputs.Label()
    #     networking.build_template(temp_dir, inp, out)
    #     networking.set_sample_data_in_config_file(temp_dir, test_array)
    #     # We need to come up with a better way so that the config file isn't invalid json unless
    #     # the following parameters are set... (TODO: abidlabs)
    #     networking.set_always_flagged_in_config_file(temp_dir, False)
    #     networking.set_disabled_in_config_file(temp_dir, False)
    #     config_file = os.path.join(temp_dir, 'static/config.json')
    #     with open(config_file) as json_file:
    #         data = json.load(json_file)
    #         self.assertTrue(test_array == data["sample_inputs"])

# class TestCopyFiles(unittest.TestCase):
#     def test_copy_files(self):
#         filename = "a.txt"
#         with tempfile.TemporaryDirectory() as temp_src:
#             with open(os.path.join(temp_src, "a.txt"), "w+") as f:
#                 f.write('Hi')
#             with tempfile.TemporaryDirectory() as temp_dest:
#                 self.assertFalse(os.path.exists(os.path.join(temp_dest, filename)))
#                 networking.copy_files(temp_src, temp_dest)
#                 self.assertTrue(os.path.exists(os.path.join(temp_dest, filename)))


if __name__ == '__main__':
    unittest.main()