"""Utility function for gradio/external.py, designed for internal use."""

from __future__ import annotations

import base64
import inspect
import json
import math
import re
import warnings

import httpx
import yaml
from gradio_client.utils import encode_url_or_file_to_base64
from huggingface_hub import HfApi, ImageClassificationOutputElement, InferenceClient

from gradio import components
from gradio.exceptions import Error, TooManyRequestsError


def get_model_info(model_name, hf_token=None):
    hf_api = HfApi(token=hf_token)
    print(f"Fetching model from: https://huggingface.co/{model_name}")

    model_info = hf_api.model_info(model_name)
    pipeline = model_info.pipeline_tag
    tags = model_info.tags
    return pipeline, tags


##################
# Helper functions for processing tabular data
##################


def get_tabular_examples(model_name: str) -> dict[str, list[float]]:
    readme = httpx.get(f"https://huggingface.co/{model_name}/resolve/main/README.md")
    if readme.status_code != 200:
        warnings.warn(f"Cannot load examples from README for {model_name}", UserWarning)
        example_data = {}
    else:
        yaml_regex = re.search(
            "(?:^|[\r\n])---[\n\r]+([\\S\\s]*?)[\n\r]+---([\n\r]|$)", readme.text
        )
        if yaml_regex is None:
            example_data = {}
        else:
            example_yaml = next(
                yaml.safe_load_all(readme.text[: yaml_regex.span()[-1]])
            )
            example_data = example_yaml.get("widget", {}).get("structuredData", {})
    if not example_data:
        raise ValueError(
            f"No example data found in README.md of {model_name} - Cannot build gradio demo. "
            "See the README.md here: https://huggingface.co/scikit-learn/tabular-playground/blob/main/README.md "
            "for a reference on how to provide example data to your model."
        )
    # replace nan with string NaN for inference Endpoints
    for data in example_data.values():
        for i, val in enumerate(data):
            if isinstance(val, float) and math.isnan(val):
                data[i] = "NaN"
    return example_data


def cols_to_rows(
    example_data: dict[str, list[float | str] | None],
) -> tuple[list[str], list[list[float]]]:
    headers = list(example_data.keys())
    n_rows = max(len(example_data[header] or []) for header in headers)
    data = []
    for row_index in range(n_rows):
        row_data = []
        for header in headers:
            col = example_data[header] or []
            if row_index >= len(col):
                row_data.append("NaN")
            else:
                row_data.append(col[row_index])
        data.append(row_data)
    return headers, data


def rows_to_cols(incoming_data: dict) -> dict[str, dict[str, dict[str, list[str]]]]:
    data_column_wise = {}
    for i, header in enumerate(incoming_data["headers"]):
        data_column_wise[header] = [str(row[i]) for row in incoming_data["data"]]
    return {"inputs": {"data": data_column_wise}}


##################
# Helper functions for processing other kinds of data
##################


def postprocess_label(scores: list[ImageClassificationOutputElement]) -> dict:
    return {c.label: c.score for c in scores}


def postprocess_mask_tokens(scores: list[dict[str, str | float]]) -> dict:
    return {c["token_str"]: c["score"] for c in scores}


def postprocess_question_answering(answer: dict) -> tuple[str, dict]:
    return answer["answer"], {answer["answer"]: answer["score"]}


def postprocess_visual_question_answering(scores: list[dict[str, str | float]]) -> dict:
    return {c["answer"]: c["score"] for c in scores}


def zero_shot_classification_wrapper(client: InferenceClient):
    def zero_shot_classification_inner(input: str, labels: str, multi_label: bool):
        return client.zero_shot_classification(
            input, labels.split(","), multi_label=multi_label
        )

    return zero_shot_classification_inner


def sentence_similarity_wrapper(client: InferenceClient):
    def sentence_similarity_inner(input: str, sentences: str):
        return client.sentence_similarity(input, sentences.split("\n"))

    return sentence_similarity_inner


def text_generation_wrapper(client: InferenceClient):
    def text_generation_inner(input: str):
        return input + client.text_generation(input)

    return text_generation_inner


def conversational_wrapper(client: InferenceClient):
    def chat_fn(message, history):
        if not history:
            history = []
        history.append({"role": "user", "content": message})
        try:
            out = ""
            for chunk in client.chat_completion(messages=history, stream=True):
                out += chunk.choices[0].delta.content or ""
                yield out
        except Exception as e:
            handle_hf_error(e)

    return chat_fn


def encode_to_base64(r: httpx.Response) -> str:
    # Handles the different ways HF API returns the prediction
    base64_repr = base64.b64encode(r.content).decode("utf-8")
    data_prefix = ";base64,"
    # Case 1: base64 representation already includes data prefix
    if data_prefix in base64_repr:
        return base64_repr
    else:
        content_type = r.headers.get("content-type")
        # Case 2: the data prefix is a key in the response
        if content_type == "application/json":
            try:
                data = r.json()[0]
                content_type = data["content-type"]
                base64_repr = data["blob"]
            except KeyError as ke:
                raise ValueError(
                    "Cannot determine content type returned by external API."
                ) from ke
        # Case 3: the data prefix is included in the response headers
        else:
            pass
        new_base64 = f"data:{content_type};base64,{base64_repr}"
        return new_base64


def format_ner_list(input_string: str, ner_groups: list[dict[str, str | int]]):
    if len(ner_groups) == 0:
        return [(input_string, None)]

    output = []
    end = 0
    prev_end = 0

    for group in ner_groups:
        entity, start, end = group["entity_group"], group["start"], group["end"]
        output.append((input_string[prev_end:start], None))
        output.append((input_string[start:end], entity))
        prev_end = end

    output.append((input_string[end:], None))
    return output


def token_classification_wrapper(client: InferenceClient):
    def token_classification_inner(input: str):
        ner_list = client.token_classification(input)
        return format_ner_list(input, ner_list)  # type: ignore

    return token_classification_inner


def object_detection_wrapper(client: InferenceClient):
    def object_detection_inner(input: str):
        annotations = client.object_detection(input)
        formatted_annotations = [
            (
                (
                    a["box"]["xmin"],
                    a["box"]["ymin"],
                    a["box"]["xmax"],
                    a["box"]["ymax"],
                ),
                a["label"],
            )
            for a in annotations
        ]
        return (input, formatted_annotations)

    return object_detection_inner


def image_text_to_text_wrapper(client: InferenceClient):
    def chat_fn(image, text):
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": encode_url_or_file_to_base64(image)},
                    },
                    {"type": "text", "text": text},
                ],
            }
        ]

        try:
            response = client.chat_completion(messages=messages, stream=False)
            return response.choices[0].message.content
        except Exception as e:
            # Fallback to image_to_text for models that don't support chat_completion
            try:
                # Try image_to_text (standard image captioning)
                result = client.image_to_text(image)
                return f"Image description: {result}\n\nUser question: {text}\n\nNote: This model doesn't support question-answering about images, only image captioning."
            except Exception:
                handle_hf_error(e)

    return chat_fn


def chatbot_preprocess(text, state):
    if not state:
        return text, [], []
    return (
        text,
        state["conversation"]["generated_responses"],
        state["conversation"]["past_user_inputs"],
    )


def chatbot_postprocess(response):
    chatbot_history = list(
        zip(
            response["conversation"]["past_user_inputs"],
            response["conversation"]["generated_responses"],
            strict=False,
        )
    )
    return chatbot_history, response


def tabular_wrapper(client: InferenceClient, pipeline: str):
    # This wrapper is needed to handle an issue in the InfereneClient where the model name is not
    # automatically loaded when using the tabular_classification and tabular_regression methods.
    # See: https://github.com/huggingface/huggingface_hub/issues/2015
    def tabular_inner(data):
        if pipeline not in ("tabular_classification", "tabular_regression"):
            raise TypeError(f"pipeline type {pipeline!r} not supported")
        assert client.model  # noqa: S101
        if pipeline == "tabular_classification":
            return client.tabular_classification(data, model=client.model)
        else:
            return client.tabular_regression(data, model=client.model)

    return tabular_inner


##################
# Helper function for cleaning up an Interface loaded from HF Spaces
##################


def streamline_spaces_interface(config: dict) -> dict:
    """Streamlines the interface config dictionary to remove unnecessary keys."""
    config["inputs"] = [
        components.get_component_instance(component)
        for component in config["input_components"]
    ]
    config["outputs"] = [
        components.get_component_instance(component)
        for component in config["output_components"]
    ]
    parameters = {
        "article",
        "description",
        "flagging_options",
        "inputs",
        "outputs",
        "title",
    }
    config = {k: config[k] for k in parameters}
    return config


def handle_hf_error(e: Exception):
    if "429" in str(e):
        raise TooManyRequestsError() from e
    elif "401" in str(e) or "You must provide an api_key" in str(e):
        raise Error("Unauthorized, please make sure you are signed in.") from e
    else:
        raise Error(str(e)) from e


def create_endpoint_fn(
    endpoint_path: str,
    endpoint_method: str,
    endpoint_operation: dict,
    base_url: str,
    auth_token: str | None = None,
):
    # Get request body info for docstring generation
    request_body = endpoint_operation.get("requestBody", {})

    def endpoint_fn(*args):
        url = f"{base_url.rstrip('/')}{endpoint_path}"

        headers = {"Content-Type": "application/json"}
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"

        params = {}
        body_data = {}

        operation_params = endpoint_operation.get("parameters", [])
        request_body = endpoint_operation.get("requestBody", {})

        param_index = 0
        for param in operation_params:
            if param_index < len(args):
                if param.get("in") == "query":
                    params[param["name"]] = args[param_index]
                elif param.get("in") == "path":
                    url = url.replace(f"{{{param['name']}}}", str(args[param_index]))
                param_index += 1

        is_file_upload = False
        if request_body and param_index < len(args):
            content = request_body.get("content", {})
            for content_type in content:
                if content_type in ["application/octet-stream", "multipart/form-data"]:
                    is_file_upload = True
                    break

        if request_body and param_index < len(args):
            if is_file_upload:
                file_data = args[param_index]
                if file_data:
                    headers["Content-Type"] = "application/octet-stream"
                    body_data = file_data
                else:
                    body_data = b""
            else:
                body_data = json.loads(args[param_index])
        try:
            if endpoint_method.lower() == "get":
                response = httpx.get(url, params=params, headers=headers)
            elif endpoint_method.lower() == "post":
                response = httpx.post(
                    url,
                    params=params,
                    content=body_data if is_file_upload else None,
                    json=body_data if not is_file_upload else None,
                    headers=headers,
                )
            elif endpoint_method.lower() == "put":
                response = httpx.put(
                    url,
                    params=params,
                    content=body_data if is_file_upload else None,
                    json=body_data if not is_file_upload else None,
                    headers=headers,
                )
            elif endpoint_method.lower() == "patch":
                response = httpx.patch(
                    url,
                    params=params,
                    content=body_data if is_file_upload else None,
                    json=body_data if not is_file_upload else None,
                    headers=headers,
                )
            elif endpoint_method.lower() == "delete":
                response = httpx.delete(url, params=params, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {endpoint_method}")

            if response.status_code in [200, 201, 202, 204]:
                return response.json()
            else:
                return {
                    "__status__": "error",
                    "status_code": response.status_code,
                    "message": response.text,
                }
        except Exception as e:
            return f"Error: {str(e)}"

    summary = endpoint_operation.get("summary", "")
    description = endpoint_operation.get("description", "")

    param_docs = []
    param_names = []

    for param in endpoint_operation.get("parameters", []):
        param_name = param.get("name", "")
        param_desc = param.get("description", "")
        param_schema = param.get("schema", {})
        param_enum = param_schema.get("enum", [])
        if param_enum:
            param_desc += f" (Choices: {', '.join(param_enum)})"
        param_names.append(param_name)
        param_docs.append(f"    {param_name}: {param_desc}")

    if request_body:
        body_desc = request_body.get("description", "URL of file")
        param_docs.append(f"    request_body: {body_desc}")
        param_names.append("request_body")

    docstring_parts = []
    if description or summary:
        docstring_parts.append(description or summary)
    if param_docs:
        docstring_parts.append("Parameters:")
        docstring_parts.extend(param_docs)

    endpoint_fn.__doc__ = "\n".join(docstring_parts)

    if param_names:
        sig_params = []
        for name in param_names:
            sig_params.append(
                inspect.Parameter(
                    name=name, kind=inspect.Parameter.POSITIONAL_OR_KEYWORD
                )
            )
        sig_params.append(
            inspect.Parameter(name="args", kind=inspect.Parameter.VAR_POSITIONAL)
        )

        new_sig = inspect.Signature(parameters=sig_params)

        endpoint_fn.__signature__ = new_sig  # type: ignore

    return endpoint_fn


def component_from_parameter_schema(param_info: dict) -> components.Component:
    import gradio as gr

    param_name = param_info.get("name")
    param_description = param_info.get("description")

    param_schema = param_info.get("schema", {})
    param_type = param_schema.get("type")
    enum_values = param_schema.get("enum")
    default_value = param_schema.get("default")

    if enum_values is not None:
        component = gr.Dropdown(
            choices=enum_values,
            label=param_name,
            value=default_value,
            allow_custom_value=False,
            info=param_description,
        )
    elif param_type in ("number", "integer"):
        component = gr.Number(
            label=param_name,
            value=default_value,
            info=param_description,
        )
    elif param_type == "boolean":
        component = gr.Checkbox(
            label=param_name,
            value=default_value,
            info=param_description,
        )
    elif param_type == "array":
        component = gr.Textbox(
            label=f"{param_name} (JSON array)",
            value="[]",
            info=param_description,
        )
    else:
        component = gr.Textbox(
            label=param_name,
            value=default_value,
            info=param_description,
        )

    return component


def resolve_schema_ref(schema: dict, spec: dict) -> dict:
    """Resolve schema references in OpenAPI spec."""
    if "$ref" in schema:
        ref_path = schema["$ref"]
        if ref_path.startswith("#/components/schemas/"):
            schema_name = ref_path.split("/")[-1]
            return spec.get("components", {}).get("schemas", {}).get(schema_name, {})
        elif ref_path.startswith("#/"):
            path_parts = ref_path.split("/")[1:]
            current = spec
            for part in path_parts:
                current = current.get(part, {})
            return current
    return schema


def component_from_request_body_schema(
    request_body: dict, spec: dict
) -> components.Component | None:
    """Create a Gradio component from an OpenAPI request body schema."""
    import gradio as gr

    if not request_body:
        return None

    content = request_body.get("content", {})
    description = request_body.get("description", "Request Body")

    for content_type, content_schema in content.items():
        if content_type in ["application/octet-stream", "multipart/form-data"]:
            schema = resolve_schema_ref(content_schema.get("schema", {}), spec)
            if schema.get("type") == "string" and schema.get("format") == "binary":
                return gr.File(label="File")

    json_content = content.get("application/json", {})
    if not json_content:
        for content_type, content_schema in content.items():
            if content_type.startswith("application/"):
                json_content = content_schema
                break

    if not json_content:
        return None

    schema = resolve_schema_ref(json_content.get("schema", {}), spec)

    default_value = schema.get("example", {})
    if not default_value and schema.get("type") == "object":
        properties = schema.get("properties", {})
        default_value = {}
        for prop_name, prop_schema in properties.items():
            prop_schema = resolve_schema_ref(prop_schema, spec)
            prop_type = prop_schema.get("type")
            if prop_type == "string":
                default_value[prop_name] = prop_schema.get("example", "")
            elif prop_type in ("number", "integer"):
                default_value[prop_name] = prop_schema.get("example", 0)
            elif prop_type == "boolean":
                default_value[prop_name] = prop_schema.get("example", False)
            elif prop_type == "array":
                default_value[prop_name] = prop_schema.get("example", [])
            elif prop_type == "object":
                default_value[prop_name] = prop_schema.get("example", {})

    component = gr.Textbox(
        label="Request Body",
        value=json.dumps(default_value, indent=2),
        info=description,
    )

    return component


def method_box(method: str) -> str:
    color_map = {
        "GET": "#61affe",
        "POST": "#49cc90",
        "PUT": "#fca130",
        "DELETE": "#f93e3e",
        "PATCH": "#50e3c2",
    }
    color = color_map.get(method.upper(), "#999")
    return (
        f"<span style='"
        f"display:inline-block;min-width:48px;padding:2px 10px;border-radius:4px;"
        f"background:{color};color:white;font-weight:bold;font-family:monospace;"
        f"margin-right:8px;text-align:center;border:2px solid {color};"
        f"box-shadow:0 1px 2px rgba(0,0,0,0.08);'"
        f">{method.upper()}</span>"
    )
