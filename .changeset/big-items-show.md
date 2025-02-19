---
"gradio": patch
"gradio_client": patch
---

fix:Fix `gr.load()` for `gr.ChatInterface(save_history=True)` and any Gradio app where the upstream app includes a `gr.State` as input
