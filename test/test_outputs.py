import json
import os
import tempfile
import unittest

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

import gradio as gr
from gradio.test_data import media_data

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


# TODO: Delete this file after confirming backwards compatibility works well.


class TestTextbox(unittest.TestCase):
    def test_in_interface(self):
        iface = gr.Interface(lambda x: x[-1], "textbox", gr.outputs.Textbox())
        self.assertEqual(iface.process(["Hello"])[0], ["o"])
        iface = gr.Interface(lambda x: x / 2, "number", gr.outputs.Textbox())
        self.assertEqual(iface.process([10])[0], ["5.0"])


class TestLabel(unittest.TestCase):
    def test_as_component(self):
        y = "happy"
        label_output = gr.outputs.Label()
        label = label_output.postprocess(y)
        self.assertDictEqual(label, {"label": "happy"})
        self.assertEqual(label_output.deserialize(y), y)
        self.assertEqual(label_output.deserialize(label), y)
        with tempfile.TemporaryDirectory() as tmpdir:
            to_save = label_output.save_flagged(tmpdir, "label_output", label, None)
            self.assertEqual(to_save, y)
            y = {3: 0.7, 1: 0.2, 0: 0.1}
        label_output = gr.outputs.Label()
        label = label_output.postprocess(y)
        self.assertDictEqual(
            label,
            {
                "label": 3,
                "confidences": [
                    {"label": 3, "confidence": 0.7},
                    {"label": 1, "confidence": 0.2},
                    {"label": 0, "confidence": 0.1},
                ],
            },
        )
        label_output = gr.outputs.Label(num_top_classes=2)
        label = label_output.postprocess(y)
        self.assertDictEqual(
            label,
            {
                "label": 3,
                "confidences": [
                    {"label": 3, "confidence": 0.7},
                    {"label": 1, "confidence": 0.2},
                ],
            },
        )
        with self.assertRaises(ValueError):
            label_output.postprocess([1, 2, 3])

        with tempfile.TemporaryDirectory() as tmpdir:
            to_save = label_output.save_flagged(tmpdir, "label_output", label, None)
            self.assertEqual(to_save, '{"3": 0.7, "1": 0.2}')
            self.assertEqual(
                label_output.restore_flagged(tmpdir, to_save, None),
                {
                    "label": "3",
                    "confidences": [
                        {"label": "3", "confidence": 0.7},
                        {"label": "1", "confidence": 0.2},
                    ],
                },
            )

    def test_in_interface(self):
        x_img = media_data.BASE64_IMAGE

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
        self.assertDictEqual(
            output,
            {
                "label": "red",
                "confidences": [
                    {"label": "red", "confidence": 0.44},
                    {"label": "green", "confidence": 0.28},
                    {"label": "blue", "confidence": 0.28},
                ],
            },
        )


class TestImage(unittest.TestCase):
    def test_as_component(self):
        y_img = gr.processing_utils.decode_base64_to_image(media_data.BASE64_IMAGE)
        image_output = gr.outputs.Image()
        self.assertTrue(
            image_output.postprocess(y_img).startswith(
                "data:image/png;base64,iVBORw0KGgoAAA"
            )
        )
        self.assertTrue(
            image_output.postprocess(np.array(y_img)).startswith(
                "data:image/png;base64,iVBORw0KGgoAAA"
            )
        )
        with self.assertWarns(DeprecationWarning):
            plot_output = gr.outputs.Image(plot=True)

        xpoints = np.array([0, 6])
        ypoints = np.array([0, 250])
        fig = plt.figure()
        plt.plot(xpoints, ypoints)
        self.assertTrue(
            plot_output.postprocess(fig).startswith("data:image/png;base64,")
        )
        with self.assertRaises(ValueError):
            image_output.postprocess([1, 2, 3])
        image_output = gr.outputs.Image(type="numpy")
        self.assertTrue(
            image_output.postprocess(y_img).startswith("data:image/png;base64,")
        )
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = image_output.save_flagged(
                tmpdirname, "image_output", media_data.BASE64_IMAGE, None
            )
            self.assertEqual("image_output/0.png", to_save)
            to_save = image_output.save_flagged(
                tmpdirname, "image_output", media_data.BASE64_IMAGE, None
            )
            self.assertEqual("image_output/1.png", to_save)

    def test_in_interface(self):
        def generate_noise(width, height):
            return np.random.randint(0, 256, (width, height, 3))

        iface = gr.Interface(generate_noise, ["slider", "slider"], "image")
        self.assertTrue(
            iface.process([10, 20])[0][0].startswith("data:image/png;base64")
        )


class TestVideo(unittest.TestCase):
    def test_as_component(self):
        y_vid = "test/test_files/video_sample.mp4"
        video_output = gr.outputs.Video()
        self.assertTrue(
            video_output.postprocess(y_vid)["data"].startswith("data:video/mp4;base64,")
        )
        self.assertTrue(
            video_output.deserialize(media_data.BASE64_VIDEO["data"]).endswith(".mp4")
        )
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = video_output.save_flagged(
                tmpdirname, "video_output", media_data.BASE64_VIDEO, None
            )
            self.assertEqual("video_output/0.mp4", to_save)
            to_save = video_output.save_flagged(
                tmpdirname, "video_output", media_data.BASE64_VIDEO, None
            )
            self.assertEqual("video_output/1.mp4", to_save)


class TestHighlightedText(unittest.TestCase):
    def test_as_component(self):
        ht_output = gr.outputs.HighlightedText(color_map={"pos": "green", "neg": "red"})
        self.assertEqual(
            ht_output.get_template_context(),
            {
                "color_map": {"pos": "green", "neg": "red"},
                "name": "highlightedtext",
                "label": None,
                "show_legend": False,
                "css": {},
                "default_value": "",
            },
        )
        ht = {"pos": "Hello ", "neg": "World"}
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = ht_output.save_flagged(tmpdirname, "ht_output", ht, None)
            self.assertEqual(to_save, '{"pos": "Hello ", "neg": "World"}')
            self.assertEqual(
                ht_output.restore_flagged(tmpdirname, to_save, None),
                {"pos": "Hello ", "neg": "World"},
            )

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
        self.assertListEqual(
            iface.process(["Helloooo"])[0][0],
            [("H", "non"), ("e", "vowel"), ("ll", "non"), ("oooo", "vowel")],
        )


class TestAudio(unittest.TestCase):
    def test_as_component(self):
        y_audio = gr.processing_utils.decode_base64_to_file(
            media_data.BASE64_AUDIO["data"]
        )
        audio_output = gr.outputs.Audio(type="file")
        self.assertTrue(
            audio_output.postprocess(y_audio.name).startswith(
                "data:audio/wav;base64,UklGRuI/AABXQVZFZm10IBAAA"
            )
        )
        self.assertEqual(
            audio_output.get_template_context(),
            {
                "name": "audio",
                "label": None,
                "source": "upload",
                "css": {},
                "default_value": None,
            },
        )
        self.assertTrue(
            audio_output.deserialize(media_data.BASE64_AUDIO["data"]).endswith(".wav")
        )
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = audio_output.save_flagged(
                tmpdirname, "audio_output", media_data.BASE64_AUDIO, None
            )
            self.assertEqual("audio_output/0.wav", to_save)
            to_save = audio_output.save_flagged(
                tmpdirname, "audio_output", media_data.BASE64_AUDIO, None
            )
            self.assertEqual("audio_output/1.wav", to_save)

    def test_in_interface(self):
        def generate_noise(duration):
            return 48000, np.random.randint(-256, 256, (duration, 3)).astype(np.int32)

        iface = gr.Interface(generate_noise, "slider", "audio")
        self.assertTrue(iface.process([100])[0][0].startswith("data:audio/wav;base64"))


class TestJSON(unittest.TestCase):
    def test_as_component(self):
        js_output = gr.outputs.JSON()
        self.assertTrue(
            js_output.postprocess('{"a":1, "b": 2}'), '"{\\"a\\":1, \\"b\\": 2}"'
        )
        js = {"pos": "Hello ", "neg": "World"}
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = js_output.save_flagged(tmpdirname, "js_output", js, None)
            self.assertEqual(to_save, '{"pos": "Hello ", "neg": "World"}')
            self.assertEqual(
                js_output.restore_flagged(tmpdirname, to_save, None),
                {"pos": "Hello ", "neg": "World"},
            )

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
            "json",
        )
        y_data = [
            ["M", 30],
            ["F", 20],
            ["M", 40],
            ["O", 20],
            ["F", 30],
        ]
        self.assertDictEqual(iface.process([y_data])[0][0], {"M": 35, "F": 25, "O": 20})


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
        self.assertDictEqual(
            iface.process(["hello world"])[0][0],
            {
                "name": "test.txt",
                "size": 11,
                "data": "data:text/plain;base64,aGVsbG8gd29ybGQ=",
            },
        )
        file_output = gr.outputs.File()
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = file_output.save_flagged(
                tmpdirname, "file_output", [media_data.BASE64_FILE], None
            )
            self.assertEqual("file_output/0", to_save)
            to_save = file_output.save_flagged(
                tmpdirname, "file_output", [media_data.BASE64_FILE], None
            )
            self.assertEqual("file_output/1", to_save)


class TestDataframe(unittest.TestCase):
    def test_as_component(self):
        dataframe_output = gr.outputs.Dataframe()
        output = dataframe_output.postprocess(np.zeros((2, 2)))
        self.assertDictEqual(output, {"data": [[0, 0], [0, 0]]})
        output = dataframe_output.postprocess([[1, 3, 5]])
        self.assertDictEqual(output, {"data": [[1, 3, 5]]})
        output = dataframe_output.postprocess(
            pd.DataFrame([[2, True], [3, True], [4, False]], columns=["num", "prime"])
        )
        self.assertDictEqual(
            output,
            {"headers": ["num", "prime"], "data": [[2, True], [3, True], [4, False]]},
        )
        self.assertEqual(
            dataframe_output.get_template_context(),
            {
                "headers": None,
                "max_rows": 20,
                "max_cols": None,
                "overflow_row_behaviour": "paginate",
                "name": "dataframe",
                "label": None,
                "css": {},
                "datatype": "str",
                "row_count": 3,
                "col_count": 3,
                "col_width": None,
                "default_value": [
                    ["", "", ""],
                    ["", "", ""],
                    ["", "", ""],
                ],
                "name": "dataframe",
                "interactive": False,
            },
        )
        with self.assertRaises(ValueError):
            wrong_type = gr.outputs.Dataframe(type="unknown")
            wrong_type.postprocess(0)
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = dataframe_output.save_flagged(
                tmpdirname, "dataframe_output", output, None
            )
            self.assertEqual(
                to_save,
                json.dumps(
                    {
                        "headers": ["num", "prime"],
                        "data": [[2, True], [3, True], [4, False]],
                    }
                ),
            )
            self.assertEqual(
                dataframe_output.restore_flagged(tmpdirname, to_save, None),
                {
                    "headers": ["num", "prime"],
                    "data": [[2, True], [3, True], [4, False]],
                },
            )

    def test_in_interface(self):
        def check_odd(array):
            return array % 2 == 0

        iface = gr.Interface(check_odd, "numpy", "numpy")
        self.assertEqual(
            iface.process([[2, 3, 4]])[0][0], {"data": [[True, False, True]]}
        )


class TestCarousel(unittest.TestCase):
    def test_as_component(self):
        carousel_output = gr.outputs.Carousel(["text", "image"], label="Disease")

        output = carousel_output.postprocess(
            [
                ["Hello World", "test/test_files/bus.png"],
                ["Bye World", "test/test_files/bus.png"],
            ]
        )
        self.assertEqual(
            output,
            [
                ["Hello World", media_data.BASE64_IMAGE],
                ["Bye World", media_data.BASE64_IMAGE],
            ],
        )

        carousel_output = gr.outputs.Carousel("text", label="Disease")
        output = carousel_output.postprocess([["Hello World"], ["Bye World"]])
        self.assertEqual(output, [["Hello World"], ["Bye World"]])
        self.assertEqual(
            carousel_output.get_template_context(),
            {
                "components": [
                    {
                        "name": "textbox",
                        "label": None,
                        "default_value": "",
                        "lines": 1,
                        "css": {},
                        "placeholder": None,
                    }
                ],
                "name": "carousel",
                "label": "Disease",
                "css": {},
            },
        )
        output = carousel_output.postprocess(["Hello World", "Bye World"])
        self.assertEqual(output, [["Hello World"], ["Bye World"]])
        with self.assertRaises(ValueError):
            carousel_output.postprocess("Hello World!")
        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = carousel_output.save_flagged(
                tmpdirname, "carousel_output", output, None
            )
            self.assertEqual(to_save, '[["Hello World"], ["Bye World"]]')

    def test_in_interface(self):
        carousel_output = gr.outputs.Carousel(["text", "image"], label="Disease")

        def report(img):
            results = []
            for i, mode in enumerate(["Red", "Green", "Blue"]):
                color_filter = np.array([0, 0, 0])
                color_filter[i] = 1
                results.append([mode, img * color_filter])
            return results

        iface = gr.Interface(report, gr.inputs.Image(type="numpy"), carousel_output)
        self.assertEqual(
            iface.process([media_data.BASE64_IMAGE])[0],
            [
                [
                    [
                        "Red",
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAABECAIAAAC9Laq3AAAFFElEQVR4nO3aT2gcVRzA8U+MTZq6xZBKdYvFFYyCtFq0UO3FehEUe1E8+AeaUw+C2pPiyS14UQ9tvXlroZ5EqVgrKmq8aAQjVXvQNuIWYxtLIlsSog0tehgnndmdmZ3ZXdMU8j2Et+/NvPfN2/f7vTeT9PzjquSaKy3QJiveS8uK99Ky4r20rHgvLSveS8uK99JylXlf5CKuLu8pvmUOXHuFXfJRZyI0Dlju3nNMUG+qX77ef1NjKqV1OXpfZJLJMAQTWXbeU0xkGgcso3xSZ4yfkqTnOcaLkZplMd9pwRdwjFH+ildeYe/s4MMkHyXVx9bJKLUuSmVykRpjKdKnOMw8p1Juvzzfx3kQ7KJKpauWDUxSSwm+Gd7lR7CtaXkscnm+62HhELcy8v/M/TRj6RljntdC6WxS80nX7esc5wR/J7V+wTy/p09wAy3i8hBH2MMeBvM7xskOvjE+4k9uLtJn6/x9nr1UqKanqjSygw8HeJs/C3Yr/77Thv0kYynLbCb8OZFzeDAQKRfbL3PaT6UH3zyHqTJWcJqHeCbysZ19vqX9TynBN0aVb5BbepgBHmMvd0Xq2z+ftLFy3sudLgKGGOb1cGOJctl7C9cX6TSgpf0pDvADCkrvYF1662XvQfa3pS5ifyRSOcMB3mSCySK93cbzPJ55TWydjFDjlQ7s90Q+Hi6YLjDMS7zAcKsrG9f3INUO7E9HyoWkh0LXnLtPo3eNWsf2hRjgYV4qeFej9yd8whnE7bvOAMOh8SOsKXh7o3cZnI3UDFLlV3a1L5lAkIwfyUwaGTR63085qa8KB7tkP8TzuXVLbOKmpvpG7xvYmf7QUOnMfjNPszdHuggo8T5P8FbTabSd/bJS3H4I7Oa+IgMd5VVG2d90okz2rjHdqtNKbvttBXUXORApfxYWgieGZO+v+DJf15V0+yFuoxo/x+Xnc+rsYh8oMchWSqAn8f8hxhnnoYJPxzXqbGG0LdEGXuH78MzTQzWejpPnexMlvuJCjgEO8gGosKV9z0am4r0txFuTvfvZzhxf5xhggbP83K5fIr2cDMvHwSp+DB+UZOSTCrdzkvFWY2xC03x0SC+oMUoVbGWBGr8h+jz/Pfvib3x2MMM4F9iePsZ2Ku1ue4nG/fSGsxY8MdxDmT4qrEV0vu9OemfyKGVO8DGzScNcYJoN9HdsfA1rWBNO9r2RpmepsDmUjnkvhEf1QzxHjQv0s5NNnOZdxuP2ZzjKe62EekKVjAtWc138st2UGeQtRpq+z//y4BnOMstRSuwMm9dRpp8zjIfnrRJrmWWOPu7njnino5HyKj5ljsdTslMfffQkNa1jY8rv/J/3Jf7gHJdS7g/spznNNAv0sYHbk1bIoncPb/AheJLd8ctW0Z9ivJYKfUlNMW9F7Fuy6D3Gy2G5xLGw515Wp+SyATZG1nEasfeDvWzgxhT7GWaK2OMd8ADHOU8v/7A65asPvsCceSnhdw7sN1NOGmCGE2HUZvMX37GLUUbAqqbgWxyxzJ1Fkmnq+9iWc19nPevTu/gFofEgUhZGRvBl0OI9cob9Jc5yLt0++jxfD89xUVoGXwa5/i7Vnv1saFznIFvjxuUcwdepd0B++2Cv3ghGGOQ8D6Bg8GWQfP5uSXbGDDjJU2G5zDHWs6Gt4Zpp0zugpf1uvqPEEXYUD74MOvIOyLCf5RzbuKXjURrogndAs33nwZdB17wDLvEbs10Kvgy67L1k/Asi+GhgiYdDNAAAAABJRU5ErkJggg==",
                    ],
                    [
                        "Green",
                        "data:image/png;base64,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",
                    ],
                    [
                        "Blue",
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAABECAIAAAC9Laq3AAAFGklEQVR4nNXaMWwbVRzH8U8RUjMU1RIDaZeeGKADKJbaIWJozRYJWrKB6NBUKoIxS8VWUlaQCFurIpEOgMoCIgUhpIqwkA61SBUGmslZAkhUSlVEG5YyHOee7bvnu/MlgZ+s5Pm987uvn/+//7t79/bw0P9Qj23/KZa5wp16O92zneO9xkKK+AVe5slaut4m7jUWWctqqoe+du47XOPHYYeNSl8j932us1jmI9Xp6+K+zjX+qvTZKvSjc9/iah3pohz9KNwB81VWUfpq3AXNV1nD6ctyVzBfZYXoS3Ff43pV81VWNn1B7mUWa5+ry6iffij3dpivsh7RB7jv8DkrO4hVRFuc5+nHs9rus8j1nUYartu0OZPJvSvmG6oNltMGS3Pvuvky9QfL/NpXG3Ovs8DGjjOFdY92XkqIuTvM8QxHeGLnwHK1xc+s8nfeEek4WWPtP0B/m+UAcaxBX+4i/QZL/JnVtI9TnOJY/D4zD9px+mzzJXqTU30YedyxdoA+ZD7wDG8N1vZxH6fDem/lNtHH5mvntB7hJO9xNLM5zT3BElhgbpvpV2nnmO8A53gRfJV3rvS6TyMpzNDhYw4NHL/GZyxxrypxh0/zM8Y+ribQIQXWq2bqpt9gke9yMsbr7OPZgj9m2JeYYZp55rnb2xRHzhGeY2+wk7D5TvAWB7ldhDjWUG40mGM2h77NKs/n0IfNh8t5zgur+Lpmgzk6vMP+3qa/afMZbbZS9atJ5aAOJH9LQT8Ky7LrsY1i9LfzzbePC3zDCQ6WOfUG5ytzx2oMo/8hx3wn+IaTKAx9k3u8x0tJmma09e9GPn2ezpXM/Ru0OcanfQ1p7hU2y3QaqzGM/giXaaEk9Cf5Vyw93HeZrYQuRf9KqvIAl/mIozxbprebnOX9wBF9cXKFiLkR6OdTb98tn+PavMobwdRJVnzf5cII9FGqXAp6I2EttFaT58sR6UvpHhd5tdRnwvkkTV+74sk/Jr6UkzdzVSQPdukXquDl6ntwKZA0Aiqev9c5UxP9BmcL4zb5kpm+2rLzzoj033Oel4ami0RNWszTSGaAR3qYnj/L6BAf83Dg1dVPqdeJSqeYTpVnk8ISD0eZ54uP/VeVHlE0ewe0kxQa8b/K451Weuy7+prLySVrBR0Gp/kAzNFipXuWWrhjHWKipq4wzv7UWMylo7HI/U5xrQ+sAlTWGGimajbTzTuwj6OaxvktKa+ADvPd5x8x93EWei8tdl0R6LCUzNYRm3zJt3qf79zq/V12SxFTPMWl1JBHnKbBdPyV+tardlfjTKWWa6IU9xTT6WFNc2/SSnJLk4ilmi4GGzRSCTjzgNbAwLX4BczxZuLUf9WNkyWW2GKFsVQXt0ambxLxAHFo9mqMSSZzVo6aTPUR93E/4AY3khP0qTJ9g/Fk2CZZ6e0/xsokjphOLVn2q++5a+30hxNojDGeREuMlXkfHUd5FO4383lxXfRd0OOscDcJ2amstVJJlDcL9Bx6zj06fUSH0ywwy4fM5oxxN8ozQjlTgXl+jBaTOfQTHA5+sa5mkERqJnQzz3wBDb0+CdDv5Xj+F9OLsplFFoXNF1CpfTOByNnKaoro8AUtIg6kbtqjpLKiKuyvKkI/Tiu5nNhPg3WmmShlvoAq72cLuzbW71xMyg3eZnLwNrGaRtw/OJT+Ch3GknWScuYLqJb9muHIafBaTsKurhr3xw7SRyOaL6Da9yM/4Fs6tZgvoG3dt76N+gfaDbBaHMV3YgAAAABJRU5ErkJggg==",
                    ],
                ]
            ],
        )


class TestTimeseries(unittest.TestCase):
    def test_as_component(self):
        timeseries_output = gr.outputs.Timeseries(label="Disease")
        self.assertEqual(
            timeseries_output.get_template_context(),
            {
                "x": None,
                "y": None,
                "name": "timeseries",
                "label": "Disease",
                "css": {},
                "default_value": None,
            },
        )
        data = {"Name": ["Tom", "nick", "krish", "jack"], "Age": [20, 21, 19, 18]}
        df = pd.DataFrame(data)
        self.assertEqual(
            timeseries_output.postprocess(df),
            {
                "headers": ["Name", "Age"],
                "data": [["Tom", 20], ["nick", 21], ["krish", 19], ["jack", 18]],
            },
        )

        timeseries_output = gr.outputs.Timeseries(y="Age", label="Disease")
        output = timeseries_output.postprocess(df)
        self.assertEqual(
            output,
            {
                "headers": ["Name", "Age"],
                "data": [["Tom", 20], ["nick", 21], ["krish", 19], ["jack", 18]],
            },
        )

        with tempfile.TemporaryDirectory() as tmpdirname:
            to_save = timeseries_output.save_flagged(
                tmpdirname, "timeseries_output", output, None
            )
            self.assertEqual(
                to_save,
                '{"headers": ["Name", "Age"], "data": [["Tom", 20], ["nick", 21], ["krish", 19], '
                '["jack", 18]]}',
            )
            self.assertEqual(
                timeseries_output.restore_flagged(tmpdirname, to_save, None),
                {
                    "headers": ["Name", "Age"],
                    "data": [["Tom", 20], ["nick", 21], ["krish", 19], ["jack", 18]],
                },
            )


if __name__ == "__main__":
    unittest.main()
