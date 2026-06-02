---
"gradio": patch
---

fix:Fix SSR mode failing to start (server render crashed with `TypeError: undefined is not a function`) by deduping Svelte to a single version. Multiple Svelte versions (5.47.1 / 5.48.0 / 5.56.0) were resolved into the SSR bundle, mixing the Svelte compiler and `svelte/server` runtime; a `pnpm.overrides` now pins Svelte to one version.
