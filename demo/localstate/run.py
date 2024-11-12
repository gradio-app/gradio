import random
import string
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("Your Username and Password will get saved in the browser's local storage. "
                "If you refresh the page, the values will be retained.")
    username = gr.Textbox(label="Username")
    password = gr.Textbox(label="Password", type="password")
    btn = gr.Button("Generate Randomly")
    local_storage = gr.LocalState(["", ""])

    @btn.click(outputs=[username, password])
    def generate_randomly(username, password):
        username.value = "".join(random.choices(string.ascii_letters + string.digits, k=10))
        password.value = "".join(random.choices(string.ascii_letters + string.digits, k=10))
        return username, password

    @gr.on([username.change, password.change], inputs=[username, password])
    def save_to_local_storage(username, password):
        return [username, password]

    @demo.load()
    def load_from_local_storage(saved_values):
        return saved_values[0], saved_values[1]

demo.launch()