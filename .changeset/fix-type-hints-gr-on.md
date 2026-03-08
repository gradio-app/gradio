---
"gradio": patch
---

fix:Simplify `EventListenerCallable` type to `Callable[..., Dependency]` so that type checkers correctly accept event triggers like `btn.click` and `tab.select` in `gr.on()` and `@gr.render()`
