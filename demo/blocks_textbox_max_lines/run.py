import gradio as gr


def greet(name: str, repeat: float):
    return "Hello " + name * int(repeat) + "!!"


demo = gr.Interface(
    fn=greet, inputs=[gr.Textbox(lines=2, max_lines=4), gr.Number()], outputs=gr.component("textarea")()
)

if __name__ == "__main__":
    demo.launch()
