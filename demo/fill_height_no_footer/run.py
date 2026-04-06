import gradio as gr

with gr.Blocks(fill_height=True) as demo:
    gr.Chatbot()

if __name__ == "__main__":
    demo.launch(footer_links=[])
