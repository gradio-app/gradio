import gradio as gr

with gr.Blocks() as demo:
    name = gr.Textbox(label="Name")
    output = gr.Textbox(label="Output Box")
    greet_btn = gr.Button("Greet")
    trigger = gr.Textbox(label="Trigger Box")

    def greet(name, evt_data: gr.EventData):
        return "Hello " + name + "!", evt_data.target.__class__.__name__

    def clear_name(evt_data: gr.EventData):
        return ""

    gr.on(
        triggers=[name.submit, greet_btn.click],
        fn=greet,
        inputs=name,
        outputs=[output, trigger],
    ).then(clear_name, outputs=[name])

if __name__ == "__main__":
    demo.launch()
