from gradio import Dropdown, Blocks, Slider, Image, Button, update


def update_dropdown_choices(val):
    if val < 50:
        opts = ["fail", "repeat"]
    else:
        opts = ["succeed", "repeat"]
    return update(choices=opts), update(height=val)


with Blocks() as block:
    s = Slider(value=0, minimum=0, maximum=100)
    d = Dropdown(choices=["fake", "choices", "exist"])
    i = Image(value="xray.jpg", height=0)

    # s.change(fn=update_dropdown_choices, inputs=[s], outputs=[d, i])

    btn = Button("Go")
    btn.click(fn=update_dropdown_choices, inputs=[s], outputs=[d, i])

    block.launch()
