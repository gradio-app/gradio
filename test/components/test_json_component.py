import json

import numpy as np
import pytest

from gradio.components.json_component import JSON


class TestJSON:
    @pytest.mark.parametrize(
        "value, expected",
        [
            (None, None),
            (True, True),
            ([1, 2, 3], [1, 2, 3]),
            ([np.array([1, 2, 3])], [[1, 2, 3]]),
            ({"foo": [1, 2, 3]}, {"foo": [1, 2, 3]}),
            ({"foo": np.array([1, 2, 3])}, {"foo": [1, 2, 3]}),
        ],
    )
    def test_postprocess_returns_json_serializable_value(self, value, expected):
        json_component = JSON()
        postprocessed_value = json_component.postprocess(value)
        assert postprocessed_value == expected
        assert json.loads(json.dumps(postprocessed_value)) == expected
