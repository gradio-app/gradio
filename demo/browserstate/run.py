import random
import string
import gradio as gr
import time
with gr.Blocks() as demo:
    gr.Markdown("Your Username and Password will get saved in the browser's local storage. "
                "If you refresh the page, the values will be retained.")
    username = gr.Textbox(label="Username")
    password = gr.Textbox(label="Password", type="password")
    btn = gr.Button("Generate Randomly")
    local_storage = gr.BrowserState(["", ""])
    saved_message = gr.Markdown("✅ Saved to local storage", visible=False)

    @btn.click(outputs=[username, password])
    def generate_randomly():
        u = "".join(random.choices(string.ascii_letters + string.digits, k=10))
        p = "".join(random.choices(string.ascii_letters + string.digits, k=10))
        return u, p

    @demo.load(inputs=[local_storage], outputs=[username, password])
    def load_from_local_storage(saved_values):
        print("loading from local storage", saved_values)
        return saved_values[0], saved_values[1]

    @gr.on([username.change, password.change], inputs=[username, password], outputs=[local_storage])
    def save_to_local_storage(username, password):
        return [username, password]

    @gr.on(local_storage.change, outputs=[saved_message])
    def show_saved_message():
        timestamp = time.strftime("%I:%M:%S %p")
        return gr.Markdown(
            f"✅ Saved to local storage at {timestamp}",
            visible=True
        )

demo.launch()
