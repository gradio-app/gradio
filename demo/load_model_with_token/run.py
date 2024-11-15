import gradio as gr

demo = gr.load("google/vit-base-patch16-224", src="models", accept_token=True)

if __name__ == "__main__":
    demo.launch()
