---
"gradio": patch
---

fix:Fix runtime language switching not re-translating component labels/values (only the footer updated). `@gradio/utils` resolved its own duplicate `svelte-i18n` instance whose locale store was never updated; the retranslation trigger now uses the live formatter store injected by `@gradio/core`.
