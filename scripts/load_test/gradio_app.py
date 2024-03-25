import gradio as gr
from time import sleep
version, _, _ = gr.__version__.split(".")

with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    text = gr.Textbox()
    time = gr.Number(label="Time to Complete")

    def respond(text):
        output = ["Lorem"] * 500
        for i in range(len(output) + 1):
            yield [[text, " ".join(output[:i])]]
            sleep(0.01)

    if version == "3":
        text.submit(respond, text, chatbot)
    else:
        text.submit(respond, text, chatbot, concurrency_limit=None)


if __name__ == "__main__":
    if version == "3":
        demo.queue(concurrency_count=250).launch(max_threads=250)
    else:
        demo.launch(max_threads=250)
