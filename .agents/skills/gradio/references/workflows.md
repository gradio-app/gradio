# Building gr.Workflow pipelines programmatically

`gr.Workflow` is Gradio's node-based pipeline builder. Its graph lives in a `workflow.json` next to the app, so it can be written directly instead of dragged onto a canvas. This file is the contract for doing that correctly.

Full guide, including the canvas, the app view and deployment: https://www.gradio.app/guides/workflows

## When a workflow is the right shape

A workflow earns its place when **more than one model is in the graph**:

- **Comparison** — several models race the same input, so you can see them side by side.
- **Chaining** — one model's output becomes the next one's input.

One model with a lot of knobs is not a workflow. A graph with a single operator and eight reference nodes feeding its parameters is a `gr.Interface` drawn as a box-and-arrow diagram: it costs you the JSON and gives back nothing the `Interface` wouldn't. Reach for a workflow when the *topology* is the point.

## Shape 1: model comparison

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

Both subjects here belong to one connected component — they share `ref_prompt` — so this exposes **one** API endpoint, `/krea_output`, returning both images as a tuple. That is what you want for a comparison: one call, every candidate. See the [guide](https://www.gradio.app/guides/workflows) for how the name is derived.

## Shape 2: model chaining

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

## Choosing the models

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

## Writing a node

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

## Mistakes that fail silently

A malformed workflow file does not raise. `gr.Workflow` loads it, the app starts, and it simply exposes no endpoints — so these are worth checking by eye:

- **`schema_version` must be the string `"2"`.** The number `2` is not the string `"2"`, and anything else means the whole file is ignored.
- **`references`, `operators`, `subjects` and `edges` must all be present**, as arrays, even when empty.
- **Node ids must be unique across all three collections**, not just within one.
- **Every edge needs all four** of `from_node_id`, `from_port_id`, `to_node_id`, `to_port_id`.
- **An unrecognised `kind` is treated as `"space"`.** A typo doesn't error, it calls the wrong executor. (In particular, `"transform"` is a legacy spelling from an older schema — use `"space"`.)
- **Wrong port ids on a `kind: "model"` node** send the wrong keyword arguments rather than failing.

Edge `type` is advisory — nothing validates it server-side — so matching port types is on you.

## Checking your work

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
