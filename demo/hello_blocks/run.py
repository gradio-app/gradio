import gradio as gr

class Test:
    pass

with gr.Blocks() as demo:
    test = gr.State(1)
    inc = lambda x: x + 1
    
    btn = gr.Button("Go")
    btn.click(fn=inc, inputs=test, outputs=test)

if __name__ == "__main__":
    demo.launch()
