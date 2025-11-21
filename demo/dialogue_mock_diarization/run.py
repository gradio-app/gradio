import gradio as gr

speakers = [
    "Speaker 1",
    "Speaker 2",
]

def format_speaker(speaker, text):
    return f"{speaker}: {text}"

def mock_diarization(audio):
    return [
        {
            "speaker": "Speaker 1",
            "text": "Hello, how are you?",
        },
        {
            "speaker": "Speaker 2",
            "text": "I'm fine, thank you!",
        },
        {
            "speaker": "Speaker 1",
            "text": "What's your name?",
        },
        {
            "speaker": "Speaker 2",
            "text": "My name is John Doe.",
        },
        {
            "speaker": "Speaker 1",
            "text": "Nice to meet you!",
        },
        {
            "speaker": "Speaker 2",
            "text": "Nice to meet you!",
        },
    ]

demo = gr.Interface(
    fn=mock_diarization,
    inputs=[gr.Audio(sources=["microphone"])],
    outputs=[gr.Dialogue(speakers=speakers, tags=None, formatter=format_speaker)],
    title="Mock Speech Diarization",
    description="Mock speech diarization",
    api_name="predict"
)

if __name__ == "__main__":
    demo.launch()
