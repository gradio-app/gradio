import gradio as gr

def add_textbox_message(history, message):
    history.append((message, None))
    return history, gr.Textbox(value=None, interactive=False)

def respond(history):
    print(history)
    history[-1][1] = "Cool, " + history[-1][0]
    return history

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(scale=1)
    input_textbox = gr.Textbox(interactive=True, show_label=False)
    
    chat_msg_text = input_textbox.submit(add_textbox_message, [chatbot, input_textbox], [chatbot, input_textbox])
    bot_msg_text = chat_msg_text.then(respond, chatbot, chatbot)
    bot_msg_text.then(lambda: gr.Textbox(interactive=True), None, [input_textbox])

    examples = gr.Examples(
        [
            [[], "What's up"], 
            [[], "Try this example with this image."]
        ],
        inputs=[chatbot, input_textbox],
        outputs=[chatbot, input_textbox],
        fn=add_textbox_message
    )


if __name__ == "__main__":
    demo.launch()
