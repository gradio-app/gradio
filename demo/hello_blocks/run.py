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
import random
import time

with gr.Blocks() as demo:
    chatbot = gr.Chatbot()
    msg = gr.Textbox()
    clear = gr.ClearButton([msg, chatbot])

    # create 1000 buttons
    for i in range(2000):
        gr.Button("hi", visible=False)

    def respond(message, chat_history):
        bot_message = "How are you?" * 10000
        chat_history.append((message, bot_message))
        for i in range(2000):
            chat_history[-1] = (chat_history[-1][0], chat_history[-1][1] + " " + str(i))
            yield "", chat_history

        print("done")

    msg.submit(respond, [msg, chatbot], [msg, chatbot])

demo.launch(server_name="0.0.0.0")
