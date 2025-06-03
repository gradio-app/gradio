from datetime import datetime

import time
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

    slider2 = gr.Slider(1, 10, step=1, label="Box Count")
    btn = gr.Button("Create Boxes")
    @gr.render(inputs=[slider2], triggers=[btn.click])
    def show_log_2(s):
        for i in range(s):
            gr.Textbox(value=str(i), label=f"Count {i + 1}")

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

    selectable_chat = gr.Chatbot([["chat1", "chat2"], ["chat3", "chat4"]])
 
    @gr.render(triggers=[selectable_chat.select])
    def show_selected_chat(selection: gr.SelectData):
        gr.Textbox(label="Trigger Index", value=selection.index)

    @gr.render()
    def examples_in_interface():
        gr.Interface(lambda x:x, gr.Textbox(label="input"), gr.Textbox(), examples=[["test"]])

    @gr.render()
    def examples_in_blocks():
        a = gr.Textbox(label="little textbox")
        gr.Examples([["abc"], ["def"]], [a])

    choices_count = gr.Slider(1, 10, 3, step=1, label="Choices")
    @gr.render(choices_count)
    def show_choices(count):
        with gr.Row():
            letter_choices = gr.Radio(list('abcdefghij')[:int(count)], label="Choices", key="choices", preserved_by_key=["value", "label"], interactive=True)
            textbox = gr.Textbox(label="Set Label", value="Choices")

            textbox.change(lambda l: gr.Radio(label=l), textbox, letter_choices)

    timer = gr.Timer(0.5)

    @gr.render(triggers=[timer.tick], show_progress="hidden")
    def render():
        a = gr.Textbox(label="box-a", key="a")
        b = gr.Textbox(label="box-b", key="b")
        a.change(lambda x: time.sleep(0.5) or x, a, b, key="a-b")
        gr.Number(value=round(time.time(), 2))


if __name__ == '__main__':
    demo.launch()
