import gradio as gr
import os

# save your HF API token from https:/hf.co/settings/tokens as an env variable to avoid rate limiting
hf_token = os.getenv("HF_TOKEN")

# automatically load the interface from a HF model
# you can remove the token parameter if you don't care about rate limiting.
demo = gr.load(
    "huggingface/openai/whisper-large-v3",
    title="Speech-to-text",
    inputs=gr.Audio(sources=["microphone"], type="filepath", label="Input"),
    description="Let me try to guess what you're saying!",
    token=hf_token,
)

demo.launch()
