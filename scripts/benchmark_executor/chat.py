"""Streaming LLM app: a small instruct model, tokens streamed as they arrive.

The generate loop of a small model is dominated by Python overhead, so the
function's thread holds the GIL for much of each request.
"""

import os
import sys
import time
from threading import Thread

if os.environ.get("BENCH_MLLIBS"):
    # torch/diffusers/transformers installed outside the Gradio environment
    sys.path.append(os.environ["BENCH_MLLIBS"])

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TextIteratorStreamer,
)

import gradio as gr

MODEL = os.environ.get("BENCH_MODEL", "HuggingFaceTB/SmolLM2-135M-Instruct")
DEVICE = os.environ.get("BENCH_DEVICE", "mps")
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype=torch.float16).to(
    DEVICE
)
MAX_NEW = int(os.environ.get("BENCH_TOKENS", "96"))


def chat(message, seed):
    start = time.perf_counter()
    torch.manual_seed(int(seed))
    prompt = tokenizer.apply_chat_template(
        [{"role": "user", "content": message}],
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
    streamer = TextIteratorStreamer(
        tokenizer, skip_prompt=True, skip_special_tokens=True
    )
    thread = Thread(
        target=model.generate,
        kwargs=dict(
            **inputs,
            streamer=streamer,
            max_new_tokens=MAX_NEW,
            min_new_tokens=MAX_NEW,
            do_sample=True,
            temperature=0.7,
        ),
    )
    thread.start()
    text = ""
    for piece in streamer:
        text += piece
        yield text, round(time.perf_counter() - start, 4)
    thread.join()
    yield text, round(time.perf_counter() - start, 4)


demo = gr.Interface(
    fn=chat,
    inputs=[gr.Textbox(label="Message"), gr.Number(value=0, precision=0, label="Seed")],
    outputs=[gr.Textbox(label="Reply"), gr.Number(label="Function seconds")],
    title="Tiny chat",
    api_name="generate",
)

if __name__ == "__main__":
    demo.launch(server_port=int(os.environ["BENCH_PORT"]), inbrowser=False)
