"""Demo: KV caching with gr.cache() and a transformers model.

Uses gr.cache() as an injectable parameter to manually store and retrieve
transformer KV caches, reusing computation for shared prompt prefixes.
"""

import time

import gradio as gr
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL_NAME = "HuggingFaceTB/SmolLM2-135M-Instruct"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME, torch_dtype=torch.float32, device_map="cpu"
)


def _find_longest_prefix(prompt: str, c: gr.Cache) -> tuple[str | None, int]:
    best_key = None
    best_len = 0
    for cached_key in c.keys():
        if prompt.startswith(cached_key) and best_len < len(cached_key) < len(prompt):
            best_key = cached_key
            best_len = len(cached_key)
    return best_key, best_len


def generate(prompt, max_new_tokens, c=gr.Cache()):
    start = time.time()

    best_prefix, prefix_len = _find_longest_prefix(prompt, c)
    if best_prefix:
        past = c.get(best_prefix)["kv"]  # type: ignore
        input_ids = tokenizer.encode(prompt, return_tensors="pt")
        prefix_token_len = tokenizer.encode(best_prefix, return_tensors="pt").shape[1]
        new_input_ids = input_ids[:, prefix_token_len:]
    else:
        past = None
        new_input_ids = tokenizer.encode(prompt, return_tensors="pt")
        prefix_token_len = 0

    with torch.no_grad():
        outputs = model(new_input_ids, past_key_values=past, use_cache=True)
    full_past = outputs.past_key_values

    gen_input = outputs.logits[:, -1:, :].argmax(dim=-1)
    generated_tokens = [gen_input.item()]
    current_past = full_past

    for _ in range(int(max_new_tokens) - 1):
        with torch.no_grad():
            outputs = model(gen_input, past_key_values=current_past, use_cache=True)
        current_past = outputs.past_key_values
        gen_input = outputs.logits[:, -1:, :].argmax(dim=-1)
        generated_tokens.append(gen_input.item())
        if gen_input.item() == tokenizer.eos_token_id:
            break

    c.set(prompt, kv=full_past)

    elapsed = time.time() - start
    generated_text = tokenizer.decode(generated_tokens, skip_special_tokens=True)
    total_tokens = tokenizer.encode(prompt, return_tensors="pt").shape[1]
    status = (
        f"Reused {prefix_token_len}/{total_tokens} prompt tokens from KV cache | "
        f"Generated {len(generated_tokens)} tokens in {elapsed:.2f}s"
    )
    return prompt + generated_text, status


with gr.Blocks(title="KV Cache Demo") as demo:
    gr.Markdown(
        "# KV Cache Demo with `gr.cache()`\n"
        "Uses `gr.cache()` as an injectable parameter to store transformer KV caches. "
        "When you extend a prompt, the cached KV states from the prefix are reused.\n\n"
        "Try: **'The quick brown'** → then **'The quick brown fox'**"
    )
    prompt = gr.Textbox(label="Prompt", value="The quick brown")
    max_tokens = gr.Slider(10, 100, value=30, step=5, label="Max new tokens")
    output = gr.Textbox(label="Generated text", lines=4)
    status = gr.Textbox(label="Cache status")
    gr.Button("Generate").click(generate, [prompt, max_tokens], [output, status])

if __name__ == "__main__":
    demo.launch()
