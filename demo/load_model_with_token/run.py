import gradio as gr

# This demo requires a Hugging Face PRO token.
demo = gr.load("meta-llama/Meta-Llama-3-8B-Instruct", src="models", accept_token=True)

if __name__ == "__main__":
    demo.launch()
