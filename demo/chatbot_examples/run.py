import gradio as gr

def user_message(history, message):
    history.append((message, None))
    return history, gr.Textbox(value=None)

def bot_message(history):
    history[-1][1] = "Cool, " + history[-1][0]
    return history

with gr.Blocks(fill_height=True) as demo:
    chatbot = gr.Chatbot(scale=1)
    input_textbox = gr.Textbox(interactive=True, show_label=False, autofocus=True)
    
    chat_msg_text = input_textbox.submit(user_message, [chatbot, input_textbox], [chatbot, input_textbox])
    bot_msg_text = chat_msg_text.then(bot_message, chatbot, chatbot)

    examples = gr.Examples(
        [
            [[], "What's up"], 
            [[], "Try this example with this image."]
        ],
        inputs=[chatbot, input_textbox],
        outputs=[chatbot, input_textbox],
        fn=user_message
    )
    examples.click_event.then(bot_message, chatbot, chatbot)


if __name__ == "__main__":
    demo.launch()
