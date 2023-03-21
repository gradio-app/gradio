import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown(
    """
    # Hello World!
    Start typing below to see the output.
    """)
    gr.Dropdown(list("abcd"))
    gr.Dropdown(list("abcdefghijklmnopqrstuvwxyz"))
    gr.Dropdown(list("abcdefghijklmnopqrstuvwxyz"), multiselect=True)
    gr.Dropdown(list("abcd"), multiselect=True, max_choices=2)
    gr.HTML("""
    <div style="height: 600px; width: 240px; background-color: blue"></div>
    """)

if __name__ == "__main__":
    demo.launch()