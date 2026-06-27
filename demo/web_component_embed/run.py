import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# Web component embed target")
    name = gr.Textbox(label="Name")
    greet = gr.Button("Greet")
    out = gr.Textbox(label="Greeting")
    greet.click(lambda n: f"Hello, {n or 'world'}!", name, out)

if __name__ == "__main__":
    demo.launch()
