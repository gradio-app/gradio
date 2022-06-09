import gradio as gr

str = """Hello friends
hello friends

Hello friends

"""


with gr.Blocks() as demo:
    txt = gr.Textbox(label="Input", lines=5)
    txt_2 = gr.Textbox(label="Output-Interactive")
    txt_3 = gr.Textbox(str, label="Output", interactive=False)
    btn = gr.Button("Submit")
    btn.click(lambda a: a, inputs=[txt], outputs=[txt_2])

if __name__ == "__main__":
    demo.launch()
