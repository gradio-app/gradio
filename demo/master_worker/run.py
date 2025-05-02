import gradio as gr
import sys
import time

def greet(name, prog = gr.Progress()):
    print("processing", name)
    prog(0, desc="Starting...")
    time.sleep(2)
    prog(0.5, desc="Halfway there...")
    time.sleep(2)
    return "Hello " + name + "!"

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    name.submit(fn=greet, inputs=name, outputs=output, api_name="greet")        

role = "worker" if "-w" in sys.argv else "hybrid"

if __name__ == "__main__":
    demo.launch(role=role, master_url="http://localhost:7860/", app_key="test123")
