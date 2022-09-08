import gradio as gr
import time

def count(n):
    for i in range(int(n)):
        time.sleep(0.5)
        yield i

def show(n):
    return str(list(range(int(n))))

with gr.Blocks() as demo:
    with gr.Column():
        num = gr.Number(value=10)
        with gr.Row():
            count_btn = gr.Button("Count")
            list_btn = gr.Button("List")
    with gr.Column():
        out = gr.Textbox()
    
    count_btn.click(count, num, out)
    list_btn.click(show, num, out)
    
demo.queue()

if __name__ == "__main__":
    demo.launch()
