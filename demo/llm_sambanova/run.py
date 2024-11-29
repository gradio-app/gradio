# This is a simple general-purpose chatbot built on top of SambaNova API. 
# Before running this, make sure you have exported your SambaNova API key as an environment variable:
# export SAMBANOVA_API_KEY="your-sambanova-api-key"

import os
import gradio as gr
from openai import OpenAI

api_key = os.getenv("SAMBANOVA_API_KEY")

client = OpenAI(
    base_url="https://api.sambanova.ai/v1/",
    api_key=api_key,
)

def predict(message, history):
    history.append({"role": "user", "content": message})
    stream = client.chat.completions.create(messages=history, model="Meta-Llama-3.1-70B-Instruct-8k", stream=True)
    chunks = []
    for chunk in stream:
        chunks.append(chunk.choices[0].delta.content or "")
        yield "".join(chunks)

demo = gr.ChatInterface(predict, type="messages")

if __name__ == "__main__":
    demo.launch()

