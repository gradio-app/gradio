import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# Custom Event Demo\nPress any key to see it displayed below.")

    keyboard = gr.HTML(
        js_on_load="""
        document.addEventListener('keydown', (e) => {
            trigger('keypress', {key: e.key});
        });
        """,
    )

    textbox = gr.Textbox(label="Key pressed")

    def get_key(evt_data: gr.EventData):
        return evt_data.key

    keyboard.keypress(get_key, None, textbox)

if __name__ == "__main__":
    demo.launch()
