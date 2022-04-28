import gradio as gr

component = gr.Textbox(lines=5, label="Text")
api = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B")

demo = gr.Interface(
    fn=lambda x: x[:-50] + api(x[-50:]),
    inputs=component,
    outputs=component,
    title="GPT-J-6B",
)

if __name__ == "__main__":
    demo.launch()
