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
)

stt_demo = gr.load(
    "huggingface/facebook/wav2vec2-base-960h",
    title=None,
    inputs="mic",
    description="Let me try to guess what you're saying!",
)

demo = gr.TabbedInterface([tts_demo, stt_demo], ["Text-to-speech", "Speech-to-text"])

if __name__ == "__main__":
    demo.launch()
