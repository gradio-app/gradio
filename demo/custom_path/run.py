from fastapi import FastAPI
import gradio as gr

CUSTOM_PATH = "/gradio"

app = FastAPI()


@app.get("/")
def read_main():
    return {"message": "This is your main app"}


io = gr.Interface(lambda x: "Hello, " + x + "!", "textbox", "textbox")
gradio_app = gr.routes.App.create_app(io)
app = gr.mount_gradio_app(app, gradio_app, server_name="localhost", port="8000", path="/gradio")


# Run this from the terminal as you would normally start a FastAPI app: `uvicorn run:app` and navigate to http://localhost:8000/gradio in your browser.
# Note that if you run uvicorn by setting the --host and --port flags, the values you set must match the values passed to
# mount_gradio_app
