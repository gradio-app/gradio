import gradio as gr
import random
import time

with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    msg = gr.Textbox()
    clear = gr.Button("Clear")

    def user(user_message, history):
        return "", history + [{"role": "user", "content": user_message}]

    def bot(history):
        bot_message = random.choice(["How are you?", "I love you", "I'm very hungry"])
        time.sleep(2)
        history.append({"role": "assistant", "content": bot_message})
        return history

    msg.submit(user, [msg, chatbot], [msg, chatbot], queue=False).then(
        bot, chatbot, chatbot
    )
    clear.click(lambda: None, None, chatbot, queue=False)

if __name__ == "__main__":
    demo.launch()
