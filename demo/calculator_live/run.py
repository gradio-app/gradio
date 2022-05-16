import gradio as gr


def greet(name):
    return "Hello " + name + "!!"


inputs_device = gr.inputs.Radio(choices=["cuda:0", "cpu"], default="cuda:0", label="设备")
inputs_size = gr.inputs.Radio(choices=[320, 640, 1280], default=320, label="推理尺寸")

iface = gr.Interface(fn=greet, inputs=[inputs_device, inputs_size], outputs="text")
iface.launch()
