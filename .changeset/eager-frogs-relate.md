---
"gradio": patch
---

Fix `gradio cc dev`, `gradio cc build`, and `gradio cc install` to respect a custom `FRONTEND_DIR` set on the component class, instead of assuming the frontend code lives in the `frontend` directory.
