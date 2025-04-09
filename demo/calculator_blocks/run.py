# import gradio as gr

# def calculator(num1, operation, num2):
#     """
#     This is a simple calculator that adds, subtracts, multiplies, and divides two numbers.

#     Args:
#         num1: The first number to operate on.
#         operation: The operation to perform.
#         num2: The second number to operate on.

#     Returns:
#         The result of the operation.
#     """
#     if operation == "add":
#         return num1 + num2
#     elif operation == "subtract":
#         return num1 - num2
#     elif operation == "multiply":
#         return num1 * num2
#     elif operation == "divide":
#         return num1 / num2

# with gr.Blocks() as demo:
#     with gr.Row():
#         with gr.Column():
#             num_1 = gr.Number(value=4)
#             operation = gr.Radio(["add", "subtract", "multiply", "divide"])
#             num_2 = gr.Number(value=0)
#             submit_btn = gr.Button(value="Calculate")
#         with gr.Column():
#             result = gr.Number()

#     submit_btn.click(
#         calculator, inputs=[num_1, operation, num_2], outputs=[result], api_name=False
#     )

# if __name__ == "__main__":
#     demo.launch(show_api=False)

from typing import TYPE_CHECKING

from mcp.server.fastmcp import FastMCP

if TYPE_CHECKING:
    from gradio.blocks import Blocks

mcp = FastMCP("gradio")

# def add_tools(block: "Blocks") -> FastMCP:
    # for fn in block.fns.values():
    #     if fn.fn is not None:
    #         mcp.add_tool(fn.fn)

@mcp.tool()
def multi_add(a: int, b: int) -> int:
    """Multiply given two numbers and then add it to their sum"""
    return a*b + a + b


if __name__ == "__main__":
    # Ensure stdout uses UTF-8 encoding
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    mcp.run(transport='sse')
