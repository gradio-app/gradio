import gradio as gr

def answer_question(text1, text2):
    return text1, text2, {"plagiarism": 0.62, "original": 0.38}


gr.Interface(answer_question, 
            [
                gr.inputs.Microphone(label="speech"), 
                gr.inputs.Dropdown(["Deepspeech", "Sphynx", "Wav2Text"], label="model"), 
            ], [
                gr.outputs.Textbox(label="text 1", lines=8),
            ]
            ).launch()
