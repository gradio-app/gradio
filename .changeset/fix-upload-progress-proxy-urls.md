---
"gradio": patch
"@gradio/core": patch
"@gradio/utils": patch
"@gradio/upload": patch
---

Fix frontend asset and API URLs when Gradio is served behind a same-host proxy with a different public protocol or port. Pages rendered by the Gradio server now resolve asset URLs against the browser's origin, while embedded apps and dev servers keep the backend's own origin.
