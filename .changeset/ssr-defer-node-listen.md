---
"gradio": patch
---

fix:Defer Node front proxy startup until Python is ready in SSR mode

The Node front proxy (introduced in #13366) opened the user-facing port
before the Python backend was listening. External orchestrators such as
HF Spaces probe the port to detect readiness and routed traffic into a
window where every request returned a 502. Node is now started after
Python (and any static workers) are up.
