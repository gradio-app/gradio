# This is a simple general-purpose chatbot built on top of Hyperbolic API. 
# Before running this, make sure you have exported your Hyperbolic API key as an environment variable:
# export HYPERBOLIC_API_KEY="your-hyperbolic-api-key"

import os
import gradio as gr
from openai import OpenAI

api_key = os.getenv("HYPERBOLIC_API_KEY")

client = OpenAI(
    base_url="https://api.hyperbolic.xyz/v1/",
    api_key=api_key,
)

def predict(message, history):
    history.append({"role": "user", "content": message})
    stream = client.chat.completions.create(messages=history, model="gpt-4o-mini", stream=True)
    chunks = []
    for chunk in stream:
        chunks.append(chunk.choices[0].delta.content or "")
        yield "".join(chunks)

demo = gr.ChatInterface(predict, type="messages")

if __name__ == "__main__":
    demo.launch()

