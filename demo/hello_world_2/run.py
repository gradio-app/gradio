import gradio as gr


def greet(name):
    return "Hello " + name + "!"


iface = gr.Interface(
    fn=greet,
    inputs=gr.inputs.Textbox(lines=2, placeholder="Name Here..."),
    outputs="text",
)
if __name__ == "__main__":
    app, path_to_local_server, share_url = iface.launch()

