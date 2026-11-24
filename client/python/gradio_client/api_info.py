"""Helpers that turn an app's API info (as returned by `Client.view_api`) into a
compact description of what each endpoint accepts and returns."""

from __future__ import annotations

from typing import Any

from gradio_client.utils import traverse


def _resolve_refs(schema: Any, defs: dict[str, Any] | None = None) -> Any:
    """Recursively resolve $ref references and remove $defs."""
    if not isinstance(schema, dict):
        if isinstance(schema, list):
            return [_resolve_refs(item, defs) for item in schema]
        return schema

    if defs is None:
        defs = schema.get("$defs", {})

    if "$ref" in schema:
        ref_name = schema["$ref"].split("/")[-1]
        if defs and ref_name in defs:
            return _resolve_refs(defs[ref_name], defs)
        return schema

    return {
        key: _resolve_refs(value, defs)
        for key, value in schema.items()
        if key != "$defs"
    }


def _is_file_schema(schema: Any) -> bool:
    """Check if a schema represents a file type (has path + meta with gradio.FileData)."""
    if not isinstance(schema, dict):
        return False
    props = schema.get("properties", {})
    if "path" not in props or "meta" not in props:
        return False
    meta = props["meta"]
    meta_props = meta.get("properties", {})
    if "_type" in meta_props:
        return meta_props["_type"].get("const") == "gradio.FileData"
    meta_default = meta.get("default", {})
    if isinstance(meta_default, dict):
        return meta_default.get("_type") == "gradio.FileData"
    return False


def _simplify_file_schema(is_input: bool, url_only: bool) -> dict[str, str]:
    if is_input:
        path = "url" if url_only else "<local path or url>"
        return {
            "type": "filepath",
            "description": (
                f'Must include {{"path": "{path}", "meta": {{"_type": "gradio.FileData"}}}}. '
                "The meta key signals that the file will be uploaded to the remote server."
            ),
        }
    if url_only:
        return {
            "type": "object",
            "description": "JSON object with url key to fetch the output",
        }
    return {"type": "filepath", "description": "The returned file path on disk."}


def simplify_json_schema(
    schema: Any, is_input: bool = True, url_only: bool = False
) -> Any:
    """Inlines `$ref`s and replaces every file schema with a short description.

    Parameters:
        schema: The JSON schema of a parameter or return value.
        is_input: Whether the schema describes a parameter (True) or a return value (False).
        url_only: Whether files can only be passed, and are only returned, as URLs.
    """
    return traverse(
        _resolve_refs(schema),
        lambda _: _simplify_file_schema(is_input, url_only),
        _is_file_schema,
    )


def condense_info(info: dict[str, Any], url_only: bool = False) -> dict[str, Any]:
    """Reduces API info to the name, type and default of each endpoint's parameters
    and return values.

    Parameters:
        info: The API info of an app, in the format returned by `Client.view_api(return_format="dict")`.
        url_only: Whether files can only be passed, and are only returned, as URLs.
    """
    condensed_info = {}
    for endpoint, data_format in info["named_endpoints"].items():
        condensed_info[endpoint] = {
            "parameters": [
                {
                    "name": param["parameter_name"],
                    "required": not param["parameter_has_default"],
                    "default": param["parameter_default"],
                    "type": simplify_json_schema(
                        param["type"], is_input=True, url_only=url_only
                    ),
                }
                for param in data_format["parameters"]
            ],
            "returns": [
                {
                    "name": output["label"],
                    "type": simplify_json_schema(
                        output["type"], is_input=False, url_only=url_only
                    ),
                }
                for output in data_format["returns"]
            ],
            "description": data_format.get("description", ""),
        }
    return condensed_info
