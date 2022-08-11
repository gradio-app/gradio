import os
from copy import deepcopy

import numpy as np
import pytest
import pytest_asyncio

import gradio.interpretation
from gradio import Interface, media_data
from gradio.processing_utils import decode_base64_to_image

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestDefault:
    @pytest.mark.asyncio
    async def test_default_text(self):
        max_word_len = lambda text: max([len(word) for word in text.split(" ")])
        text_interface = Interface(
            max_word_len, "textbox", "label", interpretation="default"
        )
        interpretation = (await text_interface.interpret(["quickest brown fox"]))[0][
            "interpretation"
        ]
        assert interpretation[0][1] > 0  # Checks to see if the first word has >0 score.
        assert 0 == interpretation[-1][1]  # Checks to see if the last word has 0 score.


class TestShapley:
    @pytest.mark.asyncio
    async def test_shapley_text(self):
        max_word_len = lambda text: max([len(word) for word in text.split(" ")])
        text_interface = Interface(
            max_word_len, "textbox", "label", interpretation="shapley"
        )
        interpretation = (await text_interface.interpret(["quickest brown fox"]))[0][
            "interpretation"
        ][0]
        assert interpretation[1] > 0  # Checks to see if the first word has >0 score.


class TestCustom:
    @pytest.mark.asyncio
    async def test_custom_text(self):
        max_word_len = lambda text: max([len(word) for word in text.split(" ")])
        custom = lambda text: [(char, 1) for char in text]
        text_interface = Interface(
            max_word_len, "textbox", "label", interpretation=custom
        )
        result = (await text_interface.interpret(["quickest brown fox"]))[0][
            "interpretation"
        ][0]
        assert result[1] == 1  # Checks to see if the first letter has score of 1.

    @pytest.mark.asyncio
    async def test_custom_img(self):
        max_pixel_value = lambda img: img.max()
        custom = lambda img: img.tolist()
        img_interface = Interface(
            max_pixel_value, "image", "label", interpretation=custom
        )
        result = (await img_interface.interpret([deepcopy(media_data.BASE64_IMAGE)]))[
            0
        ]["interpretation"]
        expected_result = np.asarray(
            decode_base64_to_image(deepcopy(media_data.BASE64_IMAGE)).convert("RGB")
        ).tolist()
        assert result == expected_result


class TestHelperMethods:
    def test_diff(self):
        diff = gradio.interpretation.diff(13, "2")
        assert diff == 11
        diff = gradio.interpretation.diff("cat", "dog")
        assert diff == 1
        diff = gradio.interpretation.diff("cat", "cat")
        assert diff == 0

    def test_quantify_difference_with_number(self):
        iface = Interface(lambda text: text, ["textbox"], ["number"])
        diff = gradio.interpretation.quantify_difference_in_label(iface, [4], [6])
        assert diff == -2

    def test_quantify_difference_with_label(self):
        iface = Interface(lambda text: len(text), ["textbox"], ["label"])
        diff = gradio.interpretation.quantify_difference_in_label(iface, ["3"], ["10"])
        assert -7 == diff
        diff = gradio.interpretation.quantify_difference_in_label(iface, ["0"], ["100"])
        assert -100 == diff

    def test_quantify_difference_with_confidences(self):
        iface = Interface(lambda text: len(text), ["textbox"], ["label"])
        output_1 = {"cat": 0.9, "dog": 0.1}
        output_2 = {"cat": 0.6, "dog": 0.4}
        output_3 = {"cat": 0.1, "dog": 0.6}
        diff = gradio.interpretation.quantify_difference_in_label(
            iface, [output_1], [output_2]
        )
        assert 0.3 == pytest.approx(diff)
        diff = gradio.interpretation.quantify_difference_in_label(
            iface, [output_1], [output_3]
        )
        assert 0.8 == pytest.approx(diff)

    def test_get_regression_value(self):
        iface = Interface(lambda text: text, ["textbox"], ["label"])
        output_1 = {"cat": 0.9, "dog": 0.1}
        output_2 = {"cat": float("nan"), "dog": 0.4}
        output_3 = {"cat": 0.1, "dog": 0.6}
        diff = gradio.interpretation.get_regression_or_classification_value(
            iface, [output_1], [output_2]
        )
        assert 0 == diff
        diff = gradio.interpretation.get_regression_or_classification_value(
            iface, [output_1], [output_3]
        )
        assert 0.1 == pytest.approx(diff)

    def test_get_classification_value(self):
        iface = Interface(lambda text: text, ["textbox"], ["label"])
        diff = gradio.interpretation.get_regression_or_classification_value(
            iface, ["cat"], ["test"]
        )
        assert 1 == diff
        diff = gradio.interpretation.get_regression_or_classification_value(
            iface, ["test"], ["test"]
        )
        assert 0 == diff
