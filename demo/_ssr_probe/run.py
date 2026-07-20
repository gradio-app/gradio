import gradio as gr
with gr.Blocks() as demo:
    n = gr.Number(label="Probe Number")
    t = gr.Textbox(label="Probe Textbox")
    s = gr.Slider(label="Probe Slider")
    c = gr.Checkbox(label="Probe Checkbox")
    cg = gr.CheckboxGroup(["a","b"], label="Probe CBG")
    r = gr.Radio(["a","b"], label="Probe Radio")
    d = gr.Dropdown(["a","b"], label="Probe Dropdown")
    code = gr.Code(label="Probe Code")
if __name__ == "__main__":
    demo.launch()
