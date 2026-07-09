---
"gradio": patch
"@gradio/core": patch
"@gradio/utils": patch
"@gradio/upload": patch
---

Fix frontend asset and API URLs when Gradio is served behind a same-host proxy with a different public protocol or port, and preserve FastAPI `root_path` values passed through `App.create_app()`.
