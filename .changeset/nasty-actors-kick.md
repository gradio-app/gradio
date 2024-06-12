---
"@gradio/statustracker": patch
"gradio": patch
---

fix:Ability to disable orange progress animation for generators by setting `show_progress='minimal'` or `show_progress='hidden'` in the event definition. This is a small visual breaking change but it aligns better with the expected behavior of the `show_progress` parameter. Also added `show_progress` to `gr.Interface` and `gr.ChatInterface`.
