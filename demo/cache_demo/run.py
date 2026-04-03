"""Demo showcasing @gr.cache() with every function type."""

import asyncio
import tempfile
import time
import wave

import numpy as np

import gradio as gr

CLASSES = ["cat", "dog", "bird", "fish", "car", "plane", "ship", "truck"]


def classify_image(image):
    time.sleep(2)
    if image is None:
        return {}
    np.random.seed(int(image.mean()) % 100)
    scores = np.random.dirichlet(np.ones(len(CLASSES)))
    return {cls: float(s) for cls, s in zip(CLASSES, scores)}


TRANSLATIONS = {
    "hello": "hola",
    "goodbye": "adiós",
    "thank you": "gracias",
    "good morning": "buenos días",
    "how are you": "¿cómo estás?",
}


@gr.cache
async def translate(text, target_language):
    await asyncio.sleep(2)
    if not text:
        return ""
    key = text.lower().strip()
    if target_language == "Spanish":
        return TRANSLATIONS.get(key, f"[translated to Spanish] {text}")
    elif target_language == "French":
        return f"[translated to French] {text}"
    return text


RESPONSES = {
    "hello": "Hi there! How can I help you today?",
    "what is gradio": "Gradio is an open-source Python library for building ML demos.",
    "what is caching": "Caching stores expensive results so they can be reused instantly.",
    "tell me a joke": "Why do programmers prefer dark mode? Because light attracts bugs!",
}


def _message_plain_text(message):
    content = message["content"]
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and part.get("type") == "text":
                parts.append(part.get("text", ""))
        return "".join(parts)
    return str(content)


@gr.cache
def chat_respond(history):
    if not history:
        yield history
        return
    user_text = _message_plain_text(history[-1])
    last_msg = user_text.lower().strip()
    response = RESPONSES.get(last_msg, f"You said: '{user_text}'")
    history.append({"role": "assistant", "content": ""})
    for i in range(len(response)):
        history[-1]["content"] = response[: i + 1]
        time.sleep(0.02)
        yield history


def _make_wav_bytes(samples: np.ndarray, sample_rate: int = 24000) -> str:
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
    if not text:
        return
    sample_rate = 24000
    for word in text.split():
        time.sleep(0.5)
        duration = max(0.2, len(word) * 0.08 / speed)
        t = np.linspace(0, duration, int(sample_rate * duration), dtype=np.float32)
        freq = 200 + (sum(ord(c) for c in word) % 300)
        chunk = 0.3 * np.sin(2 * np.pi * freq * t)
        fade = min(500, len(chunk) // 4)
        chunk[:fade] *= np.linspace(0, 1, fade)
        chunk[-fade:] *= np.linspace(1, 0, fade)
        yield _make_wav_bytes(chunk, sample_rate)


@gr.cache
async def async_summarize(text):
    if not text:
        yield ""
        return
    words = text.split()
    summary = "Summary: " + " ".join(words[: max(3, len(words) // 3)]) + "..."
    result = ""
    for char in summary:
        await asyncio.sleep(0.03)
        result += char
        yield result


with gr.Blocks(title="gr.cache() Demo") as demo:
    gr.Markdown(
        "# `@gr.cache()` Demo\n"
        "Each tab shows a different function type. "
        "**Submit the same input twice** — the second call replays from cache."
    )

    with gr.Tabs():
        with gr.Tab("Sync Function"):
            gr.Markdown("Simulates image classification with a 2s delay.")
            with gr.Row():
                img_in = gr.Image(type="numpy")
                label_out = gr.Label(num_top_classes=5)
            gr.Button("Classify").click(classify_image, img_in, label_out)

        with gr.Tab("Async Function"):
            gr.Markdown("Simulates an async translation API with a 2s delay.")
            trans_text = gr.Textbox(label="Text", value="hello")
            trans_lang = gr.Dropdown(
                choices=["Spanish", "French"], value="Spanish", label="Target"
            )
            trans_out = gr.Textbox(label="Translation")
            gr.Button("Translate").click(
                translate, [trans_text, trans_lang], trans_out
            )

        with gr.Tab("Generator — Text"):
            gr.Markdown("Streams a chatbot response char by char. All yields are replayed on cache hit.")
            chatbot = gr.Chatbot()
            chat_in = gr.Textbox(placeholder="Type a message...", show_label=False)

            def user_msg(msg, history):
                history = history or []
                history.append({"role": "user", "content": msg})
                return "", history

            chat_in.submit(
                user_msg, [chat_in, chatbot], [chat_in, chatbot]
            ).then(chat_respond, chatbot, chatbot)

        with gr.Tab("Generator — Streaming Audio"):
            gr.Markdown("Simulates streaming TTS. Each word is a separate audio chunk, all replayed on hit.")
            audio_text = gr.Textbox(label="Text", value="Hello world this is cached")
            audio_speed = gr.Slider(0.5, 2.0, value=1.0, step=0.1, label="Speed")
            audio_out = gr.Audio(label="Output", streaming=True, autoplay=True)
            gr.Button("Synthesize").click(
                stream_audio, [audio_text, audio_speed], audio_out
            )

        with gr.Tab("Async Generator"):
            gr.Markdown("Simulates async streaming summarization. All yields replayed on hit.")
            summ_in = gr.Textbox(
                label="Text to summarize",
                value="The quick brown fox jumps over the lazy dog and runs through the forest",
                lines=3,
            )
            summ_out = gr.Textbox(label="Summary", lines=2)
            gr.Button("Summarize").click(async_summarize, summ_in, summ_out)

if __name__ == "__main__":
    demo.launch()
