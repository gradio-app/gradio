import gradio as gr
import random

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    @gr.on([greet_btn.click, name.submit], inputs=name, outputs=output)
    def greet(name):
        return "Hello " + name + "!"

with demo.route("Up") as incrementer_demo:
    num = gr.Number()
    incrementer_demo.load(lambda: random.randint(10, 40), None, num)

    with gr.Row():
        inc_btn = gr.Button("Increase")
        dec_btn = gr.Button("Decrease")
    inc_btn.click(fn=lambda x: x + 1, inputs=num, outputs=num, api_name="increment")
    dec_btn.click(fn=lambda x: x - 1, inputs=num, outputs=num, api_name="decrement")

identity_iface = gr.Interface(lambda x:x, "image", "image")

with demo.route("Interface") as incrementer_demo:
    identity_iface.render()
    gr.ChatInterface(lambda *args: "Cool!")

if __name__ == "__main__":
    demo.launch()
