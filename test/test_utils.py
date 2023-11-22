from __future__ import annotations

import json
import os
import sys
import unittest.mock as mock
import warnings
from pathlib import Path
from unittest.mock import MagicMock

import pytest
import requests
from typing_extensions import Literal

from gradio import EventData, Request
from gradio.utils import (
    abspath,
    append_unique_suffix,
    assert_configs_are_equivalent_besides_ids,
    check_function_inputs_match,
    colab_check,
    delete_none,
    format_ner_list,
    get_continuous_fn,
    get_extension_from_file_path_or_url,
    get_type_hints,
    ipython_check,
    is_in_or_equal,
    is_special_typed_parameter,
    kaggle_check,
    readme_to_html,
    sagemaker_check,
    sanitize_list_for_csv,
    sanitize_value_for_csv,
    tex2svg,
    validate_url,
)

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestUtils:
    @mock.patch("IPython.get_ipython")
    def test_colab_check_no_ipython(self, mock_get_ipython):
        mock_get_ipython.return_value = None
        assert colab_check() is False

    @mock.patch("IPython.get_ipython")
    def test_ipython_check_import_fail(self, mock_get_ipython):
        mock_get_ipython.side_effect = ImportError()
        assert ipython_check() is False

    @mock.patch("IPython.get_ipython")
    def test_ipython_check_no_ipython(self, mock_get_ipython):
        mock_get_ipython.return_value = None
        assert ipython_check() is False

    @mock.patch("requests.get")
    def test_readme_to_html_doesnt_crash_on_connection_error(self, mock_get):
        mock_get.side_effect = requests.ConnectionError()
        readme_to_html("placeholder")

    def test_readme_to_html_correct_parse(self):
        readme_to_html("https://github.com/gradio-app/gradio/blob/master/README.md")

    def test_sagemaker_check_false(self):
        assert not sagemaker_check()

    def test_sagemaker_check_false_if_boto3_not_installed(self):
        with mock.patch.dict(sys.modules, {"boto3": None}, clear=True):
            assert not sagemaker_check()

    @mock.patch("boto3.session.Session.client")
    def test_sagemaker_check_true(self, mock_client):
        mock_client().get_caller_identity = MagicMock(
            return_value={
                "Arn": "arn:aws:sts::67364438:assumed-role/SageMaker-Datascients/SageMaker"
            }
        )
        assert sagemaker_check()

    def test_kaggle_check_false(self):
        assert not kaggle_check()

    def test_kaggle_check_true_when_run_type_set(self):
        with mock.patch.dict(
            os.environ, {"KAGGLE_KERNEL_RUN_TYPE": "Interactive"}, clear=True
        ):
            assert kaggle_check()

    def test_kaggle_check_true_when_both_set(self):
        with mock.patch.dict(
            os.environ,
            {"KAGGLE_KERNEL_RUN_TYPE": "Interactive", "GFOOTBALL_DATA_DIR": "./"},
            clear=True,
        ):
            assert kaggle_check()

    def test_kaggle_check_false_when_neither_set(self):
        with mock.patch.dict(
            os.environ,
            {"KAGGLE_KERNEL_RUN_TYPE": "", "GFOOTBALL_DATA_DIR": ""},
            clear=True,
        ):
            assert not kaggle_check()


def test_assert_configs_are_equivalent():
    test_dir = Path(__file__).parent / "test_files"
    with open(test_dir / "xray_config.json") as fp:
        xray_config = json.load(fp)
    with open(test_dir / "xray_config_diff_ids.json") as fp:
        xray_config_diff_ids = json.load(fp)
    with open(test_dir / "xray_config_wrong.json") as fp:
        xray_config_wrong = json.load(fp)

    assert assert_configs_are_equivalent_besides_ids(xray_config, xray_config)
    assert assert_configs_are_equivalent_besides_ids(xray_config, xray_config_diff_ids)
    with pytest.raises(ValueError):
        assert_configs_are_equivalent_besides_ids(xray_config, xray_config_wrong)


class TestFormatNERList:
    def test_format_ner_list_standard(self):
        string = "Wolfgang lives in Berlin"
        groups = [
            {"entity_group": "PER", "start": 0, "end": 8},
            {"entity_group": "LOC", "start": 18, "end": 24},
        ]
        result = [
            ("", None),
            ("Wolfgang", "PER"),
            (" lives in ", None),
            ("Berlin", "LOC"),
            ("", None),
        ]
        assert format_ner_list(string, groups) == result

    def test_format_ner_list_empty(self):
        string = "I live in a city"
        groups = []
        result = [("I live in a city", None)]
        assert format_ner_list(string, groups) == result


class TestDeleteNone:
    """Credit: https://stackoverflow.com/questions/33797126/proper-way-to-remove-keys-in-dictionary-with-none-values-in-python"""

    def test_delete_none(self):
        input = {
            "a": 12,
            "b": 34,
            "c": None,
            "k": {
                "d": 34,
                "t": None,
                "m": [{"k": 23, "t": None}, [None, 1, 2, 3], {1, 2, None}],
                None: 123,
            },
        }
        truth = {
            "a": 12,
            "b": 34,
            "k": {
                "d": 34,
                "t": None,
                "m": [{"k": 23, "t": None}, [None, 1, 2, 3], {1, 2, None}],
                None: 123,
            },
        }
        assert delete_none(input) == truth


class TestSanitizeForCSV:
    def test_unsafe_value(self):
        assert sanitize_value_for_csv("=OPEN()") == "'=OPEN()"
        assert sanitize_value_for_csv("=1+2") == "'=1+2"
        assert sanitize_value_for_csv('=1+2";=1+2') == "'=1+2\";=1+2"

    def test_safe_value(self):
        assert sanitize_value_for_csv(4) == 4
        assert sanitize_value_for_csv(-44.44) == -44.44
        assert sanitize_value_for_csv("1+1=2") == "1+1=2"
        assert sanitize_value_for_csv("1aaa2") == "1aaa2"

    def test_list(self):
        assert sanitize_list_for_csv([4, "def=", "=gh+ij"]) == [4, "def=", "'=gh+ij"]
        assert sanitize_list_for_csv(
            [["=abc", "def", "gh,+ij"], ["abc", "=def", "+ghij"]]
        ) == [["'=abc", "def", "'gh,+ij"], ["abc", "'=def", "'+ghij"]]
        assert sanitize_list_for_csv([1, ["ab", "=de"]]) == [1, ["ab", "'=de"]]


class TestValidateURL:
    @pytest.mark.flaky
    def test_valid_urls(self):
        assert validate_url("https://www.gradio.app")
        assert validate_url("http://gradio.dev")
        assert validate_url(
            "https://upload.wikimedia.org/wikipedia/commons/b/b0/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3_crop.jpg"
        )

    def test_invalid_urls(self):
        assert not (validate_url("C:/Users/"))
        assert not (validate_url("C:\\Users\\"))
        assert not (validate_url("/home/user"))


class TestAppendUniqueSuffix:
    def test_no_suffix(self):
        name = "test"
        list_of_names = ["test_1", "test_2"]
        assert append_unique_suffix(name, list_of_names) == name

    def test_first_suffix(self):
        name = "test"
        list_of_names = ["test", "test_-1"]
        assert append_unique_suffix(name, list_of_names) == "test_1"

    def test_later_suffix(self):
        name = "test"
        list_of_names = ["test", "test_1", "test_2", "test_3"]
        assert append_unique_suffix(name, list_of_names) == "test_4"


class TestAbspath:
    def test_abspath_no_symlink(self):
        resolved_path = str(abspath("../gradio/gradio/test_data/lion.jpg"))
        assert ".." not in resolved_path

    @pytest.mark.skipif(
        sys.platform.startswith("win"),
        reason="Windows doesn't allow creation of sym links without administrative privileges",
    )
    def test_abspath_symlink_path(self):
        os.symlink("gradio/test_data", "gradio/test_link", True)
        resolved_path = str(abspath("../gradio/gradio/test_link/lion.jpg"))
        os.unlink("gradio/test_link")
        assert "test_link" in resolved_path

    @pytest.mark.skipif(
        sys.platform.startswith("win"),
        reason="Windows doesn't allow creation of sym links without administrative privileges",
    )
    def test_abspath_symlink_dir(self):
        os.symlink("gradio/test_data", "gradio/test_link", True)
        full_path = os.path.join(os.getcwd(), "gradio/test_link/lion.jpg")
        resolved_path = str(abspath(full_path))
        os.unlink("gradio/test_link")
        assert "test_link" in resolved_path
        assert full_path == resolved_path


class TestGetTypeHints:
    def test_get_type_hints(self):
        class F:
            def __call__(self, s: str):
                return s

        class C:
            def f(self, s: str):
                return s

        def f(s: str):
            return s

        class GenericObject:
            pass

        test_objs = [F(), C().f, f]

        for x in test_objs:
            hints = get_type_hints(x)
            assert len(hints) == 1
            assert hints["s"] == str

        assert len(get_type_hints(GenericObject())) == 0

    def test_is_special_typed_parameter(self):
        def func(a: list[str], b: Literal["a", "b"], c, d: Request):
            pass

        hints = get_type_hints(func)
        assert not is_special_typed_parameter("a", hints)
        assert not is_special_typed_parameter("b", hints)
        assert not is_special_typed_parameter("c", hints)
        assert is_special_typed_parameter("d", hints)

    def test_is_special_typed_parameter_with_pipe(self):
        def func(a: Request, b: str | int, c: list[str]):
            pass

        hints = get_type_hints(func)
        assert is_special_typed_parameter("a", hints)
        assert not is_special_typed_parameter("b", hints)
        assert not is_special_typed_parameter("c", hints)


class TestCheckFunctionInputsMatch:
    def test_check_function_inputs_match(self):
        class F:
            def __call__(self, s: str, evt: EventData):
                return s

        class C:
            def f(self, s: str, evt: EventData):
                return s

        def f(s: str, evt: EventData):
            return s

        test_objs = [F(), C().f, f]

        with warnings.catch_warnings():
            warnings.simplefilter("error")  # Ensure there're no warnings raised here.

            for x in test_objs:
                check_function_inputs_match(x, [None], False)


class TestGetContinuousFn:
    @pytest.mark.asyncio
    async def test_get_continuous_fn(self):
        def int_return(x):  # for origin condition
            return x + 1

        def int_yield(x):  # new condition
            for _i in range(2):
                yield x
                x += 1

        def list_yield(x):  # new condition
            for _i in range(2):
                yield x
                x += [1]

        agen_int_return = get_continuous_fn(fn=int_return, every=0.01)
        agen_int_yield = get_continuous_fn(fn=int_yield, every=0.01)
        agen_list_yield = get_continuous_fn(fn=list_yield, every=0.01)
        agener_int_return = agen_int_return(1)
        agener_int = agen_int_yield(1)  # Primitive
        agener_list = agen_list_yield([1])  # Reference
        assert await agener_int_return.__anext__() == 2
        assert await agener_int_return.__anext__() == 2
        assert await agener_int.__anext__() == 1
        assert await agener_int.__anext__() == 2
        assert await agener_int.__anext__() == 1
        assert [1] == await agener_list.__anext__()
        assert [1, 1] == await agener_list.__anext__()
        assert [1, 1, 1] == await agener_list.__anext__()

    @pytest.mark.asyncio
    async def test_get_continuous_fn_with_async_function(self):
        async def async_int_return(x):  # for origin condition
            return x + 1

        agen_int_return = get_continuous_fn(fn=async_int_return, every=0.01)
        agener_int_return = agen_int_return(1)
        assert await agener_int_return.__anext__() == 2
        assert await agener_int_return.__anext__() == 2

    @pytest.mark.asyncio
    async def test_get_continuous_fn_with_async_generator(self):
        async def async_int_yield(x):  # new condition
            for _i in range(2):
                yield x
                x += 1

        async def async_list_yield(x):  # new condition
            for _i in range(2):
                yield x
                x += [1]

        agen_int_yield = get_continuous_fn(fn=async_int_yield, every=0.01)
        agen_list_yield = get_continuous_fn(fn=async_list_yield, every=0.01)
        agener_int = agen_int_yield(1)  # Primitive
        agener_list = agen_list_yield([1])  # Reference
        assert await agener_int.__anext__() == 1
        assert await agener_int.__anext__() == 2
        assert await agener_int.__anext__() == 1
        assert [1] == await agener_list.__anext__()
        assert [1, 1] == await agener_list.__anext__()
        assert [1, 1, 1] == await agener_list.__anext__()


def test_tex2svg_preserves_matplotlib_backend():
    import matplotlib

    matplotlib.use("svg")
    tex2svg("1+1=2")
    assert matplotlib.get_backend() == "svg"
    with pytest.raises(
        Exception  # specifically a pyparsing.ParseException but not important here
    ):
        tex2svg("$$$1+1=2$$$")
    assert matplotlib.get_backend() == "svg"


def test_is_in_or_equal():
    assert is_in_or_equal("files/lion.jpg", "files/lion.jpg")
    assert is_in_or_equal("files/lion.jpg", "files")
    assert not is_in_or_equal("files", "files/lion.jpg")
    assert is_in_or_equal("/home/usr/notes.txt", "/home/usr/")
    assert not is_in_or_equal("/home/usr/subdirectory", "/home/usr/notes.txt")
    assert not is_in_or_equal("/home/usr/../../etc/notes.txt", "/home/usr/")


@pytest.mark.parametrize(
    "path_or_url, extension",
    [
        ("https://example.com/avatar/xxxx.mp4?se=2023-11-16T06:51:23Z&sp=r", "mp4"),
        ("/home/user/documents/example.pdf", "pdf"),
        ("C:\\Users\\user\\documents\\example.png", "png"),
        ("C:/Users/user/documents/example", ""),
    ],
)
def test_get_extension_from_file_path_or_url(path_or_url, extension):
    assert get_extension_from_file_path_or_url(path_or_url) == extension
