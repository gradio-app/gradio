import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("The `round()` function in Python takes two parameters"*1000)
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
                "default": "0",
            },
            "ndigits2": {
             "type": "int",
             "description": "The number of digits to round to",
                "default": "0",
            },
            "ndigits3": {
             "type": "int",
             "description": "The number of digits to round to",
                "default": "0",
            },
            "ndigits4": {
             "type": "int",
             "description": "The number of digits to round to",
                "default": "0",
            },
            "ndigits5": {
             "type": "int",
             "description": "The number of digits to round to",
                "default": "0",
            },
            "ndigits6": {
             "type": "int",
             "description": "The number of digits to round to",
                "default": "0",
            },
        },
        anchor_links=True,
    )

if __name__ == "__main__":
    demo.launch()
