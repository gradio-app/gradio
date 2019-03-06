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
        self.assertDictEqual(label, {outputs.Label.LABEL_KEY: string})

    def test_postprocessing_1D_array(self):
        array = np.array([0.1, 0.2, 0, 0.7, 0])
        true_label = {outputs.Label.LABEL_KEY: 3,
                      outputs.Label.CONFIDENCES_KEY: [
                          {outputs.Label.LABEL_KEY: 3, outputs.Label.CONFIDENCE_KEY: 0.7},
                          {outputs.Label.LABEL_KEY: 1, outputs.Label.CONFIDENCE_KEY: 0.2},
                          {outputs.Label.LABEL_KEY: 0, outputs.Label.CONFIDENCE_KEY: 0.1},
                      ]}
        out = outputs.Label()
        label = out.postprocess(array)
        self.assertDictEqual(label, true_label)

    def test_postprocessing_1D_array_no_confidences(self):
        array = np.array([0.1, 0.2, 0, 0.7, 0])
        true_label = {outputs.Label.LABEL_KEY: 3}
        out = outputs.Label(show_confidences=False)
        label = out.postprocess(array)
        self.assertDictEqual(label, true_label)

    def test_postprocessing_int(self):
        true_label_array = np.array([[[3]]])
        true_label = {outputs.Label.LABEL_KEY: 3}
        out = outputs.Label()
        label = out.postprocess(true_label_array)
        self.assertDictEqual(label, true_label)


class TestTextbox(unittest.TestCase):
    def test_path_exists(self):
        out = outputs.Textbox()
        path = out.get_template_path()
        # self.assertTrue(os.path.exists(os.path.join(PACKAGE_NAME, path)))

    def test_postprocessing(self):
        string = 'happy'
        out = outputs.Textbox()
        string = out.postprocess(string)
        self.assertEqual(string, string)


if __name__ == '__main__':
    unittest.main()
