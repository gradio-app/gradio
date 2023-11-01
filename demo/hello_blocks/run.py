# import gradio as gr


# def greet(name):
#     return "Hello " + name + "!"


# with gr.Blocks() as demo:
#     name = gr.Textbox(label="Name")
#     output = gr.Textbox(label="Output Box")
#     greet_btn = gr.Button("Greet")
#     greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")

# if __name__ == "__main__":
#     demo.launch()

import gradio as gr

CHOICES = ["(NONE)", "a", "b", "c"]


def fn(choices):
    print(choices)
    if "(NONE)" in choices:
        return []
    else:
        return choices


with gr.Blocks() as demo:
    checkbox = gr.CheckboxGroup(choices=CHOICES, value=["a", "b", "c"])
    checkbox.change(fn=fn, inputs=checkbox, outputs=checkbox)

if __name__ == "__main__":
    demo.queue().launch()
