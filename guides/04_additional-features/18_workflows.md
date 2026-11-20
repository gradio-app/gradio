# gr.Workflow

`gr.Workflow` is a visual, node-based AI pipeline builder built into Gradio. It lets you chain together Hugging Face Spaces, models, datasets, and your own Python functions on a drag-and-drop canvas:

<img width="1901" alt="image" src="https://github.com/user-attachments/assets/a77bf9a8-c264-4037-80e1-2b37c5e529d4" />


## Quickstart

The simplest possible Workflow app:

```python
import gradio as gr

gr.Workflow().launch()
```

Open the app, drag Spaces, models, and datasets from the sidebar onto the canvas, connect their ports, and hit **Run**. As you add, remove, or change nodes and edges, a `workflow.json` file will automatically be created next to the Python script that created the Workflow. Pass `graph=` if you want to save it somewhere else. You can also use a coding agent to write or edit this file, allowing you to create workflows programmatically.

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

Pass a `graph=` path to load a saved workflow topology. The canvas reads from the file on each page load and autosaves back to it when you add, remove, or change nodes and edges.

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

Node `data` may be omitted, and so may geometry. Include `x` and `y` on every node to control how the graph is arranged when someone opens it for the first time; leave them out and the canvas auto-arranges it. Either way the arrangement is only a starting point: each visitor is free to drag and resize cards, that arrangement is saved in their own browser rather than in the file, and `workflow.json` is never rewritten with it. `height` is measured from the rendered card. `width` is the default every viewer starts from — anyone can resize a card locally, and a writer's resize becomes the new default the next time an edit is saved.

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

## Building workflows programmatically

`workflow.json` is a plain file, so a coding agent can write one directly instead of dragging nodes onto the canvas. This section is the contract for doing that correctly.

### When a workflow is the right shape

A workflow earns its place when **more than one model is in the graph**:

- **Comparison** — several models race the same input, so you can see them side by side.
- **Chaining** — one model's output becomes the next one's input.

One model with a lot of knobs is not a workflow. A graph with a single operator and eight reference nodes feeding its parameters is a `gr.Interface` drawn as a box-and-arrow diagram: it costs you the JSON and gives back nothing the `Interface` wouldn't. Reach for a workflow when the *topology* is the point.

### Shape 1: model comparison

One reference fans out to N operators, each with its own subject. This is the whole graph for "which of these two text-to-image models do I prefer":

```json
{
  "schema_version": "2",
  "name": "Krea-2-Turbo vs FLUX.1-dev",
  "references": [
    {
      "id": "ref_prompt", "label": "Prompt", "role": "reference", "asset_type": "text",
      "inputs":  [{"id": "in",  "label": "Text", "type": "text"}],
      "outputs": [{"id": "out", "label": "Text", "type": "text"}],
      "data": {"out": "A cinematic photo of a red fox in a misty forest at dawn"}
    }
  ],
  "operators": [
    {
      "id": "op_krea", "label": "Krea 2 Turbo", "role": "operator", "kind": "model",
      "model_id": "krea/Krea-2-Turbo", "pipeline_tag": "text-to-image", "endpoint": "text_to_image",
      "inputs":  [{"id": "prompt", "label": "Prompt", "type": "text", "required": true}],
      "outputs": [{"id": "out_0", "label": "Image", "type": "image", "output_index": 0}]
    },
    {
      "id": "op_flux", "label": "FLUX.1 dev", "role": "operator", "kind": "model",
      "model_id": "black-forest-labs/FLUX.1-dev", "pipeline_tag": "text-to-image", "endpoint": "text_to_image",
      "inputs":  [{"id": "prompt", "label": "Prompt", "type": "text", "required": true}],
      "outputs": [{"id": "out_0", "label": "Image", "type": "image", "output_index": 0}]
    }
  ],
  "subjects": [
    {
      "id": "sub_krea", "label": "Krea Output", "role": "subject", "asset_type": "image",
      "inputs":  [{"id": "in",  "label": "Image", "type": "image"}],
      "outputs": [{"id": "out", "label": "Image", "type": "image"}]
    },
    {
      "id": "sub_flux", "label": "FLUX Output", "role": "subject", "asset_type": "image",
      "inputs":  [{"id": "in",  "label": "Image", "type": "image"}],
      "outputs": [{"id": "out", "label": "Image", "type": "image"}]
    }
  ],
  "edges": [
    {"id": "e1", "from_node_id": "ref_prompt", "from_port_id": "out",   "to_node_id": "op_krea",  "to_port_id": "prompt", "type": "text"},
    {"id": "e2", "from_node_id": "ref_prompt", "from_port_id": "out",   "to_node_id": "op_flux",  "to_port_id": "prompt", "type": "text"},
    {"id": "e3", "from_node_id": "op_krea",    "from_port_id": "out_0", "to_node_id": "sub_krea", "to_port_id": "in",     "type": "image"},
    {"id": "e4", "from_node_id": "op_flux",    "from_port_id": "out_0", "to_node_id": "sub_flux", "to_port_id": "in",     "type": "image"}
  ]
}
```

Adding a third model means one more operator, one more subject, and two more edges. Nothing else changes.

Both subjects here belong to one connected component — they share `ref_prompt` — so this exposes **one** API endpoint, `/krea_output`, returning both images as a tuple. That is what you want for a comparison: one call, every candidate. See [API access](#api-access) for how the name is derived.

### Shape 2: model chaining

One operator's output port connects straight to the next operator's input port. The types have to line up: the first model's output type and the second model's input type must match.

```json
{
  "schema_version": "2",
  "name": "Transcribe and Summarize",
  "references": [
    {
      "id": "ref_audio", "label": "Recording", "role": "reference", "asset_type": "audio",
      "inputs":  [{"id": "in",  "label": "Audio", "type": "audio"}],
      "outputs": [{"id": "out", "label": "Audio", "type": "audio"}]
    }
  ],
  "operators": [
    {
      "id": "op_transcribe", "label": "Whisper", "role": "operator", "kind": "model",
      "model_id": "openai/whisper-large-v3-turbo",
      "pipeline_tag": "automatic-speech-recognition", "endpoint": "automatic_speech_recognition",
      "inputs":  [{"id": "audio", "label": "Audio", "type": "audio", "required": true}],
      "outputs": [{"id": "out_0", "label": "Transcript", "type": "text", "output_index": 0}]
    },
    {
      "id": "op_summarize", "label": "BART Summarizer", "role": "operator", "kind": "model",
      "model_id": "facebook/bart-large-cnn",
      "pipeline_tag": "summarization", "endpoint": "summarization",
      "inputs":  [{"id": "text", "label": "Text", "type": "text", "required": true}],
      "outputs": [{"id": "out_0", "label": "Summary", "type": "text", "output_index": 0}]
    }
  ],
  "subjects": [
    {
      "id": "sub_summary", "label": "Summary", "role": "subject", "asset_type": "text",
      "inputs":  [{"id": "in",  "label": "Text", "type": "text"}],
      "outputs": [{"id": "out", "label": "Text", "type": "text"}]
    }
  ],
  "edges": [
    {"id": "e1", "from_node_id": "ref_audio",     "from_port_id": "out",   "to_node_id": "op_transcribe", "to_port_id": "audio", "type": "audio"},
    {"id": "e2", "from_node_id": "op_transcribe", "from_port_id": "out_0", "to_node_id": "op_summarize",  "to_port_id": "text",  "type": "text"},
    {"id": "e3", "from_node_id": "op_summarize",  "from_port_id": "out_0", "to_node_id": "sub_summary",   "to_port_id": "in",    "type": "text"}
  ]
}
```

To show the intermediate value — the raw transcript, here — put a reference node between the two operators and wire through it. **A reference node with an incoming edge stops being an input**: it relays the value it receives instead of asking the caller for one, and it disappears from the endpoint's parameters. That is how you surface a mid-pipeline value on the canvas and in the app without turning it into something the caller must supply.

### Choosing the models

For `kind: "model"` nodes, the model's `pipeline_tag` on the Hub decides which `endpoint` to use:

| `pipeline_tag` | `endpoint` |
|---|---|
| `text-generation`, `text2text-generation`, `conversational` | `text_generation` |
| `image-text-to-text` | `chat_completion` |
| `text-to-image` | `text_to_image` |
| `text-to-speech`, `text-to-audio` | `text_to_speech` |
| `text-to-video` | `text_to_video` |
| `image-to-image` | `image_to_image` |
| `image-to-video`, `image-text-to-video` | `image_to_video` |
| `automatic-speech-recognition` | `automatic_speech_recognition` |
| `summarization` · `translation` · `question-answering` | same name with underscores |
| `fill-mask` · `text-classification` · `token-classification` · `zero-shot-classification` · `sentence-similarity` · `feature-extraction` | same name with underscores |
| `image-classification` · `object-detection` · `image-segmentation` · `audio-classification` | same name with underscores |

So the search for candidates is a Hub search filtered by the tag you need. Gradio also bundles a small list of models and Spaces that are checked regularly, in `gradio/_workflow_curated_snapshot.json` — useful for picking ids that are known to work, though it records only ids and tasks, not ports or endpoints.

### Writing a node

Each operator `kind` needs different fields, and each has one rule that catches people out:

| `kind` | Required | The rule that bites |
|---|---|---|
| `"model"` | `model_id`, `endpoint` | With an `endpoint`, arguments are sent as **keyword arguments keyed by port id** — so the ids must be the endpoint's own names (`prompt`, not `in_0`). |
| `"space"` | `space_id`, `endpoint` | Arguments are sent **positionally, in `inputs` order** — the port order must match the Space's parameter order. Always set `endpoint` explicitly. |
| `"dataset"` | `dataset_id` | The row offset comes from an input port named exactly `row_index`; output ports are matched to dataset columns by `label`, not by id. |
| `"fn"` | `fn` | Must exactly match a key passed to `bind=`. |

For `kind: "model"`, these are the endpoints and the port ids each one expects:

| `endpoint` | Input ports | Output port |
|---|---|---|
| `text_to_image` | `prompt` (text) | `out_0` (image) |
| `text_to_speech` | `text` (text) | `out_0` (audio) |
| `text_to_video` | `prompt` (text) | `out_0` (video) |
| `image_to_image` | `image` (image), `prompt` (text) | `out_0` (image) |
| `image_to_video` | `image` (image), `prompt` (text) | `out_0` (video) |
| `text_generation` | `prompt` (text) | `out_0` (markdown) |
| `chat_completion` | `image` (image), `text` (text) | `out_0` (markdown) |
| `summarization` | `text` (text) | `out_0` (text) |
| `translation` | `text` (text), `src_lang` (text), `tgt_lang` (text) | `out_0` (text) |
| `question_answering` | `question` (text), `context` (text) | `out_0` (text) |
| `automatic_speech_recognition` | `audio` (audio) | `out_0` (text) |
| `zero_shot_classification` | `text` (text), `candidate_labels` (text) | `out_0` (json) |
| `sentence_similarity` | `sentence` (text), `other_sentences` (text) | `out_0` (json) |
| `fill_mask` | `text` (text) | `out_0` (json) |
| `text_classification` | `text` (text) | `out_0` (json) |
| `token_classification` | `text` (text) | `out_0` (json) |
| `feature_extraction` | `text` (text) | `out_0` (json) |
| `image_classification` | `image` (image) | `out_0` (json) |
| `object_detection` | `image` (image) | `out_0` (json) |
| `image_segmentation` | `image` (image) | `out_0` (json) |
| `audio_classification` | `audio` (audio) | `out_0` (json) |

`markdown` and `text` ports connect to each other interchangeably.

Space ports are a different story: they come from the Space's own API signature and must be **read, not guessed**. Ask the Space:

```bash
gradio info black-forest-labs/FLUX.1-schnell
```

or fetch `https://<space-host>/gradio_api/info` directly. Then map its parameters to ports in order — `in_0`, `in_1`, … for parameters and `out_0`, `out_1`, … for return values, with `output_index` set to the return value's position, and `required: true` on any parameter that has no default.

`model_id` and `space_id` must both be a full `owner/name` — a bare name like `gpt2` is rejected, as is anything that looks like a URL.

### Mistakes that fail silently

A malformed workflow file does not raise. `gr.Workflow` loads it, the app starts, and it simply exposes no endpoints — so these are worth checking by eye:

- **`schema_version` must be the string `"2"`.** The number `2` is not the string `"2"`, and anything else means the whole file is ignored.
- **`references`, `operators`, `subjects` and `edges` must all be present**, as arrays, even when empty.
- **Node ids must be unique across all three collections**, not just within one.
- **Every edge needs all four** of `from_node_id`, `from_port_id`, `to_node_id`, `to_port_id`.
- **An unrecognised `kind` is treated as `"space"`.** A typo doesn't error, it calls the wrong executor. (In particular, `"transform"` is a legacy spelling from an older schema — use `"space"`.)
- **Wrong port ids on a `kind: "model"` node** send the wrong keyword arguments rather than failing.

Edge `type` is advisory — nothing validates it server-side — so matching port types is on you.

### Checking your work

Three steps, each catching a different class of mistake.

**Does it parse?** `None` means the file is dead on arrival and the app will start with no endpoints:

```python
from gradio.workflow_api import WorkflowGraph

assert WorkflowGraph.from_json(open("workflow.json").read()) is not None
```

**Does it expose what you expect?** Launch the app and ask it:

```python
from gradio_client import Client

client = Client("http://127.0.0.1:7860/")
client.view_api()
```

An empty endpoint list means the graph has no subjects. The wrong parameters mean an edge is wired to the wrong node — the parameters are exactly the reference nodes with no incoming edge, named `in_0`, `in_1`, … in the order they appear in `references`.

**Then actually run it.** A graph that parses and advertises the right endpoint can still be calling a Space with its arguments in the wrong order.

## Deploying to Spaces

A Workflow app is a standard Gradio app — deploy it to Hugging Face Spaces exactly like any other, by uploading the code to a Space, or by simply running in your terminal:

```
gradio deploy
```

Enable [OAuth](https://huggingface.co/docs/hub/en/spaces-oauth) in your Space's README, with the two scopes a workflow asks for. Gradio warns at launch if either is missing:

```yaml
hf_oauth: true
hf_oauth_scopes:
  - inference-api # run nodes on the signed-in user's own inference quota
  - write-repos # save the workflow back to this Space
```

The owning user, or an organization member with `write` or `admin` access, can edit and save the workflow. Other visitors get a read-only canvas and can run the pipeline using their OAuth identity or a Hugging Face access token. Without OAuth enabled, the Space cannot identify its owner, so the deployed workflow remains run-only.

Locally, every change on the canvas is saved to `workflow.json` as you make it. On a Space, edits stay in your browser until you save them: **Save to Space** commits `workflow.json` to the Space's repo, and the Space restarts to pick it up. **Save as copy** commits it to a new Space under your own account instead, so a visitor can save their own version of someone else's workflow.

## gr.Workflow on ZeroGPU

Two different things in a Workflow app can spend GPU time, and each is set up its own way:

- **Space, model, and dataset nodes** call out to someone else's hardware. The workflow app itself stays on CPU; what matters is *whose* quota each call is billed to.
- **`kind: "fn"` nodes** run inside the workflow app. If one of them does GPU work, the workflow app is itself a ZeroGPU Space, and `@spaces.GPU` applies exactly as in any other Gradio app, plus a few canvas-specific details covered below.

### Error reference

Where each ZeroGPU failure comes from, by the text it reports:

| Message | Cause | Fix |
|---|---|---|
| `ZeroGPU illegal duration` — "The requested GPU duration (270s) is larger than the maximum allowed" | The *multiplied* duration exceeds the caller's maximum. The number quoted is yours × the hardware factor, so it won't match your source. | [Sizing `duration`](#sizing-duration-on-bound-functions) |
| `ZeroGPU quota exceeded` — "Space app has reached its GPU limit." | The request carried no visitor token, so it was billed to the Space's shared anonymous allowance. | [Whose quota pays](#whose-quota-pays) — enable `hf_oauth` |
| `ZeroGPU quota exceeded` — "You have exceeded your ZeroGPU runs limit." / "…quota (Ns requested vs. Ms left)" | The signed-in caller is out of quota. | [Whose quota pays](#whose-quota-pays) |
| `ZeroGPU pending credits exceeded` — "You have too many ZeroGPU credits allocated to running tasks." | Too much duration booked at once. Chained nodes each hold their own slot, so an over-sized `duration` multiplies across the chain. | [Sizing `duration`](#sizing-duration-on-bound-functions) |
| `ZeroGPU duration` — "GPU task is exceeding its requested duration and might be aborted" | `duration` is too small for the work the node actually does. | [Sizing `duration`](#sizing-duration-on-bound-functions) |
| `ZeroGPU client warning` — "GPU device not used" | The decorated function never touched the GPU — usually the model was moved to `cuda` somewhere the decorator can't see. | [Load models at module scope](#load-models-at-module-scope) |
| `RuntimeError: CUDA has been initialized before importing the` `spaces` `package.` | An import that initializes CUDA ran before `import spaces`. | [Load models at module scope](#load-models-at-module-scope) |
| A node renders a path or `{...}` as text where an image was expected | The function returned a `PIL.Image` or a bare path instead of a file dict, or the output port isn't typed `image`. | [Media in and out](#media-in-and-out-of-a-bound-function) |

`ZeroGPU queue timeout` — "No GPU was available after 60s" is contention, not a configuration problem; retry.

### Whose quota pays

Most Space and model nodes run on [ZeroGPU](https://huggingface.co/docs/hub/spaces-zerogpu) or a Hugging Face inference provider, so every run of a workflow spends somebody's GPU quota. Which account pays depends on the token each node resolves, in this order: a token entered on the node itself, otherwise the visitor's OAuth token. When you run the workflow locally, it uses your own saved Hugging Face token. Visitors who aren't signed in fall back to the anonymous tier, which is a couple of minutes of GPU time a day, so they'll hit quota errors quickly.

This makes `hf_oauth: true` load-bearing for two separate reasons. Without it the Space cannot identify its owner, so nobody can edit the workflow — *and* every visitor runs anonymously on a shared IP-based allowance, so the pipeline starts failing with quota errors almost immediately. Enable it even for a workflow you never intend to let anyone edit:

```yaml
# README.md of your Space
hf_oauth: true
hf_oauth_scopes:
  - inference-api
  - write-repos
```

The workflow app itself does not need GPU hardware. It orchestrates calls to other Spaces, so CPU basic is the right choice unless a function you passed to `bind=` does its own GPU work.

### Sizing `duration` on bound functions

The number you write in `@spaces.GPU(duration=N)` is **not** the number checked against the caller's quota. ZeroGPU multiplies it by a factor that depends on the GPU the Space landed on:

| Hardware | Duration factor |
|---|---|
| NVIDIA H200 | 1.0 |
| NVIDIA RTX PRO 6000 Blackwell | 1.5 |

So `@spaces.GPU(duration=180)` on Blackwell hardware books **270s**, and that 270s is what the quota gate compares against the caller's allowance — which is why a function can be rejected as exceeding the maximum allowed duration while the number in your source is comfortably under it. The error message quotes the multiplied figure, not yours.

Two things change the arithmetic:

- Passing `size="xlarge"` skips the multiplier entirely, so `duration=180` books exactly 180s. Don't read that as cheaper: when an xlarge call is rejected for quota, ZeroGPU reports the figure doubled, so an xlarge slot appears to count twice over against the allowance.
- Omitting `duration` requests 60s before multiplication, not an unlimited slot.

**Size `duration` per node, never per pipeline.** Each `fn` node is a separate call that books and releases its own GPU slot, so a chain of three 60s nodes is three 60s bookings rather than one 180s one. There is no arithmetic in the workflow executor that sums durations across chained nodes — each node is accounted for on its own.

### Load models at module scope

Load weights once at import and move them to `cuda` there, not inside the decorated function:

```python
import spaces  # must be imported before anything initializes CUDA
import torch
from diffusers import AutoPipelineForText2Image

pipe = AutoPipelineForText2Image.from_pretrained(
    "stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16"
).to("cuda")

@spaces.GPU(duration=60)
def illustrate(prompt: str) -> dict:
    return save(pipe(prompt=prompt, num_inference_steps=2).images[0])
```

On ZeroGPU the `spaces` package intercepts that module-scope `.to("cuda")`, packs the weights, and transfers them when a GPU is actually allocated — so it costs no GPU time at import. Moving the model inside the function instead repeats the transfer on every call, which is charged against the `duration` you booked.

`import spaces` must come before any import that initializes CUDA, or it raises at startup. On ZeroGPU, `spaces` forces `torch.cuda.is_available()` to return `True`, so the usual `cuda` / `mps` / `cpu` ternary resolves to `cuda` there and still lets the same file run locally.

### Media in and out of a bound function

A bound function's arguments and return value are passed through **as-is** — none of the file coercion that Space and model nodes get runs for `fn` nodes. Three consequences:

**Media ports must be declared explicitly in `workflow.json`.** Signature inference gives every bound function `text`/`number`/`boolean` ports and a single output, so an image-producing node has to be typed by hand:

```json
{
  "id": "op_illustrate", "label": "Illustrate", "role": "operator",
  "kind": "fn", "fn": "illustrate",
  "inputs":  [{"id": "prompt", "label": "Prompt", "type": "text", "required": true}],
  "outputs": [{"id": "out_0", "label": "Illustration", "type": "image"}]
}
```

**Media arguments arrive as dicts, not paths.** An image uploaded in the current tab arrives as `{"path": ..., "url": ...}`, but one chained from an upstream node arrives as `{"url": "/gradio_api/file=<percent-encoded path>"}` with no `path` key at all. Normalize both before opening the file:

```python
from urllib.parse import unquote

def local_path(value):
    if isinstance(value, str):
        return value
    if path := value.get("path"):
        return path
    url = value.get("url") or ""
    return unquote(url.split("/gradio_api/file=", 1)[-1])
```

**Media returns must be a file dict.** Returning a `PIL.Image` fails to serialize, and returning a bare path renders as a string. The canvas renders media only from a dict carrying a `url`:

```python
from gradio_client import utils as client_utils

return {
    "path": path,
    "url": f"/gradio_api/file={client_utils.encode_file_path(path)}",
    "is_file": True,
}
```

`launch()` already adds the system temp directory to `allowed_paths`, so writing to `tempfile.gettempdir()` works with no extra configuration. A file written anywhere else — a `./outputs` folder, say — needs its directory passed explicitly, or the URL 403s:

```python
gr.Workflow(graph="workflow.json", bind=[illustrate]).launch(allowed_paths=["outputs"])
```

### Reference app

A complete chained-GPU workflow: an uploaded photo is captioned by one GPU function node, and the caption it produces is the prompt for a second. It shows module-scope loading, per-node `duration` sizing, explicitly typed media ports, and both media conversions above in one file.

$demo_workflow_zerogpu_chain

The source is [on the Space](https://huggingface.co/spaces/gradio/workflow_zerogpu_chain/tree/main).

## App view

Every Workflow app also renders as an ordinary Gradio app. Each independent pipeline is laid out like a `gr.Interface` — its unconnected inputs and a **Run** button on the left, its outputs on the right — and workflows with more than one pipeline get one tab each. Reference nodes that already hold a value show up as the starting value of their input component.

An **App / Workflow** toggle in the corner switches between the two views. Visitors with write access land on the canvas; everyone else lands on the app and can open the canvas read-only from the toggle. Append `?ui=app` or `?ui=canvas` to the URL to force a view, which is useful when sharing a link to a deployed workflow.

The app view is built from the same components that back the workflow's API endpoints, so it stays in sync: saving an edit on the canvas rebuilds both.

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
