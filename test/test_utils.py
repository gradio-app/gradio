import copy
import ipaddress
import json
import os
import unittest
import unittest.mock as mock
import warnings

import pytest
import pytest_asyncio
import requests
from httpx import AsyncClient, Response
from pydantic import BaseModel
from typing_extensions import Literal

from gradio.test_data.blocks_configs import (
    XRAY_CONFIG,
    XRAY_CONFIG_DIFF_IDS,
    XRAY_CONFIG_WITH_MISTAKE,
)
from gradio.utils import (
    Request,
    append_unique_suffix,
    assert_configs_are_equivalent_besides_ids,
    colab_check,
    delete_none,
    error_analytics,
    format_ner_list,
    get_local_ip_address,
    ipython_check,
    launch_analytics,
    readme_to_html,
    sanitize_list_for_csv,
    sanitize_value_for_csv,
    version_check,
)

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestUtils(unittest.TestCase):
    @mock.patch("requests.get")
    def test_should_warn_with_unable_to_parse(self, mock_get):
        mock_get.side_effect = json.decoder.JSONDecodeError("Expecting value", "", 0)

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(
                str(w[-1].message), "unable to parse version details from package URL."
            )

    @mock.patch("requests.Response.json")
    def test_should_warn_url_not_having_version(self, mock_json):
        mock_json.return_value = {"foo": "bar"}

        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            version_check()
            self.assertEqual(
                str(w[-1].message), "package URL does not contain version info."
            )

    @mock.patch("requests.post")
    def test_error_analytics_doesnt_crash_on_connection_error(self, mock_post):
        mock_post.side_effect = requests.ConnectionError()
        error_analytics("placeholder", "placeholder")
        mock_post.assert_called()

    @mock.patch("requests.post")
    def test_error_analytics_successful(self, mock_post):
        error_analytics("placeholder", "placeholder")
        mock_post.assert_called()

    @mock.patch("requests.post")
    def test_launch_analytics_doesnt_crash_on_connection_error(self, mock_post):
        mock_post.side_effect = requests.ConnectionError()
        launch_analytics(data={})
        mock_post.assert_called()

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


class TestIPAddress(unittest.TestCase):
    def test_get_ip(self):
        ip = get_local_ip_address()
        if ip == "No internet connection":
            return
        try:  # check whether ip is valid
            ipaddress.ip_address(ip)
        except ValueError:
            self.fail("Invalid IP address")

    @mock.patch("requests.get")
    def test_get_ip_without_internet(self, mock_get):
        mock_get.side_effect = requests.ConnectionError()
        ip = get_local_ip_address()
        self.assertEqual(ip, "No internet connection")


class TestAssertConfigsEquivalent(unittest.TestCase):
    def test_same_configs(self):
        self.assertTrue(
            assert_configs_are_equivalent_besides_ids(XRAY_CONFIG, XRAY_CONFIG)
        )

    def test_equivalent_configs(self):
        self.assertTrue(
            assert_configs_are_equivalent_besides_ids(XRAY_CONFIG, XRAY_CONFIG_DIFF_IDS)
        )

    def test_different_configs(self):
        with self.assertRaises(AssertionError):
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
            "theme": "default",
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
                    "status_tracker": None,
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
        with self.assertRaises(AssertionError):
            assert_configs_are_equivalent_besides_ids(config1, config2)


class TestFormatNERList(unittest.TestCase):
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
        self.assertEqual(format_ner_list(string, groups), result)

    def test_format_ner_list_empty(self):
        string = "I live in a city"
        groups = []
        result = [("I live in a city", None)]
        self.assertEqual(format_ner_list(string, groups), result)


class TestDeleteNone(unittest.TestCase):
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
        truth = {"a": 12, "b": 34, "k": {"d": 34, "m": [{"k": 23}, [1, 2, 3], {1, 2}]}}
        self.assertEqual(delete_none(input), truth)


@pytest_asyncio.fixture(scope="function", autouse=True)
async def client():
    """
    A fixture to mock the async client object.
    """
    async with AsyncClient() as mock_client:
        with mock.patch("gradio.utils.Request.client", mock_client):
            yield


class TestRequest:
    @pytest.mark.asyncio
    async def test_get(self):
        client_response: Request = await Request(
            method=Request.Method.GET,
            url="http://headers.jsontest.com/",
        )
        validated_data = client_response.get_validated_data()
        assert client_response.is_valid() is True
        assert validated_data["Host"] == "headers.jsontest.com"

    @pytest.mark.asyncio
    async def test_post(self):
        client_response: Request = await Request(
            method=Request.Method.POST,
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
            createdAt: str

        client_response: Request = await Request(
            method=Request.Method.POST,
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

        client_response: Request = await Request(
            method=Request.Method.POST,
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

    client_response: Request = await Request(
        method=Request.Method.GET,
        url=MOCK_REQUEST_URL,
    )
    validated_data = client_response.get_validated_data()
    assert client_response.is_valid() is True
    assert validated_data["Host"] == "headers.jsontest.com"


@pytest.mark.asyncio
async def test_post(respx_mock):

    payload = {"name": "morpheus", "job": "leader"}
    respx_mock.post(MOCK_REQUEST_URL).mock(make_mock_response(payload))

    client_response: Request = await Request(
        method=Request.Method.POST,
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
        createdAt: str

    client_response: Request = await Request(
        method=Request.Method.POST,
        url=MOCK_REQUEST_URL,
        json={"name": "morpheus", "job": "leader"},
        validation_model=TestModel,
    )
    assert isinstance(client_response.get_validated_data(), TestModel)


@pytest.mark.asyncio
async def test_validate_and_fail_with_model(respx_mock):
    class TestModel(BaseModel):
        name: Literal[str] = "John"
        job: str

    payload = {"name": "morpheus", "job": "leader"}
    respx_mock.post(MOCK_REQUEST_URL).mock(make_mock_response(payload))

    client_response: Request = await Request(
        method=Request.Method.POST,
        url=MOCK_REQUEST_URL,
        json=payload,
        validation_model=TestModel,
    )
    with pytest.raises(Exception):
        client_response.is_valid(raise_exceptions=True)
    assert client_response.has_exception is True
    assert isinstance(client_response.exception, Exception)


@mock.patch("gradio.utils.Request._validate_response_data")
@pytest.mark.asyncio
async def test_exception_type(validate_response_data, respx_mock):
    class ResponseValidationException(Exception):
        message = "Response object is not valid."

    validate_response_data.side_effect = Exception()

    respx_mock.get(MOCK_REQUEST_URL).mock(Response(201))

    client_response: Request = await Request(
        method=Request.Method.GET,
        url=MOCK_REQUEST_URL,
        exception_type=ResponseValidationException,
    )
    assert isinstance(client_response.exception, ResponseValidationException)


@pytest.mark.asyncio
async def test_validate_with_function(respx_mock):

    respx_mock.post(MOCK_REQUEST_URL).mock(
        make_mock_response({"name": "morpheus", "id": 1})
    )

    def has_name(response):
        if response["name"] is not None:
            return response
        raise Exception

    client_response: Request = await Request(
        method=Request.Method.POST,
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
        if response["name"] is not None:
            if response["name"] == "Alex":
                return response
        raise Exception

    respx_mock.post(MOCK_REQUEST_URL).mock(make_mock_response({"name": "morpheus"}))

    client_response: Request = await Request(
        method=Request.Method.POST,
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


if __name__ == "__main__":
    unittest.main()
