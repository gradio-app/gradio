---
"gradio": patch
"gradio_client": patch
---

highlight:

#### Support custom components in gr.load

It is now possible to load a demo with a custom component with `gr.load`.

The custom component must be installed in your system and imported in your python session.

```python
import gradio as gr
import gradio_pdf

demo = gr.load("freddyaboulton/gradiopdf", src="spaces")

if __name__ == "__main__":
    demo.launch()
```

<img width="1284" alt="image" src="https://github.com/gradio-app/gradio/assets/41651716/9c3e846b-f3f2-4c1c-8cb6-53a6d186aaa0">

