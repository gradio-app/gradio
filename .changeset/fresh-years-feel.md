---
"@gradio/file": patch
"@gradio/multimodaltextbox": patch
"@gradio/upload": patch
"gradio": patch
---

fix:Bugfix: Add a `file_count` parameter to `gr.MultimodalTextbox`. Multiple files cab be uploaded by setting `file_count="multiple"`. Default is `"single"` to preserve the previous behavior.
