---
"gradio": patch
---

fix:Isolate cookie jars in `/proxy=` requests so a malicious upstream Space cannot leak cookies into proxied requests to a different `*.hf.space` (GHSA-2mr9-9r47-px2g)
