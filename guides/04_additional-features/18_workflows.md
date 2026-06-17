# gr.Workflow

`gr.Workflow` is a visual, node-based AI pipeline builder built into Gradio. It lets you chain together Hugging Face Spaces, models, datasets, and your own Python functions on a drag-and-drop canvas — without writing any glue code.

## Quickstart

The simplest possible Workflow app — a blank canvas that saves to `workflow.json`:

```python
import gradio as gr

gr.Workflow().launch()
```

Open the app, drag Spaces and models from the sidebar onto the canvas, connect their ports, and hit **Run**.

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

Each edge is a `(from_fn, to_fn)` tuple. Use `"fn_name.port_label"` to target a specific port when a node has multiple inputs or outputs.

> **Note:** `edges=` is only applied when no workflow file exists yet. If `workflow.json` already exists, `edges=` is ignored — delete the file to regenerate the topology from `bind` and `edges`.

## Loading from a JSON file

Pass a `graph=` path to load a saved workflow topology. The canvas reads from the file on each page load and autosaves back to it when you make edits.

```python
gr.Workflow(graph="workflow.json").launch()
```

If the file doesn't exist yet, it's created on first save. Combine `graph=` with `bind=` to pre-wire Space nodes alongside your Python functions.

## Workflow JSON format

A workflow is a JSON file with three node collections:

```json
{
  "schema_version": "2",
  "name": "My Pipeline",
  "references": [
    {
      "id": "ref_image", "label": "Input Photo", "role": "reference",
      "asset_type": "image",
      "inputs":  [{"id": "in", "label": "Image", "type": "image"}],
      "outputs": [{"id": "out","label": "Image", "type": "image"}],
      "x": 80, "y": 120, "width": 220, "height": 124, "data": {}
    }
  ],
  "operators": [
    {
      "id": "op_flux", "label": "FLUX.1", "role": "operator",
      "kind": "space",
      "space_id": "black-forest-labs/FLUX.1-schnell",
      "endpoint": "/infer",
      "inputs":  [{"id": "in_0", "label": "Prompt", "type": "text", "required": true}],
      "outputs": [{"id": "out_0","label": "Result","type": "image","output_index": 0}],
      "x": 400, "y": 120, "width": 220, "height": 124, "data": {}
    }
  ],
  "subjects": [
    {
      "id": "sub_img", "label": "Output Image", "role": "subject",
      "asset_type": "image",
      "inputs":  [{"id": "in", "label": "Image", "type": "image"}],
      "outputs": [{"id": "out","label": "Image","type": "image"}],
      "x": 700, "y": 120, "width": 220, "height": 107, "data": {}
    }
  ],
  "edges": [
    {
      "id": "e1",
      "from_node_id": "ref_image", "from_port_id": "out",
      "to_node_id":   "op_flux",   "to_port_id":   "in_0",
      "type": "image"
    }
  ]
}
```

| Collection | Role |
|---|---|
| `references` | Inputs — uploaded files, editable text, literal values |
| `operators` | Processing steps — Spaces, models, datasets, Python functions |
| `subjects` | Outputs — the results being created |

### Operator kinds

| `kind` | What it calls |
|---|---|
| `"space"` | Any Gradio Space on the Hub via `gradio_client` |
| `"model"` | HF Inference API — set `pipeline_tag` to select the task |
| `"dataset"` | Streams rows from any Hub dataset |
| `"fn"` | A Python function passed via `bind=` |

## Port types

Ports are typed so the canvas can validate connections. Supported types:

`image` · `audio` · `video` · `text` · `number` · `boolean` · `gallery` · `file` · `json` · `model3d`

## Fan-out pipelines

One reference can feed multiple operators simultaneously — they run in parallel:

```python
# workflow.json excerpt — one product photo → 4 FLUX Kontext branches
"edges": [
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_0", ...},
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_1", ...},
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_2", ...},
  {"from_node_id": "ref_product", ..., "to_node_id": "op_kontext_3", ...}
]
```

## Deploying to Spaces

A Workflow app is a standard Gradio app — deploy it to Hugging Face Spaces exactly like any other:

```
gradio deploy
```

On a Space, the canvas authenticates visitors via OAuth. The Space owner gets write access (can edit and save the workflow); visitors get a read-only view and can run the pipeline with their own HF token.

## API access

Every Workflow app exposes a Gradio REST API endpoint for each output (subject) node. The endpoint name is derived from the subject's label — for example, a subject labelled "Output Image" becomes `/output_image`. Use `client.view_api()` to see the exact names for your workflow:

```python
from gradio_client import Client

client = Client("your-username/my-workflow")
client.view_api()  # lists available endpoints and their parameters

result = client.predict("a sunset over mountains", api_name="/output_image")
```
