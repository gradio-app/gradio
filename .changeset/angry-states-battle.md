---
"@gradio/client": patch
"gradio": patch
---

fix:Ensure websocket polyfill doesn't load if there is already a `global.Webocket` property set
