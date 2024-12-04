from datetime import datetime

import gradio as gr

def update_log():
    return datetime.now().timestamp()

def get_target(evt: gr.EventData):
    return evt.target

def get_select_index(evt: gr.SelectData):
    return evt.index

with gr.Blocks() as demo:
    gr.Textbox(value=update_log, every=0.2, label="Time")
    
    slider = gr.Slider(1, 10, step=1)
    @gr.render(inputs=[slider])
    def show_log(s):
        with gr.Row():
            for i in range(s):
                gr.Textbox(value=update_log, every=0.2, label=f"Render {i + 1}")

    with gr.Row():
        selected_btn = gr.Textbox(label="Selected Button")
        selected_chat = gr.Textbox(label="Selected Chat")
    @gr.render(inputs=[slider])
    def show_buttons(s):
        with gr.Row():
            with gr.Column():
                for i in range(s):
                    btn = gr.Button(f"Button {i + 1}")
                    btn.click(get_target, None, selected_btn)
            chatbot = gr.Chatbot([["Hello", "Hi"], ["How are you?", "I'm good."]])
            chatbot.select(get_select_index, None, selected_chat)

if __name__ == '__main__':
    demo.launch()
