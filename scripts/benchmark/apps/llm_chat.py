"""Realistic LLM chat app — uses HuggingFace Inference API with gpt-oss-20b."""

import os

from huggingface_hub import InferenceClient

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)

client = InferenceClient("openai/gpt-oss-20b", provider="groq")


def chat(message, history):
    response = ""
    for token in client.chat_completion(
        messages=[{"role": "user", "content": message}],
        max_tokens=256,
        stream=True,
    ):
        delta = token.choices[0].delta.content or ""
        response += delta
        yield response


demo = gr.ChatInterface(fn=chat, concurrency_limit=concurrency_limit)

if __name__ == "__main__":
    demo.launch()
