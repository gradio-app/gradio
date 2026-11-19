from __future__ import annotations

import gradio as gr

from gradio_client.api_info import condense_info, simplify_json_schema
from gradio_client.snippet import generate_cli_snippet


def _api_info():
    with gr.Blocks() as demo:
        name = gr.Textbox(label="Name")
        image = gr.Image(label="Picture")
        count = gr.Slider(1, 10, value=3, label="Count")
        gr.Button().click(
            lambda name, image, count: (name, image),
            [name, image, count],
            [name, image],
            api_name="run",
        )
    return demo.get_api_info()


def test_condense_info_lists_parameters_and_returns():
    endpoint = condense_info(_api_info())["/run"]
    assert [p["name"] for p in endpoint["parameters"]] == ["name", "image", "count"]
    assert [r["name"] for r in endpoint["returns"]] == ["Name", "Picture"]
    count = endpoint["parameters"][2]
    assert count["required"] is False
    assert count["default"] == 3


def test_files_are_described_instead_of_expanded():
    endpoint = condense_info(_api_info())["/run"]
    image_in = endpoint["parameters"][1]["type"]
    assert image_in["type"] == "filepath"
    assert "<local path or url>" in image_in["description"]
    assert endpoint["returns"][1]["type"] == {
        "type": "filepath",
        "description": "The returned file path on disk.",
    }


def test_url_only_describes_files_as_urls():
    endpoint = condense_info(_api_info(), url_only=True)["/run"]
    assert '"path": "url"' in endpoint["parameters"][1]["type"]["description"]
    assert endpoint["returns"][1]["type"]["type"] == "object"


def test_simplify_json_schema_inlines_refs():
    schema = {
        "type": "object",
        "properties": {"item": {"$ref": "#/$defs/Item"}},
        "$defs": {"Item": {"type": "string"}},
    }
    assert simplify_json_schema(schema) == {
        "type": "object",
        "properties": {"item": {"type": "string"}},
    }


def test_generate_cli_snippet_keeps_only_path_and_meta_of_files():
    snippet = generate_cli_snippet(_api_info()["named_endpoints"])["/run"]
    assert snippet.startswith("{command} predict {space_id} /run '{")
    assert '"count": 3' in snippet
    assert '"path": "https://' in snippet
    assert '"_type": "gradio.FileData"' in snippet
    assert "orig_name" not in snippet
