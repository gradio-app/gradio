import gradio as gr

generator1 = gr.load("huggingface/gpt2")
generator2 = gr.load("huggingface/gpt2-xl")

demo = gr.Parallel(generator1, generator2)

if __name__ == "__main__":
    demo.launch()