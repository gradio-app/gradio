"""Demo showcasing @gr.cache() with every function type.

Demonstrates:
1. Sync function (image classification)
2. Async function (text translation)
3. Generator — text streaming (chatbot)
4. Generator — media streaming (audio synthesis)
5. Async generator (async text streaming)
"""

import asyncio
import tempfile
import time
import wave

import numpy as np

import gradio as gr

# ============================================================
# 1. Sync function — image classification
# ============================================================

CLASSES = ["cat", "dog", "bird", "fish", "car", "plane", "ship", "truck"]


@gr.cache
def classify_image(image):
    """Simulate expensive image classification."""
    time.sleep(2)
    if image is None:
        return {}
    np.random.seed(int(image.mean()) % 100)
    scores = np.random.dirichlet(np.ones(len(CLASSES)))
    return {cls: float(s) for cls, s in zip(CLASSES, scores)}


# ============================================================
# 2. Async function — text translation
# ============================================================

TRANSLATIONS = {
    "hello": "hola",
    "goodbye": "adiós",
    "thank you": "gracias",
    "good morning": "buenos días",
    "how are you": "¿cómo estás?",
}


@gr.cache
async def translate(text, target_language):
    """Simulate async translation API call."""
    await asyncio.sleep(2)
    if not text:
        return ""
    key = text.lower().strip()
    if target_language == "Spanish":
        return TRANSLATIONS.get(key, f"[translated to Spanish] {text}")
    elif target_language == "French":
        return f"[translated to French] {text}"
    return text


# ============================================================
# 3. Generator — text streaming (chatbot)
# ============================================================

RESPONSES = {
    "hello": "Hi there! How can I help you today?",
    "what is gradio": "Gradio is an open-source Python library for building ML demos.",
    "what is caching": "Caching stores expensive results so they can be reused instantly.",
    "tell me a joke": "Why do programmers prefer dark mode? Because light attracts bugs!",
}


@gr.cache
def chat_respond(history):
    """Streaming chatbot. All yields are cached and replayed on cache hit."""
    if not history:
        yield history
        return

    last_msg = history[-1]["content"].lower().strip()
    response = RESPONSES.get(last_msg, f"You said: '{history[-1]['content']}'")

    history.append({"role": "assistant", "content": ""})
    for i in range(len(response)):
        history[-1]["content"] = response[: i + 1]
        time.sleep(0.02)
        yield history


# ============================================================
# 4. Generator — media streaming (audio chunks)
# ============================================================


def _make_wav_bytes(samples: np.ndarray, sample_rate: int = 24000) -> bytes:
    """Convert float32 samples to WAV bytes."""
    pcm = (samples * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        with wave.open(f.name, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(sample_rate)
            wf.writeframes(pcm.tobytes())
        return f.name


@gr.cache
def stream_audio(text, speed=1.0):
    """Simulate streaming TTS that yields audio chunks.

    Each yield is a WAV file chunk. On cache hit, all chunks are replayed
    so the streaming audio output reconstructs correctly.
    """
    if not text:
        return

    sample_rate = 24000
    words = text.split()

    for i, word in enumerate(words):
        time.sleep(0.5)  # simulate per-word TTS latency
        duration = max(0.2, len(word) * 0.08 / speed)
        t = np.linspace(0, duration, int(sample_rate * duration), dtype=np.float32)
        freq = 200 + (sum(ord(c) for c in word) % 300)
        chunk = 0.3 * np.sin(2 * np.pi * freq * t)
        # Fade in/out each chunk
        fade = min(500, len(chunk) // 4)
        chunk[:fade] *= np.linspace(0, 1, fade)
        chunk[-fade:] *= np.linspace(1, 0, fade)
        yield _make_wav_bytes(chunk, sample_rate)


# ============================================================
# 5. Async generator — async text streaming
# ============================================================


@gr.cache
async def async_summarize(text):
    """Simulate async streaming summarization."""
    if not text:
        yield ""
        return

    words = text.split()
    summary_words = words[: max(3, len(words) // 3)]
    summary = "Summary: " + " ".join(summary_words) + "..."

    result = ""
    for char in summary:
        await asyncio.sleep(0.03)
        result += char
        yield result


# ============================================================
# Build the demo
# ============================================================

with gr.Blocks(title="gr.cache() Demo") as demo:
    gr.Markdown(
        """
        # `@gr.cache()` Demo
        Each tab shows a different function type. **Submit the same input twice** —
        the second call replays from cache.
        """
    )

    with gr.Tabs():
        # --- 1. Sync ---
        with gr.Tab("1. Sync Function"):
            gr.Markdown(
                "### `@gr.cache` on a regular function\n"
                "Simulates image classification with a 2s delay. "
                "Same image = instant cached result."
            )
            with gr.Row():
                img_in = gr.Image(type="numpy")
                label_out = gr.Label(num_top_classes=5)
            gr.Button("Classify").click(classify_image, img_in, label_out)

        # --- 2. Async ---
        with gr.Tab("2. Async Function"):
            gr.Markdown(
                "### `@gr.cache` on an async function\n"
                "Simulates an async translation API with a 2s delay. "
                "Same text + language = instant.\n\n"
                "Try: **hello**, **goodbye**, **thank you**"
            )
            trans_text = gr.Textbox(label="Text", value="hello")
            trans_lang = gr.Dropdown(
                choices=["Spanish", "French"], value="Spanish", label="Target"
            )
            trans_out = gr.Textbox(label="Translation")
            gr.Button("Translate").click(
                translate, [trans_text, trans_lang], trans_out
            )

        # --- 3. Generator (text) ---
        with gr.Tab("3. Generator — Text"):
            gr.Markdown(
                "### `@gr.cache` on a generator (streaming text)\n"
                "Streams a chatbot response character by character. "
                "On cache hit, all yields are replayed.\n\n"
                "Try: **hello**, then **tell me a joke**"
            )
            chatbot = gr.Chatbot()
            chat_in = gr.Textbox(placeholder="Type a message...", show_label=False)

            def user_msg(msg, history):
                history = history or []
                history.append({"role": "user", "content": msg})
                return "", history

            chat_in.submit(
                user_msg, [chat_in, chatbot], [chat_in, chatbot]
            ).then(
                chat_respond, chatbot, chatbot
            )

        # --- 4. Generator (media) ---
        with gr.Tab("4. Generator — Streaming Audio"):
            gr.Markdown(
                "### `@gr.cache` on a generator yielding audio chunks\n"
                "Simulates streaming TTS — each word is a separate audio chunk. "
                "On cache hit, all chunks are replayed so the full audio "
                "reconstructs correctly.\n\n"
                "Try: **Hello world this is cached**"
            )
            audio_text = gr.Textbox(
                label="Text", value="Hello world this is cached"
            )
            audio_speed = gr.Slider(0.5, 2.0, value=1.0, step=0.1, label="Speed")
            audio_out = gr.Audio(label="Output", streaming=True, autoplay=True)
            gr.Button("Synthesize").click(
                stream_audio, [audio_text, audio_speed], audio_out
            )

        # --- 5. Async generator ---
        with gr.Tab("5. Async Generator"):
            gr.Markdown(
                "### `@gr.cache` on an async generator\n"
                "Simulates async streaming summarization. "
                "On cache hit, the full streamed text is replayed."
            )
            summ_in = gr.Textbox(
                label="Text to summarize",
                value="The quick brown fox jumps over the lazy dog and runs through the forest",
                lines=3,
            )
            summ_out = gr.Textbox(label="Summary", lines=2)
            gr.Button("Summarize").click(async_summarize, summ_in, summ_out)

if __name__ == "__main__":
    demo.launch()
