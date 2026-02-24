"""Centralized code snippet generation for Gradio API endpoints. Generates Python, JavaScript, and cURL code snippets from API info dicts."""

import copy
import json
import re
from typing import Any

BLOB_COMPONENTS = {"Audio", "File", "Image", "Video"}


def _is_file_data(obj: Any) -> bool:
    return (
        isinstance(obj, dict)
        and "url" in obj
        and obj.get("url")
        and "meta" in obj
        and isinstance(obj.get("meta"), dict)
        and obj["meta"].get("_type") == "gradio.FileData"
    )


def _has_file_data(obj: Any) -> bool:
    if isinstance(obj, dict):
        if _is_file_data(obj):
            return True
        return any(_has_file_data(v) for v in obj.values())
    if isinstance(obj, (list, tuple)):
        return any(_has_file_data(item) for item in obj)
    return False


def _replace_file_data_py(obj: Any) -> Any:
    if isinstance(obj, dict) and _is_file_data(obj):
        return f"handle_file('{obj['url']}')"
    if isinstance(obj, (list, tuple)):
        return [_replace_file_data_py(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _replace_file_data_py(v) for k, v in obj.items()}
    return obj


def _simplify_file_data(obj: Any) -> Any:
    if isinstance(obj, dict) and _is_file_data(obj):
        return {"path": obj["url"], "meta": {"_type": "gradio.FileData"}}
    if isinstance(obj, (list, tuple)):
        return [_simplify_file_data(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _simplify_file_data(v) for k, v in obj.items()}
    return obj


_UNQUOTED = "UNQUOTED_GRADIO_"


def _stringify_py(obj: Any) -> str:
    def _prepare(o: Any) -> Any:
        if o is None:
            return f"{_UNQUOTED}None"
        if isinstance(o, bool):
            return f"{_UNQUOTED}True" if o else f"{_UNQUOTED}False"
        if isinstance(o, str) and o.startswith("handle_file(") and o.endswith(")"):
            return f"{_UNQUOTED}{o}"
        if isinstance(o, (list, tuple)):
            return [_prepare(item) for item in o]
        if isinstance(o, dict):
            return {k: _prepare(v) for k, v in o.items()}
        return o

    prepared = _prepare(obj)
    result = json.dumps(prepared)
    result = re.sub(
        rf'"{_UNQUOTED}(handle_file\([^)]*\))"',
        r"\1",
        result,
    )
    result = result.replace(f'"{_UNQUOTED}None"', "None")
    result = result.replace(f'"{_UNQUOTED}True"', "True")
    result = result.replace(f'"{_UNQUOTED}False"', "False")
    return result


def _represent_value(value: Any, python_type: str | None, lang: str) -> str:
    if python_type is None:
        return "None" if lang == "py" else "null"
    if value is None:
        return "None" if lang == "py" else "null"
    if python_type in ("string", "str"):
        return f'"{value}"'
    if python_type == "number":
        return str(value)
    if python_type in ("boolean", "bool"):
        if lang == "py":
            return "True" if value else "False"
        return str(value).lower() if isinstance(value, bool) else str(value)
    if python_type == "List[str]":
        return json.dumps(value)
    if python_type.startswith("Literal['"):
        return f'"{value}"'

    if isinstance(value, str):
        if value == "":
            return "None" if lang == "py" else "null"
        return value

    value = copy.deepcopy(value)
    if lang == "bash":
        value = _simplify_file_data(value)
    if lang == "py":
        value = _replace_file_data_py(value)
    return _stringify_py(value)


def _get_param_value(param: dict) -> Any:
    if param.get("parameter_has_default"):
        return param.get("parameter_default")
    return param.get("example_input")


def generate_python_snippet(
    api_name: str,
    params: list[dict],
    src: str,
) -> str:
    has_file = any(_has_file_data(p.get("example_input")) for p in params)
    imports = "from gradio_client import Client"
    if has_file:
        imports += ", handle_file"

    lines = [imports, ""]
    lines.append(f'client = Client("{src}")')

    predict_args = []
    for p in params:
        name = p.get("parameter_name") or p.get("label", "input")
        value = _get_param_value(p)
        ptype = p.get("python_type", {}).get("type")
        formatted = _represent_value(value, ptype, "py")
        predict_args.append(f"\t{name}={formatted},")

    lines.append("result = client.predict(")
    lines.extend(predict_args)
    lines.append(f'\tapi_name="{api_name}",')
    lines.append(")")
    lines.append("print(result)")

    return "\n".join(lines)


def generate_js_snippet(
    api_name: str,
    params: list[dict],
    src: str,
) -> str:
    blob_params = [p for p in params if p.get("component") in BLOB_COMPONENTS]

    lines = ['import { Client } from "@gradio/client";', ""]

    for i, bp in enumerate(blob_params):
        example = bp.get("example_input", {})
        url = example.get("url", "") if isinstance(example, dict) else ""
        component = bp.get("component", "")
        lines.append(f'const response_{i} = await fetch("{url}");')
        lines.append(f"const example{component} = await response_{i}.blob();")

    if blob_params:
        lines.append("")

    lines.append(f'const client = await Client.connect("{src}");')

    blob_component_names = {bp.get("component") for bp in blob_params}

    predict_args = []
    for p in params:
        name = p.get("parameter_name") or p.get("label", "input")
        component = p.get("component", "")
        if component in blob_component_names:
            predict_args.append(f"\t\t{name}: example{component},")
        else:
            value = _get_param_value(p)
            ptype = p.get("python_type", {}).get("type")
            formatted = _represent_value(value, ptype, "js")
            predict_args.append(f"\t\t{name}: {formatted},")

    lines.append(f'const result = await client.predict("{api_name}", {{')
    lines.extend(predict_args)
    lines.append("});")
    lines.append("")
    lines.append("console.log(result.data);")

    return "\n".join(lines)


def generate_bash_snippet(
    api_name: str,
    params: list[dict],
    root: str,
    api_prefix: str = "/",
) -> str:
    normalised_root = root.rstrip("/")
    normalised_prefix = api_prefix if api_prefix else "/"
    endpoint_name = api_name.lstrip("/")

    data_values = []
    for p in params:
        value = _get_param_value(p)
        ptype = p.get("python_type", {}).get("type")
        formatted = _represent_value(value, ptype, "bash")
        data_values.append(formatted)

    data_str = ", ".join(data_values)
    base_url = f"{normalised_root}{normalised_prefix}call/{endpoint_name}"

    lines = [
        f'curl -X POST {base_url} -s -H "Content-Type: application/json" -d \'{{"data": [{data_str}]}}\' \\',
        "  | awk -F'\"' '{ print $4}' \\",
        f"  | read EVENT_ID; curl -N {base_url}/$EVENT_ID",
    ]

    return "\n".join(lines)


def generate_code_snippets(
    api_name: str,
    endpoint_info: dict,
    root: str,
    space_id: str | None = None,
    api_prefix: str = "/",
) -> dict[str, str]:
    params = endpoint_info.get("parameters", [])
    src = space_id or root

    return {
        "python": generate_python_snippet(api_name, params, src),
        "javascript": generate_js_snippet(api_name, params, src),
        "bash": generate_bash_snippet(api_name, params, root, api_prefix),
    }
