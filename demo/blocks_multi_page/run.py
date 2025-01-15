import gradio as gr

with gr.Blocks() as demo:
    with gr.Page("About", route="/about"):
        gr.Markdown("# About Us")
        gr.Textbox("About Us")
    with gr.Page("Calculator", route="/calculator"):
        num1 = gr.Number(0, label="Number 1")
        num2 = gr.Number(0, label="Number 2")
        sum = gr.Number("Answer")
        with gr.Row():
            gr.Button("Add").click(lambda a, b: a + b, [num1, num2], sum)
            gr.Button("Subtract").click(lambda a, b: a - b, [num1, num2], sum)
            gr.Button("Multiply").click(lambda a, b: a * b, [num1, num2], sum)
            gr.Button("Divide").click(lambda a, b: a / b, [num1, num2], sum)
    with gr.Page("Image Stuff"):
        gr.Image()
        gr.Image()
demo.launch()
