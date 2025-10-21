import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        chatbot = gr.Chatbot(value=[], editable="user")
    add_message_btn = gr.Button("Add Message")
    add_user_message_btn = gr.Button("Add User Message")

    with gr.Row():
        concatenated_text1 = gr.Textbox(label="Concatenated Chat 1")
        concatenated_text2 = gr.Textbox(label="Concatenated Chat 2")
        edited_messages = gr.Textbox(label="Edited Message")

    def add_message(history: list):
        usr_msg = "I'm a user"
        bot_msg = "I'm a bot"
        history.append({"role": "user", "content": usr_msg})
        history.append({"role": "assistant", "content": bot_msg})
        return history

    def add_user_message(history: list):
        usr_msg = "I'm a user"
        history.append({"role": "user", "content": usr_msg})
        return history

    add_message_btn.click(add_message, [chatbot], [chatbot])
    add_user_message_btn.click(add_user_message, [chatbot], [chatbot])
    chatbot.change(lambda m: "|".join(m["content"][0]["text"] for m in m), chatbot, concatenated_text1)

    def edit_message(edited_message: gr.EditData): # type: ignore
        return f"from {edited_message.previous_value} to {edited_message.value} at {edited_message.index}" # type: ignore

    chatbot.edit(edit_message, None, edited_messages)

if __name__ == "__main__":
    demo.launch()
