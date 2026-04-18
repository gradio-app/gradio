---
"@gradio/dataframe": patch
"gradio": patch
---

fix:Dataframe: fix extreme rendering slowdown when using `datatype="date"` by sampling rows for column sizing instead of scanning all rows
