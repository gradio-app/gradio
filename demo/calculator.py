import gradio as gr
import random

def calculator(num1, operation, num2):
    if operation == "add":
        return num1 + num2
    elif operation == "subtract":
        return num1 - num2
    elif operation == "multiply":
        return num1 * num2
    elif operation == "divide":
        return num1 / num2

iface = gr.Interface(calculator, 
    ["number", gr.inputs.Radio(["add", "subtract", "multiply", "divide"]), "number"],
    "number",
    examples=[
        [
            random.randint(0, 10), 
            random.choice(["add", "subtract", "multiply", "divide"]),
            random.randint(0, 5),
        ] for _ in range(40)
    ]
)
if __name__ == "__main__":
    iface.launch()