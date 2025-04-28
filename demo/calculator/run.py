import gradio as gr

def calculator(num1: float, operation: str, num2: float) -> float:
    """
    Calculator function.
    Args:
        num1: The first number to calculate.
        operation: The operation to perform.
        num2: The second number to calculate.
    Returns:
        The result of the calculation.
    """
    if operation == "add":
        return num1 + num2
    elif operation == "subtract":
        return num1 - num2
    elif operation == "multiply":
        return num1 * num2
    elif operation == "divide":
        if num2 == 0:
            raise gr.Error("Cannot divide by zero!")
        return num1 / num2

demo = gr.Interface(
    calculator,
    [
        "number",
        gr.Radio(["add", "subtract", "multiply", "divide"]),
        "number"
    ],
    "number",
    examples=[
        [45, "add", 3],
        [3.14, "divide", 2],
        [144, "multiply", 2.5],
        [0, "subtract", 1.2],
    ],
    title="Toy Calculator",
    description="Here's a sample toy calculator.",
)

if __name__ == "__main__":
    demo.launch(mcp_server=True)
