import gradio as gr

title = "GPT-J-6B"

component = gr.Textbox(lines=5, label="Text")

demo = gr.Interface.load(
    "huggingface/EleutherAI/gpt-j-6B",
    inputs=component,
    outputs=component,
    title=title,
)

if __name__ == "__main__":
    demo.launch()
