from unittest.mock import MagicMock, patch

import pytest

import gradio as gr
from gradio.external_utils import (
    component_from_parameter_schema,
    component_from_request_body_schema,
    create_endpoint_fn,
    resolve_schema_ref,
)


@pytest.mark.parametrize(
    "param_info,expected_type",
    [
        ({"name": "age", "schema": {"type": "integer"}}, gr.Number),
        ({"name": "is_active", "schema": {"type": "boolean"}}, gr.Checkbox),
        ({"name": "name", "schema": {"type": "string"}}, gr.Textbox),
        ({"name": "category", "schema": {"type": "object"}}, gr.Textbox),
    ],
)
def test_component_from_parameter_schema(param_info, expected_type):
    comp = component_from_parameter_schema(param_info)
    assert isinstance(comp, expected_type)


def test_resolve_schema_ref_direct():
    schema = {"type": "string"}
    spec = {}
    assert resolve_schema_ref(schema, spec) == schema


def test_resolve_schema_ref_ref():
    schema = {"$ref": "#/components/schemas/Pet"}
    spec = {
        "components": {
            "schemas": {
                "Pet": {"type": "object", "properties": {"id": {"type": "integer"}}}
            }
        }
    }
    resolved = resolve_schema_ref(schema, spec)
    assert resolved["type"] == "object"
    assert "id" in resolved["properties"]


@pytest.mark.parametrize(
    "request_body,expected_type",
    [
        (
            {"content": {"application/json": {"schema": {"type": "object"}}}},
            gr.Textbox,
        ),
        (
            {
                "content": {
                    "application/octet-stream": {
                        "schema": {"type": "string", "format": "binary"}
                    }
                }
            },
            gr.File,
        ),
    ],
)
def test_component_from_request_body_schema(request_body, expected_type):
    comp = component_from_request_body_schema(request_body, {})
    assert isinstance(comp, expected_type)


def test_create_endpoint_fn_signature():
    operation = {
        "parameters": [
            {"name": "petId", "in": "path", "schema": {"type": "integer"}},
            {"name": "status", "in": "query", "schema": {"type": "string"}},
        ],
        "summary": "Find pet by ID and status",
    }
    fn = create_endpoint_fn("/pet/{petId}", "get", operation, "http://api.example.com")
    sig = fn.__signature__  # type: ignore
    assert [p.name for p in sig.parameters.values()][:2] == ["petId", "status"]


def test_create_endpoint_fn_docstring():
    operation = {
        "parameters": [
            {
                "name": "petId",
                "in": "path",
                "description": "ID of pet",
                "schema": {"type": "integer"},
            },
        ],
        "summary": "Find pet by ID",
        "description": "Returns a pet by its ID.",
    }
    fn = create_endpoint_fn("/pet/{petId}", "get", operation, "http://api.example.com")
    doc = fn.__doc__
    assert doc
    assert "Returns a pet by its ID" in doc
    assert "petId" in doc


@patch("httpx.get")
def test_create_endpoint_fn_with_auth_token(mock_get):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"result": "success"}
    mock_get.return_value = mock_response

    operation = {
        "parameters": [
            {"name": "id", "in": "query", "schema": {"type": "string"}},
        ],
        "summary": "Test endpoint with auth",
    }
    fn = create_endpoint_fn(
        "/test",
        "get",
        operation,
        "http://api.example.com",
        auth_token="my-secret-token",
    )

    result = fn("test-id")

    mock_get.assert_called_once()
    call_args = mock_get.call_args
    assert call_args[1]["headers"]["Authorization"] == "Bearer my-secret-token"
    assert call_args[1]["headers"]["Content-Type"] == "application/json"
    assert result == {"result": "success"}


def test_create_endpoint_fn_without_auth_token():
    with patch("httpx.get") as mock_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": "success"}
        mock_get.return_value = mock_response

        operation = {"summary": "Test endpoint without auth"}
        fn = create_endpoint_fn(
            "/test", "get", operation, "http://api.example.com", auth_token=None
        )

        fn()

        call_args = mock_get.call_args
        assert "Authorization" not in call_args[1]["headers"]
        assert call_args[1]["headers"]["Content-Type"] == "application/json"
