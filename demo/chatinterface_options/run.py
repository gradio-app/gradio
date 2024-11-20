import gradio as gr

example_code = """
Here's the code I generated:

```python
def greet(x):
    return f"Hello, {x}!"
```

Is this correct?
"""

def chat(message, history):
    if message == "Yes":
        return "Great!"
    elif message == "No, regenerate":
        return {
            "content": example_code,
            "options": [
                {"value": "Yes"}, {"label": "No", "value": "No, regenerate"}
                ]}
    return "Hello, world!"

gr.ChatInterface(chat).launch()
