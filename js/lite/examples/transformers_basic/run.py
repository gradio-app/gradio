import gradio as gr
from transformers_js_py import pipeline

pipe = await pipeline('sentiment-analysis')

async def process(text):
    return await pipe(text)

demo = gr.Interface(fn=process, inputs="text", outputs="json")

demo.launch()
