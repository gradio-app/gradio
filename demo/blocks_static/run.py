import gradio as gr

demo = gr.Blocks()

with demo:
    gr.Image(
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"
    )
    gr.Textbox("hi")
    gr.Number(3)

if __name__ == "__main__":
    demo.launch()
