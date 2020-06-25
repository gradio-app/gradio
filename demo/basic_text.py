import gradio as gr
from time import sleep

def answer_question(text1, text2):
    sleep(2)
    return text1[::-1]


gr.Interface(answer_question, 
            [
                gr.inputs.Textbox(label="text 1", lines=4),
                gr.inputs.Textbox(label="text 2", lines=4),
            ], [
                gr.outputs.Textbox(label="out", lines=8),
            ]
            ).launch(share=True)
