import gradio as gr

def user_message(history, message):
    for x in message["files"]:
        history.append({"role": "user", "content": {"path": x}})
    if message["text"] is not None:
        history.append({"role": "user", "content": message["text"]})
    return history, gr.Textbox(value=None)

def bot_message(history):
    history.append({"role": "assistant", "content": "Nice!"})
    return history

with gr.Blocks(fill_height=True) as demo:
    chatbot = gr.Chatbot(scale=1, type="messages")
    input_textbox = gr.MultimodalTextbox(interactive=True, show_label=False, autofocus=True)
    
    chat_msg_text = input_textbox.submit(user_message, [chatbot, input_textbox], [chatbot, input_textbox])
    bot_msg_text = chat_msg_text.then(bot_message, chatbot, chatbot)

    examples = gr.Examples(
        [
            [[], {"text": "What's up?", "files": []}], 
            [[], {"text": "What animal is this? Can you tell me?", "files": ["cheetah.jpg"]}]
        ],
        inputs=[chatbot, input_textbox],
        outputs=[chatbot, input_textbox],
        fn=user_message
    )
    examples.click_event.then(bot_message, chatbot, chatbot)


if __name__ == "__main__":
    demo.launch()
