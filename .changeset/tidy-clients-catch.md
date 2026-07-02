---
"@gradio/client": patch
---

fix:Make `Client.predict()` reject its returned promise on unknown endpoints so the error is catchable
