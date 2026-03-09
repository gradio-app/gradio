import uvicorn
from fastapi import FastAPI

import gradio as gr

demo = gr.Interface(lambda x: f"Hi {x}", "textbox", "textbox")

app = FastAPI()

# Mount without explicit root_path — the ASGI scope root_path
# (set by uvicorn below) should be picked up automatically.
gr.mount_gradio_app(app, demo, path="/gradio")

# root_path="/myapp" tells the ASGI app it's behind a proxy at /myapp.
# Nginx strips the /myapp prefix before forwarding requests.
uvicorn.run(app, host="0.0.0.0", port=8000, root_path="/myapp")
