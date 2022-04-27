import gradio as gr

text_identity, text_input, text_output = gr.Blocks(), gr.Blocks(), gr.Blocks()

with text_identity:
    gr.Interface(lambda x:x, "text", "text")

with text_input:
    t = gr.Textbox(label="Enter your text here")
    with gr.Row():
        btn = gr.Button("Submit")
        clr = gr.Button("Clear")
    clr.click(lambda x: "", t, t)

with text_output:
    gr.Textbox("This is a static output")

with gr.Blocks() as demo:
    gr.Markdown("Three demos in one!")
    with gr.Tabs():
        with gr.TabItem("Text Identity"):
            text_identity.render()
        with gr.TabItem("Text Input"):
            text_input.render()
        with gr.TabItem("Text Static"):
            text_output.render()
    

if __name__ == "__main__":
    demo.launch()
