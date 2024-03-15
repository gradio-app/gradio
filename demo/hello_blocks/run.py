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


def make_number():
    return "1"


with gr.Blocks() as demo:
    msgs = []

    for i in range(64):
        msgs.append(gr.Textbox())

    for msg in msgs:
        demo.load(make_number, None, msg, show_progress=False)

    for i in range(len(msgs) - 1):
        msgs[i].change(lambda x: x + " - " + str(int(x[-1]) + 1), msgs[i], msgs[i + 1])

demo.queue()
demo.launch(
    max_threads=64,
)
