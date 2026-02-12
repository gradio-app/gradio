import gradio as gr

tts_examples = [
    "I love learning machine learning",
    "How do you do?",
]

tts_demo = gr.load(
    "huggingface/facebook/fastspeech2-en-ljspeech",
    title=None,
    examples=tts_examples,
    description="Give me something to say!",
    cache_examples=False
)

stt_demo = gr.load(
    "huggingface/facebook/wav2vec2-base-960h",
    title=None,
    inputs=gr.Microphone(type="filepath"),
    description="Let me try to guess what you're saying!",
    cache_examples=False
)

demo = gr.TabbedInterface([tts_demo, stt_demo], ["Text-to-speech", "Speech-to-text"])

if __name__ == "__main__":
    demo.launch()
