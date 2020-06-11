import gradio as gr


def upper(sentence, sentence2):
    return sentence2.upper(), sentence[::-1]


gr.Interface(upper, 
            [
                "textbox", 
                gr.inputs.Textbox(lines=3, placeholder="hello")
            ],
            [
                "textbox",
                gr.outputs.Textbox(lines=3, placeholder="hello")
            ],
            live=True).launch()
