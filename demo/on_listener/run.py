import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("## Listen to Button click & Textbox submit")
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")

    def greet(name):
        return "Hello " + name + "!"

    gr.on(
        triggers=[name.submit, greet_btn.click],
        fn=greet,
        inputs=name,
        outputs=output,
        api_name="greet",
    )

    gr.Markdown("## Live Mode ")
    with gr.Row():
        num1 = gr.Slider(1, 10)
        num2 = gr.Slider(1, 10)
        num3 = gr.Slider(1, 10)
    output = gr.Number(label="Sum")

    def sum(a, b, c):
        return a + b + c

    gr.on(inputs=[num1, num2, num3], fn=sum, outputs=output)

    gr.Markdown("## Use with .then")
    with gr.Row():
        x = gr.Number()
        y = gr.Number()
    output2 = gr.Number(label="Product")

    def multiply(a, b):
        return a + b

    gr.on(triggers=[x.submit, y.submit], inputs=[x, y], fn=multiply, outputs=output2).then(
        lambda: (None, None), outputs=[x, y]
    )

    gr.Markdown("## Use as decorator")
    drop = gr.Dropdown(["a", "b", "c"], value="a")
    radio = gr.Radio(["d", "e", "f"], value="d")
    output3 = gr.Textbox(label="Output")

    @gr.on(inputs=[drop, radio], outputs=output3)
    def concat(a, b):
        return a + b


if __name__ == "__main__":
    demo.launch()
