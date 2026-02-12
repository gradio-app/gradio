import uvicorn
from fastapi import FastAPI

import gradio as gr

demo = gr.Interface(lambda x: f"Hi {x}", "textbox", "textbox")

app = FastAPI()

gr.mount_gradio_app(app, demo, path="/mount")

uvicorn.run(app, host="0.0.0.0", port=8000)
