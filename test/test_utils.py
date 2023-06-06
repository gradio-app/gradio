from __future__ import annotations

import copy
import os
import sys
import unittest.mock as mock
import warnings
from unittest.mock import MagicMock

import pytest
import pytest_asyncio
import requests
from httpx import AsyncClient, Response
from pydantic import BaseModel
from typing_extensions import Literal

from gradio import EventData, Request
from gradio.test_data.blocks_configs import (
    XRAY_CONFIG,
    XRAY_CONFIG_DIFF_IDS,
    XRAY_CONFIG_WITH_MISTAKE,
)
from gradio.utils import (
    AsyncRequest,
    abspath,
    append_unique_suffix,
    assert_configs_are_equivalent_besides_ids,
    check_function_inputs_match,
    colab_check,
    delete_none,
    format_ner_list,
    get_continuous_fn,
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


class TestAssertConfigsEquivalent:
    def test_same_configs(self):
        assert assert_configs_are_equivalent_besides_ids(XRAY_CONFIG, XRAY_CONFIG)

    def test_equivalent_configs(self):
        assert assert_configs_are_equivalent_besides_ids(
            XRAY_CONFIG, XRAY_CONFIG_DIFF_IDS
        )

    def test_different_configs(self):
        with pytest.raises(AssertionError):
            assert_configs_are_equivalent_besides_ids(
                XRAY_CONFIG_WITH_MISTAKE, XRAY_CONFIG
            )

    def test_different_dependencies(self):
        config1 = {
            "version": "3.0.20\n",
            "mode": "blocks",
            "dev_mode": True,
            "components": [
                {
                    "id": 1,
                    "type": "textbox",
                    "props": {
                        "lines": 1,
                        "max_lines": 20,
                        "placeholder": "What is your name?",
                        "value": "",
                        "show_label": True,
                        "name": "textbox",
                        "visible": True,
                        "style": {},
                    },
                },
                {
                    "id": 2,
                    "type": "textbox",
                    "props": {
                        "lines": 1,
                        "max_lines": 20,
                        "value": "",
                        "show_label": True,
                        "name": "textbox",
                        "visible": True,
                        "style": {},
                    },
                },
                {
                    "id": 3,
                    "type": "image",
                    "props": {
                        "image_mode": "RGB",
                        "source": "upload",
                        "tool": "editor",
                        "streaming": False,
                        "show_label": True,
                        "name": "image",
                        "visible": True,
                        "style": {"height": 54, "width": 240},
                    },
                },
            ],
            "css": None,
            "enable_queue": False,
            "layout": {"id": 0, "children": [{"id": 1}, {"id": 2}, {"id": 3}]},
            "dependencies": [
                {
                    "targets": [1],
                    "trigger": "submit",
                    "inputs": [1],
                    "outputs": [2],
                    "backend_fn": True,
                    "js": None,
                    "queue": None,
                    "api_name": "greet",
                    "scroll_to_output": False,
                    "show_progress": True,
                    "documentation": [["(str): text"], ["(str | None): text"]],
                }
            ],
        }

        config2 = copy.deepcopy(config1)
        config2["dependencies"][0]["documentation"] = None
        with pytest.raises(AssertionError):
            assert_configs_are_equivalent_besides_ids(config1, config2)


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


@pytest_asyncio.fixture(scope="function", autouse=True)
async def client():
    """
    A fixture to mock the async client object.
    """
    async with AsyncClient() as mock_client:
        with mock.patch("gradio.utils.AsyncRequest.client", mock_client):
            yield


class TestRequest:
    @pytest.mark.asyncio
    async def test_get(self):
        client_response: AsyncRequest = await AsyncRequest(
            method=AsyncRequest.Method.GET,
            url="http://headers.jsontest.com/",
        )
        validated_data = client_response.get_validated_data()
        assert client_response.is_valid() is True
        assert validated_data["Host"] == "headers.jsontest.com"

    @pytest.mark.asyncio
    async def test_post(self):
        client_response: AsyncRequest = await AsyncRequest(
            method=AsyncRequest.Method.POST,
            url="https://reqres.in/api/users",
            json={"name": "morpheus", "job": "leader"},
        )
        validated_data = client_response.get_validated_data()
        assert client_response.status == 201
        assert validated_data["job"] == "leader"
        assert validated_data["name"] == "morpheus"

    @pytest.mark.asyncio
    async def test_validate_with_model(self):
        class TestModel(BaseModel):
            name: str
            job: str
            id: str
            createdAt: str  # noqa: N815

        client_response: AsyncRequest = await AsyncRequest(
            method=AsyncRequest.Method.POST,
            url="https://reqres.in/api/users",
            json={"name": "morpheus", "job": "leader"},
            validation_model=TestModel,
        )
        assert isinstance(client_response.get_validated_data(), TestModel)

    @pytest.mark.asyncio
    async def test_validate_and_fail_with_model(self):
        class TestModel(BaseModel):
            name: Literal["John"] = "John"
            job: str

        client_response: AsyncRequest = await AsyncRequest(
            method=AsyncRequest.Method.POST,
            url="https://reqres.in/api/users",
            json={"name": "morpheus", "job": "leader"},
            validation_model=TestModel,
        )
        with pytest.raises(Exception):
            client_response.is_valid(raise_exceptions=True)
        assert client_response.has_exception is True
        assert isinstance(client_response.exception, Exception)


def make_mock_response(return_value):
    return Response(201, json=return_value)


MOCK_REQUEST_URL = "https://very_real_url.com"


@pytest.mark.asyncio
async def test_get(respx_mock):
    respx_mock.get(MOCK_REQUEST_URL).mock(
        make_mock_response({"Host": "headers.jsontest.com"})
    )

    client_response: AsyncRequest = await AsyncRequest(
        method=AsyncRequest.Method.GET,
        url=MOCK_REQUEST_URL,
    )
    validated_data = client_response.get_validated_data()
    assert client_response.is_valid() is True
    assert validated_data["Host"] == "headers.jsontest.com"


@pytest.mark.asyncio
async def test_post(respx_mock):
    payload = {"name": "morpheus", "job": "leader"}
    respx_mock.post(MOCK_REQUEST_URL).mock(make_mock_response(payload))

    client_response: AsyncRequest = await AsyncRequest(
        method=AsyncRequest.Method.POST,
        url=MOCK_REQUEST_URL,
        json=payload,
    )
    validated_data = client_response.get_validated_data()
    assert client_response.status == 201
    assert validated_data["job"] == "leader"
    assert validated_data["name"] == "morpheus"


@pytest.mark.asyncio
async def test_validate_with_model(respx_mock):
    response = make_mock_response(
        {
            "name": "morpheus",
            "id": "1",
            "job": "leader",
            "createdAt": "2",
        }
    )
    respx_mock.post(MOCK_REQUEST_URL).mock(response)

    class TestModel(BaseModel):
        name: str
        job: str
        id: str
        createdAt: str  # noqa: N815

    client_response: AsyncRequest = await AsyncRequest(
        method=AsyncRequest.Method.POST,
        url=MOCK_REQUEST_URL,
        json={"name": "morpheus", "job": "leader"},
        validation_model=TestModel,
    )
    assert isinstance(client_response.get_validated_data(), TestModel)


@pytest.mark.asyncio
async def test_validate_and_fail_with_model(respx_mock):
    class TestModel(BaseModel):
        name: Literal["John"]
        job: str

    payload = {"name": "morpheus", "job": "leader"}
    respx_mock.post(MOCK_REQUEST_URL).mock(make_mock_response(payload))

    client_response: AsyncRequest = await AsyncRequest(
        method=AsyncRequest.Method.POST,
        url=MOCK_REQUEST_URL,
        json=payload,
        validation_model=TestModel,
    )
    with pytest.raises(Exception):
        client_response.is_valid(raise_exceptions=True)
    assert client_response.has_exception is True
    assert isinstance(client_response.exception, Exception)


@mock.patch("gradio.utils.AsyncRequest._validate_response_data")
@pytest.mark.asyncio
async def test_exception_type(validate_response_data, respx_mock):
    class ResponseValidationError(Exception):
        message = "Response object is not valid."

    validate_response_data.side_effect = Exception()

    respx_mock.get(MOCK_REQUEST_URL).mock(Response(201))

    client_response: AsyncRequest = await AsyncRequest(
        method=AsyncRequest.Method.GET,
        url=MOCK_REQUEST_URL,
        exception_type=ResponseValidationError,
    )
    assert isinstance(client_response.exception, ResponseValidationError)


@pytest.mark.asyncio
async def test_validate_with_function(respx_mock):
    respx_mock.post(MOCK_REQUEST_URL).mock(
        make_mock_response({"name": "morpheus", "id": 1})
    )

    def has_name(response):
        if response["name"] is not None:
            return response
        raise Exception

    client_response: AsyncRequest = await AsyncRequest(
        method=AsyncRequest.Method.POST,
        url=MOCK_REQUEST_URL,
        json={"name": "morpheus", "job": "leader"},
        validation_function=has_name,
    )
    validated_data = client_response.get_validated_data()
    assert client_response.is_valid() is True
    assert validated_data["id"] is not None
    assert client_response.exception is None


@pytest.mark.asyncio
async def test_validate_and_fail_with_function(respx_mock):
    def has_name(response):
        if response["name"] is not None and response["name"] == "Alex":
            return response
        raise Exception

    respx_mock.post(MOCK_REQUEST_URL).mock(make_mock_response({"name": "morpheus"}))

    client_response: AsyncRequest = await AsyncRequest(
        method=AsyncRequest.Method.POST,
        url=MOCK_REQUEST_URL,
        json={"name": "morpheus", "job": "leader"},
        validation_function=has_name,
    )
    assert client_response.is_valid() is False
    with pytest.raises(Exception):
        client_response.is_valid(raise_exceptions=True)
    assert client_response.exception is not None


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
    def test_get_continuous_fn(self):
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

        gen_int_return = get_continuous_fn(fn=int_return, every=0.01)
        gen_int_yield = get_continuous_fn(fn=int_yield, every=0.01)
        gen_list_yield = get_continuous_fn(fn=list_yield, every=0.01)
        gener_int_return = gen_int_return(1)
        gener_int = gen_int_yield(1)  # Primitive
        gener_list = gen_list_yield([1])  # Reference
        assert next(gener_int_return) == 2
        assert next(gener_int_return) == 2
        assert next(gener_int) == 1
        assert next(gener_int) == 2
        assert next(gener_int) == 1
        assert [1] == next(gener_list)
        assert [1, 1] == next(gener_list)
        assert [1, 1, 1] == next(gener_list)


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
