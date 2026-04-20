---
"@gradio/dataframe": patch
"gradio": patch
---

fix:Dataframe: fix extreme rendering slowdown with `datatype="date"` (and any future dtype with asymmetric string casts) by firing `EditableCell`'s shim-blur only on edit teardown instead of every render. Also makes the hidden sizing-row computation faster by avoiding Date rendering for every entry.
