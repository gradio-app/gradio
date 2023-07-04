import gradio as gr

component = gr.Textbox(lines=5, label="Text")
api = gr.load("huggingface/gpt2-xl")

demo = gr.Interface(
    fn=lambda x: x[:-50] + api(x[-50:]),
    inputs=component,
    outputs=component,
    title="gpt2-xl",
)

if __name__ == "__main__":
    demo.launch()
