import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("The `round()` function in Python takes two parameters")
    gr.ParamViewer(
        {
           "number": {
             "type": "int | float",
             "description": "The number to round",
             "default": None
            },
            "ndigits": {
             "type": "int",
             "description": "The number of digits to round to",
             "default": "0"
            }
         }
    )

if __name__ == "__main__":
    demo.launch()
