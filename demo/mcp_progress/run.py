import gradio as gr
import time

def slow_text_reverser(text: str, progress=gr.Progress()):
    for i in range(len(text)):
        progress(i / len(text), desc="Reversing text")
        time.sleep(0.3)
    return text[::-1]


demo = gr.Interface(slow_text_reverser, gr.Textbox("Hello, world!"), gr.Textbox())

if __name__ == "__main__":
    demo.launch(mcp_server=True)
