import gradio as gr

def count(n):
    for i in range(n):
        yield i


demo = gr.Interface(count, gr.Number(10), gr.Number())


if __name__ == "__main__":
    demo.launch()
