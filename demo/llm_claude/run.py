# This is a simple 20 questions-style game built on top of the Anthropic API.
# Before running this, make sure you have exported your Anthropic API key as an environment variable:
# export ANTHROPIC_API_KEY="your-anthropic-api-key"

import anthropic
import gradio as gr

client = anthropic.Anthropic()

def predict(message, history):
    keys_to_keep = ["role", "content"]
    history = [{k: d[k] for k in keys_to_keep if k in d} for d in history]
    history.append({"role": "user", "content": message})
    if len(history) > 20:
        history.append({"role": "user", "content": "DONE"})
    output = client.messages.create(
        messages=history,  # type: ignore
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        system="You are guessing an object that the user is thinking of. You can ask 10 yes/no questions. Keep asking questions until the user says DONE"
    )
    return {
        "role": "assistant",
        "content": output.content[0].text,  # type: ignore
        "options": [{"value": "Yes"}, {"value": "No"}]
    }

placeholder = """
<center><h1>10 Questions</h1><br>Think of a person, place, or thing. I'll ask you 10 yes/no questions to try and guess it.
</center>
"""

demo = gr.ChatInterface(
    predict,
    examples=["Start!"],
    chatbot=gr.Chatbot(placeholder=placeholder),
    type="messages"
)

if __name__ == "__main__":
    demo.launch()
