---
"@gradio/paramviewer": patch
"website": patch
"gradio": patch
---

fix: publish the `Prism` global before its grammar files load, so the docs pages stop failing to hydrate with `ReferenceError: Prism is not defined`
