import gradio as gr

identity_demo, input_demo, output_demo = gr.Blocks(), gr.Blocks(), gr.Blocks()

with identity_demo:
    gr.Interface(lambda x:x, "text", "text")

with input_demo:
    t = gr.Textbox(label="Enter your text here")
    with gr.Row():
        btn = gr.Button("Submit")
        clr = gr.Button("Clear")
    clr.click(lambda x: "", t, t)

with output_demo:
    gr.Textbox("This is a static output")

with gr.Blocks() as demo:
    gr.Markdown("Three demos in one!")
    with gr.Tabs():
        with gr.TabItem("Text Identity"):
            identity_demo.render()
        with gr.TabItem("Text Input"):
            input_demo.render()
        with gr.TabItem("Text Static"):
            output_demo.render()
    

if __name__ == "__main__":
    demo.launch()
