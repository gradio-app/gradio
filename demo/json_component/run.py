import gradio as gr 

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
    gr.JSON(value={"Key 1": "Value 1", "Key 2": {"Key 3": "Value 2", "Key 4": "Value 3"}, "Key 5": ["Item 1", "Item 2", "Item 3"]})

demo.launch()