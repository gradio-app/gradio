import numpy as np
import unittest
import os
from gradio import outputs

PACKAGE_NAME = 'gradio'


class TestLabel(unittest.TestCase):
    def test_path_exists(self):
        out = outputs.Label()
        path = out.get_template_path()
        self.assertTrue(os.path.exists(os.path.join(PACKAGE_NAME, path)))

    def test_postprocessing_string(self):
        string = 'happy'
        out = outputs.Label()
        label = out.postprocess(string)
        self.assertEqual(label, string)

    def test_postprocessing_one_hot(self):
        one_hot = np.array([0, 0, 0, 1, 0])
        true_label = 3
        out = outputs.Label()
        label = out.postprocess(one_hot)
        self.assertEqual(label, true_label)

    def test_postprocessing_int(self):
        true_label_array = np.array([[[3]]])
        true_label = 3
        out = outputs.Label()
        label = out.postprocess(true_label_array)
        self.assertEqual(label, true_label)


class TestTextbox(unittest.TestCase):
    def test_path_exists(self):
        out = outputs.Textbox()
        path = out.get_template_path()
        self.assertTrue(os.path.exists(os.path.join(PACKAGE_NAME, path)))

    def test_postprocessing(self):
        string = 'happy'
        out = outputs.Textbox()
        string = out.postprocess(string)
        self.assertEqual(string, string)


if __name__ == '__main__':
    unittest.main()
