---
"@gradio/workflowcanvas": minor
"gradio": minor
---

feat: Gate `gr.Workflow` editing and local HF token access behind a write token. Locally, an edit link containing a per-process `write_token` is printed at launch (Jupyter-style); sessions without it — share links, tunnels, LAN visitors — get a read-only canvas, cannot save the workflow, and never receive the host's `huggingface_hub` token. On Spaces, write access requires signing in as the Space owner (or an org member with write access).
