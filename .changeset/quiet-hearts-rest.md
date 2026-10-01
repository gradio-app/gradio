---
"gradio_client": patch
---

fix:Stop the heartbeat of a `Client` garbage collected without `close()`, and on an error response instead of retrying in a loop
