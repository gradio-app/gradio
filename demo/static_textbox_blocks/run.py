import gradio as gr

demo = gr.Blocks()

with demo:
    gr.Textbox("Hello")
    gr.Number(5)

if __name__ == "__main__":
    demo.launch()
