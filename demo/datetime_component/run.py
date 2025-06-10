import gradio as gr

demo = gr.Interface(fn=lambda x: x, inputs=gr.DateTime(), outputs=gr.DateTime())

if __name__ == "__main__":
    demo.launch()
