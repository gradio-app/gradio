from gradio import Dropdown, Blocks, Slider, Image


def update_dropdown_choices(val):
    if val < 50:
        opts = ["fail", "repeat"]
    else:
        opts = ["succeed", "repeat"]
    return Dropdown.update(choices=opts), Image.update(height=val)


with Blocks() as block:
    s = Slider(default_value=0, minimum=0, maximum=100)
    d = Dropdown(choices=["fake", "choices", "exist"])
    i = Image(default_value="xray.jpg", height=0)

    s.change(fn=update_dropdown_choices, inputs=[s], outputs=[d, i])
    block.launch()
