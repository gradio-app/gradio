import os
import gradio as gr

def greet(name):
    return f"Hello, {name}!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text", title="Simple Demo")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    # bind to 0.0.0.0 so Railway (and other hosts) can reach it
    demo.launch(server_name="0.0.0.0", server_port=port, share=False)