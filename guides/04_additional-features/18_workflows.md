# gr.Workflow

`gr.Workflow` is a visual, node-based AI pipeline builder built into Gradio. It lets you chain together Hugging Face Spaces, models, datasets, and your own Python functions on a drag-and-drop canvas:

<img width="1901" alt="image" src="https://github.com/user-attachments/assets/a77bf9a8-c264-4037-80e1-2b37c5e529d4" />


## Quickstart

The simplest possible Workflow app:

```python
import gradio as gr

gr.Workflow().launch()
```

Open the app, drag Spaces, models, and datasets from the sidebar onto the canvas, connect their ports, and hit **Run**. As you edit the workflow, a `workflow.json` file will automatically be created next to the Python script that created the Workflow. Pass `graph=` if you want to save it somewhere else. You can also use a coding agent to write or edit this file, allowing you to create workflows programmatically.

`gr.Workflow` is already a complete Gradio app and must be created at the top level. It cannot be nested inside a `gr.Blocks` context.

When running locally, `launch()` prints a private write-access URL. Open that URL to edit and save the workflow; the ordinary local URL and share URL are run-only. Keep the write-access URL private because edits affect the workflow seen by every visitor.

## Binding Python functions

Pass your own Python functions via `bind=` and they appear as callable nodes on the canvas. Gradio inspects the function signature to auto-generate input/output ports.

```python
import gradio as gr

def summarize(text: str) -> str:
    return text[:200]

gr.Workflow(bind=[summarize]).launch()
```

Use a dict to give nodes explicit names:

```python
gr.Workflow(bind={"My Summarizer": summarize}).launch()
```

Signature inference is intentionally simple. Parameters annotated as `int` or `float` become `number` ports, `bool` becomes `boolean`, and strings, unannotated parameters, and other annotations default to `text`. Gradio initially generates one output port for each bound function. For media ports or multiple outputs, define the function node's ports explicitly in the workflow JSON.

## Defining edges in code

For pipelines you want to ship with a fixed topology, declare edges programmatically:

```python
import gradio as gr

def clean(text: str) -> str:
    return text.strip().lower()

def tag(text: str) -> str:
    return f"[processed] {text}"

gr.Workflow(
    bind=[clean, tag],
    edges=[("clean", "tag")],
).launch()
```

Each edge is a `(from_fn, to_fn)` tuple referring to functions in `bind=`. Use `"fn_name.port_label"` to target a specific port when a node has multiple inputs or outputs; otherwise, the first port is used. Ensure the connected ports have compatible types.

> **Note:** `edges=` only connects bound Python functions while generating a new workflow. It cannot create edges to Space, model, or dataset nodes, and it is ignored when the workflow file already exists. Delete the file to regenerate the initial topology from `bind` and `edges`.

## Loading from a JSON file

Pass a `graph=` path to load a saved workflow topology. The canvas reads from the file on each page load and autosaves back to it when you make edits.

```python
gr.Workflow(graph="workflow.json").launch()
```

If the file doesn't exist yet, it's created on the first authorized edit. `bind=` does not automatically add or wire functions into an existing graph. To combine an existing graph with bound functions, either add the functions from the canvas's **Functions** menu or include an operator with `"kind": "fn"` whose `"fn"` value exactly matches a key in `bind`.

## Workflow JSON format

A workflow is a JSON file with three node collections:

```json
{
  "schema_version": "2",
  "name": "My Pipeline",
  "references": [
    {
      "id": "ref_prompt", "label": "Prompt", "role": "reference",
      "asset_type": "text",
      "inputs":  [{"id": "in", "label": "Text", "type": "text"}],
      "outputs": [{"id": "out", "label": "Text", "type": "text"}]
    }
  ],
  "operators": [
    {
      "id": "op_flux", "label": "FLUX.1", "role": "operator",
      "kind": "model",
      "model_id": "black-forest-labs/FLUX.1-schnell",
      "endpoint": "text_to_image",
      "pipeline_tag": "text-to-image",
      "inputs":  [{"id": "prompt", "label": "Prompt", "type": "text", "required": true}],
      "outputs": [{"id": "out_0", "label": "Image", "type": "image", "output_index": 0}]
    }
  ],
  "subjects": [
    {
      "id": "sub_img", "label": "Output Image", "role": "subject",
      "asset_type": "image",
      "inputs":  [{"id": "in", "label": "Image", "type": "image"}],
      "outputs": [{"id": "out", "label": "Image", "type": "image"}]
    }
  ],
  "edges": [
    {
      "id": "e1",
      "from_node_id": "ref_prompt", "from_port_id": "out",
      "to_node_id":   "op_flux",    "to_port_id":   "prompt",
      "type": "text"
    },
    {
      "id": "e2",
      "from_node_id": "op_flux", "from_port_id": "out_0",
      "to_node_id":   "sub_img", "to_port_id":   "in",
      "type": "image"
    }
  ]
}
```

Node geometry (`x`, `y`, `width`, and `height`) and `data` may be omitted. If any node is missing geometry, the canvas fills in defaults and auto-arranges the entire graph.

| Collection | Role |
|---|---|
| `references` | Inputs — uploaded files, editable text, literal values |
| `operators` | Processing steps — Spaces, models, datasets, Python functions |
| `subjects` | Outputs — the results being created |

### Operator kinds

| `kind` | What it calls |
|---|---|
| `"space"` | A Gradio Space on the Hub via `gradio_client`; set `space_id` and `endpoint` |
| `"model"` | A Hugging Face model via `InferenceClient`; set `model_id` and a supported `endpoint` such as `text_to_image`. `pipeline_tag` is also stored for discovery and compatibility with older graphs |
| `"dataset"` | One row from a Hub dataset per run, selected by the `row_index` input; set `dataset_id`, `dataset_config`, and `dataset_split` |
| `"fn"` | A Python function whose `fn` value matches a key passed via `bind=` |

## Port types

Ports are typed so the canvas can validate connections. Supported types:

`image` · `audio` · `video` · `text` · `number` · `boolean` · `gallery` · `file` · `json` · `model3d` · `any`

`any` is a compatibility fallback that can connect to every port type. `file` and `any` usually come from API schema inference and are not offered as reference or subject templates in the canvas picker.

## Fan-out pipelines

One reference can feed multiple operators simultaneously. When you run the workflow in the interactive canvas, operators at the same dependency depth run in parallel:

```python
# workflow.json excerpt — one product photo → 4 FLUX Kontext branches
"edges": [
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_0", ...},
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_1", ...},
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_2", ...},
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_3", ...}
]
```

When the same workflow is invoked through its generated Gradio API, the server currently executes these branches sequentially.

## Deploying to Spaces

A Workflow app is a standard Gradio app — deploy it to Hugging Face Spaces exactly like any other, by uploading the code to a Space, or by simply running in your terminal:

```
gradio deploy
```

Set `hf_oauth: true` [in your Space](https://huggingface.co/docs/hub/en/spaces-oauth) so the owner can authenticate for editing. The owning user, or an organization member with `write` or `admin` access, can edit and save the workflow. Other visitors get a read-only canvas and can run the pipeline using their OAuth identity or a Hugging Face access token. Without OAuth enabled, the Space cannot identify its owner, so the deployed workflow remains run-only.

## API access

Every Workflow app is a Gradio app, meaning that it exposes its connected pipelines through the standard Gradio REST API. Each disconnected pipeline containing one or more output (subject) nodes gets one endpoint. Its name is derived from the first subject's label — for example, a pipeline whose first subject is labelled "Output Image" becomes `/output_image`.

Uncomputed reference nodes feeding that pipeline become the endpoint's parameters. If the pipeline has multiple subjects, the endpoint returns all of them in subject declaration order rather than creating one endpoint per subject. Use `client.view_api()` to see the exact endpoint names, parameters, and return values:

```python
from gradio_client import Client

client = Client("your-username/my-workflow")
client.view_api()  # lists available endpoints and their parameters

result = client.predict("a sunset over mountains", api_name="/output_image")
```

This also means that you can reuse your workflows within larger workflows, making it possible to build modular and complex applications with Gradio Workflows!
