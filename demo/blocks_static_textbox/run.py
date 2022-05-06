import gradio as gr

demo = gr.Blocks(css="""
body {
    font-family: monospace;
    background-color: navy;
    color: teal;
}
""")

with demo:
    gr.Textbox("Hello", css=gr.CSS(color="green", fontSize="2rem"))
    gr.Number(5, css=gr.CSS(border="solid 2px pink"))

if __name__ == "__main__":
    demo.launch()
