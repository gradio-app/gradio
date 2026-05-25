---
name: hf-gradio
description: Use Gradio applications via API. Use when the user asks for to generate a prediction from a Gradio app on Hugging Face spaces or public URL. For example, "Generate an image using black-forest-labs/FLUX.2-dev". 
---

## hf-gradio CLI Skill

The `hf-gradio` CLI `gradio` CLI includes `info` and `predict` commands for interacting with Gradio apps programmatically. 

## Step 1 - Verify installation

Verify that either `hf-gradio` or `gradio` are installed in the current virtual environment.

If the `hf` CLI app is installed. The `hf-gradio` extension can be installed via

```bash
hf extensions install gradio-app/hf-gradio
```

### Step 2 - Use `info` to discover endpoints and payload format

```bash
gradio info <space_id_or_url>
```

```bash
hf-gradio info <space_id_or_url>
```

```bash
hf gradio info <space_id_or_url>
```

Returns a JSON payload describing all endpoints, their parameters (with types and defaults), and return values.

```bash
gradio info gradio/calculator
#    {
#   "/predict": {
#     "parameters": [
#       {"name": "num1", "required": true, "default": null, "type": {"type": "number"}},
#       {"name": "operation", "required": true, "default": null, "type": {"enum": ["add", "subtract", "multiply", "divide"], "type": "string"}},
#       {"name": "num2", "required": true, "default": null, "type": {"type": "number"}}
#     ],
#     "returns": [{"name": "output", "type": {"type": "number"}}],
#     "description": ""
#   }
# }
```

File-type parameters show `"type": "filepath"` with instructions to include `"meta": {"_type": "gradio.FileData"}` — this signals the file will be uploaded to the remote server.

## Step 3 - Use `predict` to generate the prediction

```bash
gradio predict <space_id_or_url> <endpoint> <json_payload>
```

```bash
hf-gradio predict <space_id_or_url> <endpoint> <json_payload>
```

```bash
hf gradio predict <space_id_or_url> <endpoint> <json_payload>
```

Returns a JSON object with named output keys.

```bash
# Simple numeric prediction
gradio predict gradio/calculator /predict '{"num1": 5, "operation": "multiply", "num2": 3}'
# {"output": 15}

# Image generation
gradio predict black-forest-labs/FLUX.2-dev /infer '{"prompt": "A majestic dragon"}'
# {"Result": "/tmp/gradio/.../image.webp", "Seed": 1117868604}

# File upload (must include meta key)
gradio predict gradio/image_mod /predict '{"image": {"path": "/path/to/image.png", "meta": {"_type": "gradio.FileData"}}}'
# {"output": "/tmp/gradio/.../output.png"}
```

Both commands accept `--token` for accessing private Spaces.