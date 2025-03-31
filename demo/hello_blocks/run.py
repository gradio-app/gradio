import gradio as gr
from fastapi import FastAPI

def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

# demo.launch(server_port=8000, 
#             # root_path="/proxy"
#             )

app = FastAPI()

# demo.root_path = "/proxy/gradio/"
gr.mount_gradio_app(app, demo, path="/gradio")

# run app
import uvicorn
import threading
# uvicorn.run(app)

uvicorn_thread = threading.Thread(target=uvicorn.run, args=(app, ), kwargs={"port": 8000})
uvicorn_thread.start()

while True:
    import time
    time.sleep(1)