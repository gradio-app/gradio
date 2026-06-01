---
"gradio": patch
---

fix:Fix SSRF in `Image`/`Gallery` SVG postprocessing and `Audio` streaming postprocessing by routing user-influenced URL fetches through `safehttpx`
