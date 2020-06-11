import gradio as gr


def upper(sentence, sentence2):
    return sentence2.upper(), sentence[::-1]


gr.Interface(upper, 
            ["textbox", "textbox"],
            ["textbox", "textbox"],
            live=True).launch()
