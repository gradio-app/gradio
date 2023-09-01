---
"gradio": minor
---

highlight:Introduce decorator syntax for event listeners

#### Added the ability to attach event listeners via decorators

e.g.

```python
with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")

    @greet_btn.click(inputs=name, outputs=output)
    def greet(name):
        return "Hello " + name + "!"
```
