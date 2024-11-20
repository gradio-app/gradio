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
    if message == "Yes, that's correct.":
        return "Great!"
    else:
        return {
            "role": "assistant",
            "content": example_code,
            "options": [
                {"value": "Yes, that's correct.", "label": "Yes"},
                {"value": "No"}
                ]
            }

demo = gr.ChatInterface(
    chat,
    type="messages",
    examples=["Write a Python function that takes a string and returns a greeting."]
)

if __name__ == "__main__":
    demo.launch()
