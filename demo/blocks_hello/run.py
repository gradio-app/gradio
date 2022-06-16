import gradio as gr


def update(name):
    return f"Welcome to Gradio, {name}!"

demo = gr.Blocks()

with demo:
    gr.Markdown(
    """
    # Hello World!
    Start typing below to see the output.
    """)
    inp = gr.Textbox(placeholder="What is your name?")
    out = gr.Textbox()
    
    inp.change(fn=update, 
               inputs=inp, 
               outputs=out)

    gr.Image("lion.jpg").style(height=54, width=240)

demo.launch()