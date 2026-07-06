---
"gradio": patch
---

fix:Security: serve `/gradio_api/file=<url>` via an SSRF-safe streaming proxy instead of an open redirect
