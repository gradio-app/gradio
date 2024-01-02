import gradio as gr
import asyncio

async def greet(name):
    import time
    await asyncio.sleep(5)
    return "Hello " + name + "!"

async def greet_2(name):
    return await greet(name)

with gr.Blocks() as demo:
    text = gr.Textbox()
    with gr.Row():
        btn = gr.Button("Greet")
        out_text = gr.Textbox()
        btn.click(greet, text, out_text)
    with gr.Row():
        btn_2 = gr.Button("Greet")
        out_text_2 = gr.Textbox()
        btn_2.click(greet_2, text, out_text_2)
    with gr.Row():
        btn_3 = gr.Button("Greet")
        out_text_3 = gr.Textbox()
        btn_3.click(greet, text, out_text_3)
    


if __name__ == "__main__":
    demo.launch()   