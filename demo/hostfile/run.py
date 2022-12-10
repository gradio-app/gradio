import gradio as gr
import os
import shutil

here = os.path.dirname(os.path.abspath(__file__))

def upload(name, img_file: str):
    shutil.copy(img_file, os.path.join(here, name))


def delete(file):
    os.remove(file)
    
with gr.Blocks() as demo:
    img_name = gr.Textbox(label="Image Name")
    upload_img = gr.Image()
    upload_btn = gr.Button("Upload")
    upload_btn.click(fn=upload, inputs=[img_name, upload_img])

    host_browser = gr.HostFile(here)
    delete_btn = gr.Button("Delete")
    delete_btn.click(fn=delete, inputs=[host_browser])

if __name__ == "__main__":
    demo.launch()