import gradio as gr
import os
# Multimodal Chatbot demo that shows support for examples (example messages shown within the chatbot).

def print_like_dislike(x: gr.LikeData):
    print(x.index, x.value, x.liked)

def add_message(history, message):
    for x in message["files"]:
        history.append({"role": "user", "content": (x,)})
    if message["text"] is not None:
        history.append({"role": "user", "content": message["text"]})
    return history, gr.MultimodalTextbox(value=None, interactive=False)

def append_example_message(x: gr.SelectData, history):
    if x.value["text"] is not None:
        history.append({"role": "user", "content": x.value["text"]})
    if "files" in x.value:
        if isinstance(x.value["files"], list):
            for file in x.value["files"]:
                history.append({"role": "user", "content": file})
        else:
            history.append({"role": "user", "content": x.value["files"]})
    return history

def respond(history):
    history.append({"role": "assistant", "content": "Cool!", "options": [{"value": "Option 1"}, {"value": "Option 2"}]})
    return history

with gr.Blocks() as demo:
    chatbot = gr.Chatbot(
        elem_id="chatbot",
        scale=1,
        placeholder='<h1 style="font-weight: bold; color: #FFFFFF; text-align: center; font-size: 48px; font-family: Arial, sans-serif;">Welcome to Gradio!</h1>',
        examples=[{"icon": os.path.join(os.path.dirname(__file__), "files/avatar.png"), "display_text": "Display Text Here!", "text": "Try this example with this audio.", "files": [os.path.join(os.path.dirname(__file__), "files/cantina.wav")]},
                     {"text": "Try this example with this image.", "files": [os.path.join(os.path.dirname(__file__), "files/avatar.png")]},
                     {"text": "This is just text, no files!"},
                     {"text": "Try this example with this image.", "files": [os.path.join(os.path.dirname(__file__), "files/avatar.png"), os.path.join(os.path.dirname(__file__), "files/avatar.png")]},
                     {"text": "Try this example with this Audio.", "files": [os.path.join(os.path.dirname(__file__), "files/cantina.wav")]}]
    )

    chat_input = gr.MultimodalTextbox(interactive=True,
                                      file_count="multiple",
                                      placeholder="Enter message or upload file...", show_label=False)

    chat_msg = chat_input.submit(add_message, [chatbot, chat_input], [chatbot, chat_input])
    bot_msg = chat_msg.then(respond, chatbot, chatbot, api_name="bot_response")
    bot_msg.then(lambda: gr.MultimodalTextbox(interactive=True), None, [chat_input])

    chatbot.like(print_like_dislike, None, None)
    chatbot.example_select(append_example_message, [chatbot], [chatbot]).then(respond, chatbot, chatbot, api_name="respond")

if __name__ == "__main__":
    demo.launch()
