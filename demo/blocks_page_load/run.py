import gradio as gr


def print_message(n):
    return "Welcome! This page has loaded for " + n


with gr.Blocks() as demo:
    t = gr.Textbox("Frank", label="Name")
    t2 = gr.Textbox(label="Output")
    demo.load(print_message, t, t2)


if __name__ == "__main__":
    demo.launch()
