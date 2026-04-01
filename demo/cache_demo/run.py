"""Demo showcasing @gr.cache() across different function types and modalities."""

import time

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
    # Fake classification based on image properties
    import numpy as np

    np.random.seed(int(image.mean()) % 100)
    scores = np.random.dirichlet(np.ones(len(IMAGENET_CLASSES)))
    return {cls: float(score) for cls, score in zip(IMAGENET_CLASSES, scores)}


# ============================================================
# Example 2: Prefix caching — streaming chatbot (generator)
# ============================================================

RESPONSES = {
    "hello": "Hi there! How can I help you today?",
    "what is gradio": "Gradio is an open-source Python library for building ML demos and web apps.",
    "what is caching": "Caching stores results of expensive operations so they can be reused instantly.",
    "tell me a joke": "Why do programmers prefer dark mode? Because light attracts bugs!",
}


def prefix_match(cached_kw, new_kw, cached_result):
    """Match if cached history is a prefix of new history."""
    old_hist = cached_kw["history"]
    new_hist = new_kw["history"]
    if (
        len(new_hist) > len(old_hist)
        and new_hist[: len(old_hist)] == old_hist
    ):
        return {**new_kw, "prev_response": cached_result}
    return None


@gr.cache(match_fn=prefix_match)
def chat_respond(history, prev_response=None):
    """Streaming chatbot with prefix caching.

    On a prefix cache hit, prev_response contains the last assistant message
    from the cached conversation, which could be used as context.
    """
    if not history:
        yield history
        return

    last_user_msg = history[-1]["content"].lower().strip()

    # Look up response (or use a default)
    response_text = RESPONSES.get(
        last_user_msg,
        f"I heard you say: '{history[-1]['content']}'. That's interesting!",
    )

    if prev_response:
        response_text = f"[Resumed from cache] {response_text}"

    # Stream the response character by character
    history.append({"role": "assistant", "content": ""})
    for i in range(len(response_text)):
        history[-1]["content"] = response_text[: i + 1]
        time.sleep(0.02)
        yield history


# ============================================================
# Example 3: Text-to-speech caching (async, different modality)
# ============================================================


@gr.cache
def text_to_speech(text, speed=1.0):
    """Simulate TTS by generating a sine wave from text.

    In a real app, this would call an expensive TTS API.
    Caching means the same text won't be re-synthesized.
    """
    import numpy as np

    time.sleep(2)  # Simulate TTS API latency

    if not text:
        return None

    sample_rate = 24000
    duration = max(0.5, len(text) * 0.06 / speed)
    t = np.linspace(0, duration, int(sample_rate * duration), dtype=np.float32)

    # Generate different frequencies for different words
    audio = np.zeros_like(t)
    words = text.split()
    segment_len = len(t) // max(len(words), 1)

    for i, word in enumerate(words):
        freq = 200 + (sum(ord(c) for c in word) % 400)
        start = i * segment_len
        end = min(start + segment_len, len(t))
        audio[start:end] = 0.3 * np.sin(2 * np.pi * freq * t[start:end])

    # Fade in/out
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
    time.sleep(1.5)  # Simulate computation

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
# Build the demo
# ============================================================

with gr.Blocks(title="gr.cache() Demo") as demo:
    gr.Markdown(
        """
        # @gr.cache() Demo
        Each tab demonstrates caching with a different function type and modality.
        **Try submitting the same input twice** — the second call will be instant.
        """
    )

    with gr.Tabs():
        # --- Tab 1: Image Classification ---
        with gr.Tab("Image Classification (sync)"):
            gr.Markdown(
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
        with gr.Tab("Chat with Prefix Cache (generator)"):
            gr.Markdown(
                "Chat with the bot. When you send a new message, the decorator's "
                "`match_fn` detects that your previous conversation is a cached prefix "
                "and passes the prior result to the function.\n\n"
                "Try: 'hello', then 'what is gradio', then 'tell me a joke'"
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
        with gr.Tab("Text-to-Speech (different modality)"):
            gr.Markdown(
                "Type text to synthesize speech. The same text at the same speed "
                "returns the cached audio instantly — no re-synthesis needed."
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
        with gr.Tab("Data Analysis (DataFrame + key fn)"):
            gr.Markdown(
                "Upload a CSV and pick an analysis. The cache uses `key=lambda kw: kw['operation']` "
                "so only the operation type matters for cache hits — handy when data is large."
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

if __name__ == "__main__":
    demo.launch()
