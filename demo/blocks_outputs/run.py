import gradio as gr

with gr.Blocks() as demo:
    txt = gr.Textbox(label="Small Textbox", lines=1)
    txt = gr.Textbox(label="Large Textbox", lines=5)
    num = gr.Number(label="Number")
    check = gr.Checkbox(label="Checkbox")
    check_g = gr.CheckboxGroup(label="Checkbox Group", choices=["One", "Two", "Three"])
    radio = gr.Radio(label="Radio", choices=["One", "Two", "Three"])
    drop = gr.Dropdown(label="Dropdown", choices=["One", "Two", "Three"])
    slider = gr.Slider(label="Slider")
    audio = gr.Audio()
    video = gr.Video()
    image = gr.Image()
    ts = gr.Timeseries()
    df = gr.Dataframe()
    html = gr.HTML()
    json = gr.JSON()
    md = gr.Markdown()
    label = gr.Label()
    highlight = gr.HighlightedText()
    # layout components are static only
    # carousel doesn't work like the others
    # carousel = gr.Carousel()


if __name__ == "__main__":
    demo.launch()
