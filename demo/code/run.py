import gradio as gr


def code(code):
    print(code)
    return {"lang": "python", "code": code["code"]}


with gr.Blocks() as demo:
    code_in = gr.Code(label="Input")
    code_out = gr.Code(label="Ouput")
    btn = gr.Button("Run")

    btn.click(code, inputs=code_in, outputs=code_out)

if __name__ == "__main__":
    demo.launch()
