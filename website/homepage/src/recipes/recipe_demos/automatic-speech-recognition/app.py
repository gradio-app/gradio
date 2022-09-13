# URL: https://huggingface.co/spaces/gradio/automatic-speech-recognition
import gradio as gr

# automatically load the interface from a HF model 
demo = gr.Interface.load(
    "huggingface/facebook/wav2vec2-base-960h",
    title="Speech-to-text",
    inputs="mic",
    description="Let me try to guess what you're saying!",
)

# launch
demo.launch()
