import gradio as gr


def greet(name):
    return "Hello " + name + "!"


with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    greet_btn = gr.Button("Greet")
    greet_btn.click(fn=greet, inputs=name, outputs=name, api_name="greet")

    def add(a: int, b: int, c: list[str]) -> tuple[int, str]:
        return a + b, c[a] + c[b]
    
    gr.api(add, api_name="addition")

if __name__ == "__main__":
    demo.launch()
