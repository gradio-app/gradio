import gradio as gr


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    gr.ChatInterface(lambda *args: "Hello")
    # # name = gr.Textbox(label="Name")
    # # output = gr.Textbox(label="Output Box")
    # # greet_btn = gr.Button("Greet")
    # # greet_btn.click(fn=greet, inputs=name, outputs=output, api_name="greet")
    # pass

if __name__ == "__main__":
    demo.launch()
