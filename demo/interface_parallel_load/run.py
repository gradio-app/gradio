import gradio as gr

generator1 = gr.Interface.load("huggingface/gpt2")
generator2 = gr.Interface.load("huggingface/EleutherAI/gpt-neo-2.7B")
generator3 = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B")

demo = gr.Parallel(generator1, generator2, generator3)

if __name__ == "__main__":
    demo.launch()