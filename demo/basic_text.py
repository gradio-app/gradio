import gradio as gr

def upper(sentence):
    return sentence.upper()

gr.Interface(upper, "textbox", "textbox", live=True).launch()