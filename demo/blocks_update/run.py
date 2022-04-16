from gradio import Dropdown, Blocks, Slider


def update_dropdown_choices(val):
    if val < 50:
        opts = ["fail", "repeat"]
    else:
        opts = ["succeed", "repeat"]
    return Dropdown.update(choices=opts)


with Blocks() as block:
    s = Slider(default_value=0, minimum=0, maximum=100)
    d = Dropdown(choices=["fake", "choices", "exist"])

    s.change(fn=update_dropdown_choices, inputs=[s], outputs=[d])
    block.launch()
