import gradio as gr

string_concat = gr.Blocks.load(name="spaces/freddyaboulton/blocks_inputs")

with gr.Blocks() as demo:
    name = gr.Text(label="Name")
    greeting = gr.Text(label="Greeting")
    btn = gr.Button("Greet")
    btn.click(lambda s: string_concat("Hello ", s), inputs=[name], outputs=[greeting])

if __name__ == "__main__":
    demo.launch()