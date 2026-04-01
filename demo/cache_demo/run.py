"""Demo showcasing @gr.cache() across different function types and modalities.

Demonstrates:
1. Basic caching (sync function, image input)
2. Semantic similarity caching without CacheVar (returns best match directly)
3. Prefix caching with scored score_fn + gr.CacheVar (generator, chat)
4. Text-to-speech caching (different modality)
5. Simulated transformer KV caching with gr.CacheVar
"""

import time

import numpy as np

import gradio as gr

# ============================================================
# Example 1: Basic caching — image classification (sync)
# ============================================================

IMAGENET_CLASSES = [
    "cat", "dog", "bird", "fish", "car", "plane", "ship", "truck",
]


@gr.cache
def classify_image(image):
    """Simulate an expensive image classification model."""
    time.sleep(2)  # Simulate model inference
    if image is None:
        return {}
    np.random.seed(int(image.mean()) % 100)
    scores = np.random.dirichlet(np.ones(len(IMAGENET_CLASSES)))
    return {cls: float(score) for cls, score in zip(IMAGENET_CLASSES, scores)}


# ============================================================
# Example 2: Semantic similarity — no CacheVar (returns best match)
# ============================================================


def text_similarity(curr, prev):
    """Simple word-overlap similarity between two prompts."""
    curr_words = set(curr["prompt"].lower().split())
    prev_words = set(prev["prompt"].lower().split())
    if not curr_words:
        return 0.0
    overlap = len(curr_words & prev_words) / len(curr_words | prev_words)
    return overlap if overlap > 0.5 else 0.0  # floor: ignore weak matches


@gr.cache(score_fn=text_similarity)
def summarize(prompt):
    """Simulate an expensive summarization model.

    Because there's no CacheVar, a partial match (score between 0 and 1)
    returns the best matching cached output directly — the function is
    NOT re-executed. This is ideal for "close enough" semantic caching.
    """
    time.sleep(2)
    # Fake summary based on word count
    words = prompt.split()
    return f"Summary ({len(words)} words): {' '.join(words[:5])}..."


# ============================================================
# Example 3: Prefix caching — streaming chatbot with CacheVar
# ============================================================

RESPONSES = {
    "hello": "Hi there! How can I help you today?",
    "what is gradio": "Gradio is an open-source Python library for building ML demos and web apps.",
    "what is caching": "Caching stores results of expensive operations so they can be reused instantly.",
    "tell me a joke": "Why do programmers prefer dark mode? Because light attracts bugs!",
}


def chat_prefix_scorer(curr, prev):
    """Score how much of the current history is covered by a cached prefix."""
    curr_hist = curr["history"]
    prev_hist = prev["history"]
    if not curr_hist or len(prev_hist) >= len(curr_hist):
        return 0.0
    match_len = 0
    for c, p in zip(curr_hist, prev_hist):
        if c == p:
            match_len += 1
        else:
            break
    return match_len / len(curr_hist)


@gr.cache(score_fn=chat_prefix_scorer)
def chat_respond(history, context: gr.CacheVar[str] = None):
    """Streaming chatbot with prefix caching via CacheVar.

    Because CacheVar is present, a partial match re-executes the function
    (with context restored) instead of returning cached output directly.
    """
    if not history:
        yield history
        return

    prev_context = context.get("")
    last_user_msg = history[-1]["content"].lower().strip()

    response_text = RESPONSES.get(
        last_user_msg,
        f"I heard you say: '{history[-1]['content']}'. That's interesting!",
    )

    if prev_context:
        response_text = f"[Resumed from cached context] {response_text}"

    context.set(response_text)

    history.append({"role": "assistant", "content": ""})
    for i in range(len(response_text)):
        history[-1]["content"] = response_text[: i + 1]
        time.sleep(0.02)
        yield history


# ============================================================
# Example 4: Text-to-speech caching (different modality)
# ============================================================


@gr.cache
def text_to_speech(text, speed=1.0):
    """Simulate TTS by generating a sine wave from text.

    In a real app, this would call an expensive TTS API.
    Caching means the same text won't be re-synthesized.
    """
    time.sleep(2)

    if not text:
        return None

    sample_rate = 24000
    duration = max(0.5, len(text) * 0.06 / speed)
    t = np.linspace(0, duration, int(sample_rate * duration), dtype=np.float32)

    audio = np.zeros_like(t)
    words = text.split()
    segment_len = len(t) // max(len(words), 1)

    for i, word in enumerate(words):
        freq = 200 + (sum(ord(c) for c in word) % 400)
        start = i * segment_len
        end = min(start + segment_len, len(t))
        audio[start:end] = 0.3 * np.sin(2 * np.pi * freq * t[start:end])

    fade = min(1000, len(audio) // 4)
    audio[:fade] *= np.linspace(0, 1, fade)
    audio[-fade:] *= np.linspace(1, 0, fade)

    return (sample_rate, (audio * 32767).astype(np.int16))


# ============================================================
# Example 5: Simulated KV caching for text generation
# ============================================================

VOCAB = list("abcdefghijklmnopqrstuvwxyz .,!?")


def kv_prefix_scorer(curr, prev):
    """Score = fraction of current prompt covered by cached prefix."""
    curr_text = curr["prompt"]
    prev_text = prev["prompt"]
    if not curr_text or len(prev_text) >= len(curr_text):
        return 0.0
    match_len = next(
        (i for i, (a, b) in enumerate(zip(curr_text, prev_text)) if a != b),
        min(len(curr_text), len(prev_text)),
    )
    return match_len / len(curr_text)


@gr.cache(score_fn=kv_prefix_scorer)
def generate_with_kv_cache(
    prompt: str,
    max_tokens: int = 50,
    kv_cache: gr.CacheVar[dict] = None,
):
    """Simulate a transformer generating text with KV cache reuse.

    Because CacheVar is present, partial matches re-execute the function
    with the KV cache restored — only new tokens need to be "computed".
    """
    prev_kv = kv_cache.get({"keys": [], "values": [], "text_so_far": ""})

    reused_tokens = len(prev_kv["text_so_far"])
    new_chars = prompt[reused_tokens:]

    keys = list(prev_kv["keys"])
    values = list(prev_kv["values"])
    for ch in new_chars:
        time.sleep(0.05)
        keys.append(ord(ch) % 64)
        values.append((ord(ch) * 7) % 64)

    np.random.seed(sum(keys) % 10000)
    generated = []
    for _ in range(max_tokens):
        idx = np.random.randint(0, len(VOCAB))
        generated.append(VOCAB[idx])

    kv_cache.set({"keys": keys, "values": values, "text_so_far": prompt})

    status = (
        f"Reused {reused_tokens} cached KV states, "
        f"computed {len(new_chars)} new tokens"
    )

    return prompt + "".join(generated), status


# ============================================================
# Build the demo
# ============================================================

with gr.Blocks(title="gr.cache() Demo") as demo:
    gr.Markdown(
        """
        # `@gr.cache()` Demo
        Each tab demonstrates caching with a different function type and modality.
        **Try submitting the same input twice** — the second call will be instant.
        """
    )

    with gr.Tabs():
        # --- Tab 1: Image Classification ---
        with gr.Tab("1. Image Classification"):
            gr.Markdown(
                "### Basic `@gr.cache` — sync function\n"
                "Upload an image to classify. Same image = instant cached result."
            )
            with gr.Row():
                img_input = gr.Image(type="numpy")
                label_output = gr.Label(num_top_classes=5)
            classify_btn = gr.Button("Classify")
            classify_btn.click(
                fn=classify_image,
                inputs=img_input,
                outputs=label_output,
            )

        # --- Tab 2: Semantic Similarity (no CacheVar) ---
        with gr.Tab("2. Semantic Similarity"):
            gr.Markdown(
                "### `score_fn` without `CacheVar` — returns best match\n"
                "Type a prompt to summarize. Then try a **similar** prompt "
                "(sharing >50% of words) — the cached output is returned "
                "directly without re-running the model.\n\n"
                "Try: **'the quick brown fox'** → then **'the quick brown dog'**"
            )
            sim_prompt = gr.Textbox(label="Prompt", value="the quick brown fox")
            sim_output = gr.Textbox(label="Summary")
            sim_btn = gr.Button("Summarize")
            sim_btn.click(
                fn=summarize,
                inputs=sim_prompt,
                outputs=sim_output,
            )

        # --- Tab 3: Streaming Chat with Prefix Caching ---
        with gr.Tab("3. Chat + Prefix Cache"):
            gr.Markdown(
                "### `score_fn` + `gr.CacheVar` — re-executes with state\n"
                "Chat with the bot. The `score_fn` scores prefix overlap. "
                "Because `CacheVar` is present, partial matches re-execute "
                "the function with the previous context restored.\n\n"
                "Try: **hello**, then **what is gradio**, then **tell me a joke**"
            )
            chatbot = gr.Chatbot()
            chat_input = gr.Textbox(
                placeholder="Type a message...", show_label=False
            )

            def user_message(msg, history):
                if history is None:
                    history = []
                history.append({"role": "user", "content": msg})
                return "", history

            chat_input.submit(
                fn=user_message,
                inputs=[chat_input, chatbot],
                outputs=[chat_input, chatbot],
            ).then(
                fn=chat_respond,
                inputs=chatbot,
                outputs=chatbot,
            )

        # --- Tab 4: Text-to-Speech ---
        with gr.Tab("4. Text-to-Speech"):
            gr.Markdown(
                "### Basic `@gr.cache` — different modality\n"
                "Type text to synthesize speech. Same text + speed = "
                "cached audio returned instantly."
            )
            tts_text = gr.Textbox(
                label="Text", value="Hello world, this is a caching demo"
            )
            tts_speed = gr.Slider(
                minimum=0.5, maximum=2.0, value=1.0, step=0.1, label="Speed"
            )
            tts_audio = gr.Audio(label="Output")
            tts_btn = gr.Button("Synthesize")
            tts_btn.click(
                fn=text_to_speech,
                inputs=[tts_text, tts_speed],
                outputs=tts_audio,
            )

        # --- Tab 5: Simulated KV Caching ---
        with gr.Tab("5. KV Cache Simulation"):
            gr.Markdown(
                "### `score_fn` + `gr.CacheVar` — simulated transformer KV cache\n"
                "Type a prompt and generate. Then **extend** the prompt — "
                "the KV cache from the prefix is reused, so only new tokens "
                "are 'computed'.\n\n"
                "Try: **'The quick brown'** → then **'The quick brown fox jumps'**"
            )
            kv_prompt = gr.Textbox(
                label="Prompt", value="The quick brown"
            )
            kv_max_tokens = gr.Slider(
                minimum=10, maximum=100, value=50, step=10, label="Max tokens"
            )
            kv_output = gr.Textbox(label="Generated text", lines=3)
            kv_status = gr.Textbox(label="Cache status")
            kv_btn = gr.Button("Generate")
            kv_btn.click(
                fn=generate_with_kv_cache,
                inputs=[kv_prompt, kv_max_tokens],
                outputs=[kv_output, kv_status],
            )

if __name__ == "__main__":
    demo.launch()
