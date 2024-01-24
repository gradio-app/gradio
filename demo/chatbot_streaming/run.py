import gradio as gr
import random
import time

with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    msg = gr.Textbox()
    tokens = gr.Number()
    clear = gr.Button("Clear")

    def user(user_message, history):
        return "", history + [[user_message, None]]

    def bot(history):
        bot_message = random.choice(["How are you?", "I love you", "I'm very hungry"])
        history[-1][1] = ""
        for i, character in enumerate(bot_message):
            print(character)
            history[-1][1] += character
            time.sleep(0.05)
            yield i, history

    msg.submit(user, [msg, chatbot], [msg, chatbot], queue=False).then(
        bot, chatbot, [tokens, chatbot], api_name="bot"
    )
    clear.click(lambda: None, None, chatbot, queue=False)

    a = gr.Textbox()
    b = gr.Textbox()
    def fn(_):
        for i in range(10):
            time.sleep(0.1)
            yield i
    a.submit(fn, a, b)
    
demo.queue()
if __name__ == "__main__":
    demo.launch()
