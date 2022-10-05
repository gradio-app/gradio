from transformers import pipeline
import gradio as gr
import time

p = pipeline("automatic-speech-recognition")

def transcribe(audio, state=""):
    time.sleep(2)
    text = p(audio)["text"]
    state += text + " "
    return state, state

demo = gr.Interface(
    fn=transcribe, 
    inputs=[
        gr.Audio(source="microphone", type="filepath", streaming=True), 
        "state"
    ],
    outputs=[
        "textbox",
        "state"
    ],
    live=True
)

if __name__ == "__main__":
    demo.launch()
