import gradio as gr

demo = gr.load("gradio/test-gr-load", src="spaces")

if __name__ == "__main__":
    demo.launch()
