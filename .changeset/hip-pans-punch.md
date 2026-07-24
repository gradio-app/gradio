---
"@gradio/client": patch
---

Fix private Space connections and error handling in the JS client: accept the deprecated `hf_token` option as an alias for `token`, raise clear errors when a Space is private or missing, tolerate malformed `/info` payloads instead of crashing with "Cannot read properties of undefined (reading 'map')", and make `predict()` reject with real `Error` objects instead of plain status objects that surface as unhandled promise rejections.
