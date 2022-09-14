import gradio as gr


def calculator(num1, operation, num2):
    if operation == "add":
        return num1 + num2
    elif operation == "subtract":
        return num1 - num2
    elif operation == "multiply":
        return num1 * num2
    elif operation == "divide":
        return num1 / num2


with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            num_1 = gr.Number(value=4)
            operation = gr.Radio(["add", "subtract", "multiply", "divide"])
            num_2 = gr.Number(value=0)
            submit_btn = gr.Button(value="Calculate")
        with gr.Column():
            result = gr.Number()

    submit_btn.click(calculator, inputs=[num_1, operation, num_2], outputs=[result], api_name="calculate")
    examples = gr.Examples(examples=[[5, "add", 3],
                                     [4, "divide", 2],
                                     [-4, "multiply", 2.5],
                                     [0, "subtract", 1.2]],
                           inputs=[num_1, operation, num_2])

if __name__ == "__main__":
    demo.launch(show_api=False)