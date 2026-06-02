# This is a simple general-purpose chatbot built on top of the MiniMax API.
# Before running this, make sure you have exported your MiniMax API key as an environment variable:
# export MINIMAX_API_KEY="your-minimax-api-key"

import os
import gradio as gr
from openai import OpenAI

api_key = os.getenv("MINIMAX_API_KEY")

client = OpenAI(
    base_url="https://api.minimax.io/v1",
    api_key=api_key,
)

def predict(message, history):
    history.append({"role": "user", "content": message})
    stream = client.chat.completions.create(messages=history, model="MiniMax-M3", stream=True)
    chunks = []
    for chunk in stream:
        chunks.append(chunk.choices[0].delta.content or "")
        yield "".join(chunks)

demo = gr.ChatInterface(predict, api_name="chat")

if __name__ == "__main__":
    demo.launch()
