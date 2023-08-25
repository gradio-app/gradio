---
"@gradio/highlightedtext": patch
"gradio": patch
"website": patch
---

feat:Minor bug fix sweep

- Our use of __exit__ was catching errors and corrupting the traceback of any component that failed to instantiate (try running blocks_kitchen_sink off main for an example). Now the __exit__ exits immediately if there's been an exception, so the original exception can be printed cleanly
- HighlightedText was rendering weird, cleaned it up
