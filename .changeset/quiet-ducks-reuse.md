---
"@gradio/workflowcanvas": minor
"gradio": minor
---

feat:gr.Workflow: "Run this node" now reuses up-to-date upstream results instead of re-executing the whole upstream subgraph (Shift+click forces a full re-run). Also keeps a node's completed state after a run, which makes the stale-outline indicator work beyond the first few seconds.
