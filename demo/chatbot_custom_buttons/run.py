import gradio as gr
import copy

def handle_custom_button(data: gr.CustomButtonsData, history: list[gr.MessageDict]):
    if data.label == "Example1":
        return duplicate_chat(history)
    elif data.label == "Example2":
        return fill_all_messages(data, history)
    #Doesn't change the history in chatbot (just change a copy)
    else:
        delete_all_messages(copy.deepcopy(history)) 
        return history 

def duplicate_chat(history: list[gr.MessageDict]):
    return [item for item in history for _ in range(2)]

def fill_all_messages(data: gr.CustomButtonsData, history: list[gr.MessageDict]):
    value = data.values[0]
    for message in history:
        message['content'] = value
        
    return history

def delete_all_messages(history: list[gr.MessageDict]):
    return history[:0]

examples = [
    {"role": "user", "content": "User message 1."},
    {"role": "user", "content": "User message 2."},
    {"role": "assistant", "content": "Chatbot message 1."},
]

with gr.Blocks() as demo:
    with gr.Row():
        chatbot = gr.Chatbot(
            type="messages",
            custom_buttons=[
                {
                    "label": "Example1",
                    "icon": "ArrowUp",
                    "visible": "chatbot",
                },
                {
                    "label": "Example2",
                    "visible": "user",
                    "icon": "Chat",
                },
                {
                    "label": "Example3",
                },
            ],
        )
    with gr.Row():
        concatenated_text = gr.Textbox(label="Concatenated Chat")
    chatbot.custom_button(handle_custom_button, chatbot, chatbot)

    chatbot.change(lambda m: "|".join(m["content"] for m in m), chatbot, concatenated_text)

    demo.load(lambda: examples, None, chatbot)

if __name__ == "__main__":
    demo.launch()