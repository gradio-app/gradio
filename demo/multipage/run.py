import gradio as gr
import random
import time

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    @gr.on([greet_btn.click, name.submit], inputs=name, outputs=output)
    def greet(name):
        return "Hello " + name + "!"

with demo.route("Up") as incrementer_demo:
    num = gr.Number()
    incrementer_demo.load(lambda: time.sleep(1) or random.randint(10, 40), None, num)

    with gr.Row():
        inc_btn = gr.Button("Increase")
        dec_btn = gr.Button("Decrease")
    inc_btn.click(fn=lambda x: x + 1, inputs=num, outputs=num, api_name="increment")
    dec_btn.click(fn=lambda x: x - 1, inputs=num, outputs=num, api_name="decrement")
    for i in range(100):
        gr.Textbox()

def wait(x):
    time.sleep(2)
    return x

identity_iface = gr.Interface(wait, "image", "image")

with demo.route("Interface") as incrementer_demo:
    identity_iface.render()
    gr.Interface(lambda x, y: x * y, ["number", "number"], "number")

if __name__ == "__main__":
    demo.launch(ssr_mode=True)
