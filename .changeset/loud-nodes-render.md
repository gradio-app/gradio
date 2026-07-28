---
"@self/app": patch
"gradio": patch
---

fix:Fix SSR mode failing on every render (`Cannot find module 'postcss'`) in installed builds, and serve without SSR on the expected port when the Node server can't start
