---
"gradio": patch
---

fix:Fix path traversal in `gr.FileExplorer.preprocess` by validating selected paths with `_safe_join` (consistent with `ls()`), rejecting absolute/`..` paths that escape `root_dir`
