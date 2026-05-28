---
"@gradio/dataframe": patch
"@gradio/tabs": patch
"gradio": patch
---

fix:Fix browser freeze when a dataframe's value is set (e.g. via a tab select event), and only dispatch the tabs select event when the selected tab actually changes
