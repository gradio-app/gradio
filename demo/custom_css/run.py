import gradio as gr

with gr.Blocks() as demo:
    with gr.Column(elem_classes="cool-col"):
        gr.Markdown("### Gradio Demo with Custom CSS", elem_classes="darktest")
        gr.Markdown(
            elem_classes="markdown",
            value="Resize the browser window to see the CSS media query in action.",
        )

if __name__ == "__main__":
    demo.launch(css_paths=["demo/custom_css/custom_css.css"])
