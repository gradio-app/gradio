import gradio as gr


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    with gr.Tabs():
        with gr.TabItem("Tab 1"):
            t = gr.Textbox("Some value", label="Name", visible=False, interactive=True)
            with gr.Row():
                show_btn = gr.Button("Show")
                show_btn.click(lambda: gr.Textbox(visible=True), inputs=None, outputs=t)
                hide_btn = gr.Button("Hide")
            hide_btn.click(lambda: gr.Textbox(visible=False), inputs=None, outputs=t)

        with gr.TabItem("Tab 2"):
            t2 = gr.Textbox(
                "Some other value", label="Name", visible=False, interactive=True
            )
            with gr.Row():
                show_btn2 = gr.Button("Show")
                show_btn2.click(
                    lambda: gr.Textbox(visible=True), inputs=None, outputs=t2
                )
                hide_btn2 = gr.Button("Hide")
                hide_btn2.click(
                    lambda: gr.Textbox(visible=False), inputs=None, outputs=t2
                )
        with gr.TabItem("Tab 3"):
            t3 = gr.ImageEditor(label="Name", visible=False, interactive=True)
            with gr.Row():
                show_btn3 = gr.Button("Show")
                show_btn3.click(
                    lambda: gr.Textbox(visible=True), inputs=None, outputs=t3
                )
                hide_btn3 = gr.Button("Hide")
                hide_btn3.click(
                    lambda: gr.Textbox(visible=False), inputs=None, outputs=t3
                )

if __name__ == "__main__":
    demo.launch()
