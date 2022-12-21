import gradio as gr 

css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

with gr.Blocks(css=css) as demo:
    gr.Label(value={"First Label": 0.7, "Second Label": 0.2, "Third Label": 0.1})

demo.launch()