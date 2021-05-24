import unittest
import gradio.interpretation
import gradio.test_data
from gradio.processing_utils import decode_base64_to_image, encode_array_to_base64
from gradio import Interface
import numpy as np


class TestDefault(unittest.TestCase):
    def test_default_text(self):
        max_word_len = lambda text: max([len(word) for word in text.split(" ")])
        text_interface = Interface(max_word_len, "textbox", "label", interpretation="default")
        interpretation = text_interface.interpret(["quickest brown fox"])[0][0]
        self.assertGreater(interpretation[0][1], 0)  # Checks to see if the first word has >0 score.
        self.assertEqual(interpretation[-1][1], 0)  # Checks to see if the last word has 0 score.

    ## Commented out since skimage is no longer a required dependency, this will fail in CircleCI TODO(abidlabs): have backup default segmentation
    # def test_default_image(self):
    #     max_pixel_value = lambda img: img.max()
    #     img_interface = Interface(max_pixel_value, "image", "number", interpretation="default")
    #     array = np.zeros((100,100))
    #     array[0, 0] = 1
    #     img = encode_array_to_base64(array)        
    #     interpretation = img_interface.interpret([img])[0][0]
    #     self.assertGreater(interpretation[0][0], 0)  # Checks to see if the top-left has >0 score.
        

class TestCustom(unittest.TestCase):
    def test_custom_text(self):
        max_word_len = lambda text: max([len(word) for word in text.split(" ")])
        custom = lambda text: [(char, 1) for char in text]
        text_interface = Interface(max_word_len, "textbox", "label", interpretation=custom)
        result = text_interface.interpret(["quickest brown fox"])[0][0]
        self.assertEqual(result[0][1], 1)  # Checks to see if the first letter has score of 1.

    def test_custom_img(self):
        max_pixel_value = lambda img: img.max()
        custom = lambda img: img.tolist()
        img_interface = Interface(max_pixel_value, "image", "label", interpretation=custom)
        result = img_interface.interpret([gradio.test_data.BASE64_IMAGE])[0][0]
        expected_result = np.asarray(decode_base64_to_image(gradio.test_data.BASE64_IMAGE).convert('RGB')).tolist()
        self.assertEqual(result, expected_result)
        

if __name__ == '__main__':
    unittest.main()