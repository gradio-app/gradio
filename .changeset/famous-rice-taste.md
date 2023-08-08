---
"@gradio/upload": patch
"gradio": patch
---

fix:Live audio streaming output

highlight:

#### Now supports loading streamed outputs

From the backend, streamed outputs are served from the `/stream/` endpoint instead of the `/file/` endpoint. Currently just used to serve streaming output. The JSON will have `is_stream`: `true`, instead of `is_file`: `true`.