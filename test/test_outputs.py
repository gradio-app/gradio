import unittest
import gradio as gr
import numpy as np
import pandas as pd
import tempfile


class TestTextbox(unittest.TestCase):
    def test_in_interface(self):
        iface = gr.Interface(lambda x: x[-1], "textbox", gr.outputs.Textbox())
        self.assertEqual(iface.process(["Hello"])[0], ["o"])
        iface = gr.Interface(lambda x: x / 2, "number", gr.outputs.Textbox(type="number"))
        self.assertEqual(iface.process([10])[0], [5])


class TestLabel(unittest.TestCase):
    def test_as_component(self):
        y = 'happy'
        label_output = gr.outputs.Label()
        label = label_output.postprocess(y)
        self.assertDictEqual(label, {"label": "happy"})

        y = {
            3: 0.7,
            1: 0.2,
            0: 0.1
        }
        label_output = gr.outputs.Label()
        label = label_output.postprocess(y)
        self.assertDictEqual(label, {
            "label": 3,
            "confidences": [
                {"label": 3, "confidence": 0.7},
                {"label": 1, "confidence": 0.2},
                {"label": 0, "confidence": 0.1},
            ]
        })

    def test_in_interface(self):
        x_img = gr.test_data.BASE64_IMAGE
        
        def rgb_distribution(img):
            rgb_dist = np.mean(img, axis=(0, 1))
            rgb_dist /= np.sum(rgb_dist)
            rgb_dist = np.round(rgb_dist, decimals=2)
            return {
                "red": rgb_dist[0],
                "green": rgb_dist[1],
                "blue": rgb_dist[2],
            }

        iface = gr.Interface(rgb_distribution, "image", "label")
        output = iface.process([x_img])[0][0]
        self.assertDictEqual(output, {
            'label': 'red', 
            'confidences': [
                {'label': 'red', 'confidence': 0.44},
                {'label': 'green', 'confidence': 0.28},
                {'label': 'blue', 'confidence': 0.28}
            ]
        })

class TestImage(unittest.TestCase):
    def test_as_component(self):
        y_img = gr.processing_utils.decode_base64_to_image(gr.test_data.BASE64_IMAGE)
        image_output = gr.outputs.Image()
        self.assertTrue(image_output.postprocess(y_img)[0].startswith("data:image/png;base64,iVBORw0KGgoAAA"))
        self.assertTrue(image_output.postprocess(np.array(y_img))[0].startswith("data:image/png;base64,iVBORw0KGgoAAA"))

    def test_in_interface(self):
        def generate_noise(width, height):
            return np.random.randint(0, 256, (width, height, 3))

        iface = gr.Interface(generate_noise, ["slider", "slider"], "image")
        self.assertTrue(iface.process([10, 20])[0][0][0].startswith("data:image/png;base64"))

class TestKeyValues(unittest.TestCase):
    def test_in_interface(self):
        def letter_distribution(word):
            dist = {}
            for letter in word:
                dist[letter] = dist.get(letter, 0) + 1
            return dist

        iface = gr.Interface(letter_distribution, "text", "key_values")
        self.assertListEqual(iface.process(["alpaca"])[0][0], [
            ("a", 3), ("l", 1), ("p", 1), ("c", 1)])

class TestHighlightedText(unittest.TestCase):
    def test_in_interface(self):
        def highlight_vowels(sentence):
            phrases, cur_phrase = [], ""
            vowels, mode = "aeiou", None
            for letter in sentence:
                letter_mode = "vowel" if letter in vowels else "non"
                if mode is None:
                    mode = letter_mode
                elif mode != letter_mode:
                    phrases.append((cur_phrase, mode))
                    cur_phrase = ""
                    mode = letter_mode
                cur_phrase += letter
            phrases.append((cur_phrase, mode))
            return phrases
                
        iface = gr.Interface(highlight_vowels, "text", "highlight")
        self.assertListEqual(iface.process(["Helloooo"])[0][0], [
            ("H", "non"), ("e", "vowel"), ("ll", "non"), ("oooo", "vowel")])


class TestAudio(unittest.TestCase):
    def test_as_component(self):
        y_audio = gr.processing_utils.decode_base64_to_file(gr.test_data.BASE64_AUDIO)
        audio_output = gr.outputs.Audio(type="file")
        self.assertTrue(audio_output.postprocess(y_audio.name).startswith("data:audio/wav;base64,UklGRuI/AABXQVZFZm10IBAAA"))

    def test_in_interface(self):
        def generate_noise(duration):
            return 8000, np.random.randint(-256, 256, (duration, 3))

        iface = gr.Interface(generate_noise, "slider", "audio")
        self.assertTrue(iface.process([100])[0][0].startswith("data:audio/wav;base64"))


class TestJSON(unittest.TestCase):
    def test_in_interface(self):
        def get_avg_age_per_gender(data):
            return {
                "M": int(data[data["gender"] == "M"].mean()),
                "F": int(data[data["gender"] == "F"].mean()),
                "O": int(data[data["gender"] == "O"].mean()),
            }

        iface = gr.Interface(
            get_avg_age_per_gender,
            gr.inputs.Dataframe(headers=["gender", "age"]),
            "json")
        y_data = [
            ["M", 30],
            ["F", 20],
            ["M", 40],
            ["O", 20],
            ["F", 30],
        ]
        self.assertDictEqual(iface.process([y_data])[0][0], {
            "M": 35, "F": 25, "O": 20
        })


class TestHTML(unittest.TestCase):
    def test_in_interface(self):
        def bold_text(text):
            return "<strong>" + text + "</strong>"

        iface = gr.Interface(bold_text, "text", "html")
        self.assertEqual(iface.process(["test"])[0][0], "<strong>test</strong>")


class TestFile(unittest.TestCase):
    def test_as_component(self):
        def write_file(content):
            with open("test.txt", "w") as f:
                f.write(content)
            return "test.txt"

        iface = gr.Interface(write_file, "text", "file")
        self.assertDictEqual(iface.process(["hello world"])[0][0], {
            'name': 'test.txt', 'size': 11, 'data': 'aGVsbG8gd29ybGQ='
        })


class TestDataframe(unittest.TestCase):
    def test_as_component(self):
        dataframe_output = gr.outputs.Dataframe()
        output = dataframe_output.postprocess(np.zeros((2,2)))
        self.assertDictEqual(output, {"data": [[0,0],[0,0]]})
        output = dataframe_output.postprocess([[1,3,5]])
        self.assertDictEqual(output, {"data": [[1, 3, 5]]})
        output = dataframe_output.postprocess(pd.DataFrame(
            [[2, True], [3, True], [4, False]], columns=["num", "prime"]))
        self.assertDictEqual(output, 
            {"headers": ["num", "prime"], "data": [[2, True], [3, True], [4, False]]})


    def test_in_interface(self):
        def check_odd(array):
            return array % 2 == 0
        iface = gr.Interface(check_odd, "numpy", "numpy")
        self.assertEqual(
            iface.process([[2, 3, 4]])[0][0], 
            {"data": [[True, False, True]]})


if __name__ == '__main__':
    unittest.main()
