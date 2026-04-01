"""Demo showcasing @gr.cache() across different function types and modalities.

Demonstrates:
1. Basic caching (sync function, image input)
2. Prefix caching with scored match_fn + gr.CacheVar (generator, simulated KV cache)
3. Text-to-speech caching (different modality)
4. Data analysis caching with custom key function (DataFrame input)
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
# Example 2: Prefix caching — streaming chatbot with CacheVar
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
        return 0.0  # not a proper prefix
    # Count matching messages from the start
    match_len = 0
    for c, p in zip(curr_hist, prev_hist):
        if c == p:
            match_len += 1
        else:
            break
    return match_len / len(curr_hist)


@gr.cache(match_fn=chat_prefix_scorer)
def chat_respond(history, context: gr.CacheVar[str] = None):
    """Streaming chatbot with prefix caching via CacheVar.

    On a partial cache hit, `context` is restored from the best-matching entry,
    carrying forward the previous conversation context.
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

    # Save conversation context for future prefix matches
    context.set(response_text)

    # Stream the response character by character
    history.append({"role": "assistant", "content": ""})
    for i in range(len(response_text)):
        history[-1]["content"] = response_text[: i + 1]
        time.sleep(0.02)
        yield history


# ============================================================
# Example 3: Text-to-speech caching (different modality)
# ============================================================


@gr.cache
def text_to_speech(text, speed=1.0):
    """Simulate TTS by generating a sine wave from text.

    In a real app, this would call an expensive TTS API.
    Caching means the same text won't be re-synthesized.
    """
    time.sleep(2)  # Simulate TTS API latency

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
# Example 4: Data analysis caching (DataFrame input)
# ============================================================


@gr.cache(key=lambda kw: kw["operation"])
def analyze_data(data, operation):
    """Analyze uploaded CSV data. Cached by operation type.

    The `key` parameter means we only cache based on the operation,
    not the data — useful when the data is large but the operation
    is the expensive part.
    """
    time.sleep(1.5)

    if data is None or data.empty:
        return "No data provided."

    if operation == "Summary Statistics":
        return str(data.describe())
    elif operation == "Column Types":
        return str(data.dtypes)
    elif operation == "Missing Values":
        missing = data.isnull().sum()
        return str(missing[missing > 0]) if missing.any() else "No missing values!"
    elif operation == "Shape":
        return f"Rows: {data.shape[0]}, Columns: {data.shape[1]}"
    return "Unknown operation"


# ============================================================
# Example 5: Simulated KV caching for text generation
# ============================================================

# Simulated "vocabulary" and "model" for demonstration
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


@gr.cache(match_fn=kv_prefix_scorer)
def generate_with_kv_cache(
    prompt: str,
    max_tokens: int = 50,
    kv_cache: gr.CacheVar[dict] = None,
):
    """Simulate a transformer generating text with KV cache reuse.

    The kv_cache CacheVar stores the simulated key-value states.
    On a prefix match, the cached KV states are restored so only
    new tokens need to be "computed".
    """
    prev_kv = kv_cache.get({"keys": [], "values": [], "text_so_far": ""})

    reused_tokens = len(prev_kv["text_so_far"])
    new_chars = prompt[reused_tokens:]

    # Simulate "computing" KV states for new tokens
    keys = list(prev_kv["keys"])
    values = list(prev_kv["values"])
    for ch in new_chars:
        time.sleep(0.05)  # Simulate per-token computation
        keys.append(ord(ch) % 64)
        values.append((ord(ch) * 7) % 64)

    # Simulate generation using the full KV cache
    np.random.seed(sum(keys) % 10000)
    generated = []
    for _ in range(max_tokens):
        idx = np.random.randint(0, len(VOCAB))
        generated.append(VOCAB[idx])

    # Save updated KV cache
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

        # --- Tab 2: Streaming Chat with Prefix Caching ---
        with gr.Tab("2. Chat + Prefix Cache"):
            gr.Markdown(
                "### Scored `match_fn` + `gr.CacheVar` — generator\n"
                "Chat with the bot. The `match_fn` scores how much of "
                "the current history is a cached prefix. On a partial hit, "
                "the `gr.CacheVar` restores the previous conversation context.\n\n"
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

        # --- Tab 3: Text-to-Speech ---
        with gr.Tab("3. Text-to-Speech"):
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

        # --- Tab 4: Data Analysis ---
        with gr.Tab("4. DataFrame Analysis"):
            gr.Markdown(
                "### `@gr.cache(key=...)` — custom cache key\n"
                "Cache uses `key=lambda kw: kw['operation']` so only the "
                "operation type matters — not the data."
            )
            df_input = gr.Dataframe(
                headers=["name", "age", "score"],
                value=[
                    ["Alice", 30, 95],
                    ["Bob", 25, 87],
                    ["Charlie", 35, 92],
                ],
                interactive=True,
            )
            operation = gr.Dropdown(
                choices=[
                    "Summary Statistics",
                    "Column Types",
                    "Missing Values",
                    "Shape",
                ],
                value="Summary Statistics",
                label="Operation",
            )
            analysis_output = gr.Textbox(label="Result", lines=8)
            analyze_btn = gr.Button("Analyze")
            analyze_btn.click(
                fn=analyze_data,
                inputs=[df_input, operation],
                outputs=analysis_output,
            )

        # --- Tab 5: Simulated KV Caching ---
        with gr.Tab("5. KV Cache Simulation"):
            gr.Markdown(
                "### `match_fn` + `gr.CacheVar` — simulated transformer KV cache\n"
                "Type a prompt and generate. Then **extend** the prompt "
                "(e.g., add more words) — the KV cache from the prefix is "
                "reused, so only new tokens are 'computed'.\n\n"
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
