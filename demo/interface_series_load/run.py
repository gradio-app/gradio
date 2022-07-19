import gradio as gr

generator = gr.Interface.load("huggingface/gpt2")
translator = gr.Interface.load("huggingface/t5-small")

demo = gr.Series(generator, translator)

if __name__ == "__main__":
    demo.launch()