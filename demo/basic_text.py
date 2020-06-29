import gradio as gr
from time import sleep

def answer_question(text1, text2):
    sleep(2)
    return text1[::-1], [
        ("Value 1", 12.3),
        ("Section", "DF3"),
        ("Confidence", 100),
    ]


gr.Interface(answer_question, 
            [
                gr.inputs.Textbox(label="text 1", lines=4),
                gr.inputs.Textbox(label="text 2", lines=4),
            ], [
                gr.outputs.Textbox(label="out", lines=8),
                "key_values"
            ]
<<<<<<< HEAD
            ).launch(title="Demo", description="Trying out a funky model!")
=======
            ).launch(share=True)
>>>>>>> 2bd16c2f9c360c98583b94e2f6a6ea7259a98217
