import gradio as gr

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(elem_id="chatbot")

    with gr.Row():
        num1 = gr.Number(label="a")
        num2 = gr.Number(label="b")
    with gr.Row():
        num3 = gr.Number(label="c")
        num4 = gr.Number(label="d")

    btn = gr.Button("Start")

    def add_user(history):
        new_response = ["", None]
        history.append(new_response)
        for i in range(100):
            new_response[0] += f"{len(history)} "
            yield history

    def add_bot(history):
        last_response = history[-1]
        last_response[1] = ""
        for i in range(100):
            last_response[1] += f"{len(history)} "
            yield history

    chat_evt = btn.click(add_user, chatbot, chatbot).then(add_bot, chatbot, chatbot)
    for i in range(25):
        chat_evt = chat_evt.then(add_user, chatbot, chatbot).then(add_bot, chatbot, chatbot)

    increase = lambda x: x + 1

    btn_evt = btn.click(increase, num1, num2).then(increase, num2, num1)
    btn_evt2 = btn.click(increase, num3, num4).then(increase, num4, num3)
    for i in range(25):
        btn_evt = btn_evt.then(increase, num1, num2).then(increase, num2, num1)
        btn_evt2 = btn_evt2.then(increase, num3, num4).then(increase, num4, num3)

if __name__ == "__main__":
    demo.launch()
