import gradio as gr


def update(name):
    return "Welcome to Gradio, {}!".format(name)

demo = gr.Blocks()

with demo:
    gr.Markdown(
    """
    # Hello World!
    Start typing below to see the output.
    """)
    inp = gr.Textbox(placeholder="What is your name?")
    out = gr.Textbox()
    
    input.change(fn=update, 
                 inputs=inp, 
                 outputs=out)

demo.launch()