import gradio as gr


def update_dropdown_choices(val):
    if val < 50:
        opts = ["A", "B"]
    else:
        opts = ["A", "hide"]
    return gr.update(choices=opts), gr.update(lines=(int(val / 10) + 1))


with gr.Blocks() as block:
    slider = gr.Slider(value=0, minimum=0, maximum=100)
    radio = gr.Radio(choices=["A", "B"])
    textbox = gr.Textbox(default_value="hello")
    img = gr.Image("xray.jpg")

    slider.change(fn=update_dropdown_choices, inputs=[slider], outputs=[radio, textbox])
    radio.change(lambda choice: gr.update(visible=(choice != "hide")), [radio], [img])

    btn = gr.Button("Go")
    var = gr.Variable()
    btn.click(
        fn=lambda x, y: (5, gr.update(default_value=x)),
        inputs=[radio, textbox],
        outputs=[var, textbox],
    )

block.launch()
