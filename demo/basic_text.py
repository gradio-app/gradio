import gradio as gr

def upper(choice, sentence):
    return sentence[::-1], choice.upper()


gr.Interface(upper, 
            [
                gr.inputs.Dropdown(label="Pick something", choices=["big thing", "small", "other"]),
                "text"
            ],
            [
                "textbox",
                gr.outputs.Textbox(label="box 2", lines=3, placeholder="hello")
            ]).launch()
