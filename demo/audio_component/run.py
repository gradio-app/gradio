import gradio as gr
import time

# css = "footer {display: none !important;} .gradio-container {min-height: 0px !important;}"

# with gr.Blocks(css=css) as demo:
#     gr.Audio()

# demo.launch()


def one(text):
    raise gr.Error("This is the first error")


def two():
    time.sleep(1)


def three():
    raise gr.Error("This is the second error")


def four():
    time.sleep(1)


def five():
    raise gr.Error(
        "This is the third error, and it is much longer than the others. In fact it is much, much longer."
    )


def six():
    time.sleep(1)


def seven():
    raise gr.Error("This is the fourth error, and it is a conventional length.")


with gr.Blocks() as demo:
    input = gr.TextArea()
    output = gr.TextArea()
    gr.Button().click(fn=one, inputs=input, outputs=output).then(two).then(three).then(
        four
    ).then(five).then(six).then(seven)

demo.launch()
