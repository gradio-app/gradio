import gradio as gr

api = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B")

def complete_with_gpt(text):
    # Use the last 50 characters of the text as context
    return text[:-50] + api(text[-50:])

with gr.Blocks() as demo:
    textbox = gr.Textbox(placeholder="Type here and press enter...", lines=4)
    btn = gr.Button("Generate")
    
    btn.click(complete_with_gpt, textbox, textbox)
    
if __name__ == "__main__":
    demo.launch()