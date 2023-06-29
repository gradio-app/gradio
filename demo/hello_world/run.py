import gradio as gr
import time
import asyncio

def normal(x):
    gr.Info("step 1")
    time.sleep(1)
    gr.Warning("step 2")
    time.sleep(1)
    gr.Warning("done")
    return "step done"

def generator(x):
    # gr.Info("step 1")
    yield "step 1"
    time.sleep(1)
    # gr.Warning("step 2")
    yield "step 2"
    time.sleep(1)
    # gr.Warning("done")
    return "step done"

async def asyncfn(x):
    gr.Info("step 1")
    await asyncio.sleep(3)
    gr.Warning("step 2")
    await asyncio.sleep(2)
    gr.Warning("done")
    return "step done"

async def asyncgen(x):
    gr.Info("step 1")
    yield "step 1"
    await asyncio.sleep(3)
    gr.Warning("step 2")
    yield "step 2"
    await asyncio.sleep(2)
    gr.Warning("done")


with gr.Blocks() as demo:
    text = gr.Textbox()
    text2 = gr.Textbox()
    with gr.Row():
        normal_btn = gr.Button("normal")
        generator_btn = gr.Button("generator")
        async_btn = gr.Button("async")
        asyncgen_btn = gr.Button("asyncgen")

    normal_btn.click(normal, text, text2)
    generator_btn.click(generator, text, text2)
    async_btn.click(asyncfn, text, text2)
    asyncgen_btn.click(asyncgen, text, text2)


demo.queue().launch()