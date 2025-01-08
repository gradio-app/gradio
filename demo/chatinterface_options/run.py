import gradio as gr
import random

example_code = """
Here's an example Python lambda function:

lambda x: x + {}

Is this correct?
"""

def chat(message, history):
    if message == "Yes, that's correct.":
        return "Great!"
    else:
        return {
            "role": "assistant",
            "content": example_code.format(random.randint(1, 100)),
            "options": [
                {"value": "Yes, that's correct.", "label": "Yes"},
                {"value": "No"}
                ]
            }

demo = gr.ChatInterface(
    chat,
    type="messages",
    examples=["Write an example Python lambda function."]
)

if __name__ == "__main__":
    demo.launch()
