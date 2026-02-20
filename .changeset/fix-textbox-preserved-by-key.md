---
"@gradio/core": patch
"gradio": patch
---

fix:Textbox `preserved_by_key` not persisting props across re-renders in `gr.render`

The `rerender` method in `init.svelte.ts` was not implementing the `preserved_by_key` logic, causing all component props to be reset to their constructor defaults on every re-render, even when `preserved_by_key` was specified. Additionally, `update_state` was not syncing prop changes back to the node tree when a component was mounted, so preserved values would be stale.
