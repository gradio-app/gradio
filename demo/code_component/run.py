import gradio as gr

css = (
    "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"
)

with gr.Blocks(css=css) as demo:
    gr.Code(
        value="""def hello_world():
    return "Hello, world!"
    
print(hello_world())""",
        language="python",
        interactive=True,
        show_label=False,
    )

if __name__ == "__main__":
    demo.launch()
