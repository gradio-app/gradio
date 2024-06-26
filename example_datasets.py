import os

from transformers import pipeline

import gradio as gr

os.environ["HF_AUTH_TOKEN"] = os.environ["HF_AUTH_TOKEN_PERSONAL"]



pipe = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-sms-spam-detection")

demo = gr.Interface.from_pipeline(pipe)

demo.sync_with_hub(
    repo_id="davidberenstein1957/bert-tiny-finetuned-sms-spam-detection",
    every=1
)
demo.launch()
