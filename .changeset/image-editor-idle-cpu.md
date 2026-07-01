---
"@gradio/imageeditor": patch
"gradio": patch
---

fix:Fix `gr.ImageEditor` high CPU usage when idle by sleeping the render loop when nothing is changing
