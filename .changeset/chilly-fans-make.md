---
"gradio": minor
"gradio_client": minor
---

highlight:

#### Enable streaming audio in python client

The `gradio_client` now supports streaming file outputs 🌊

No new syntax! Connect to a gradio demo that supports streaming file outputs and call `predict` or `submit` as you normally would.

```python
import gradio_client as grc
client = grc.Client("gradio/stream_audio_out")

# Get the entire generated audio as a local file
client.predict("/Users/freddy/Pictures/bark_demo.mp4", api_name="/predict")

job = client.submit("/Users/freddy/Pictures/bark_demo.mp4", api_name="/predict")

# Get the entire generated audio as a local file
job.result()

# Each individual chunk
job.outputs()
```


