import gradio as gr

LONG_TEXT = "\n\n".join(f"Paragraph {i}: " + "lorem ipsum " * 20 for i in range(30))
LONG_CODE = "\n".join(f"print({i})" for i in range(100))

with gr.Blocks() as demo:
    with gr.Accordion("Accordion with max_height=300", max_height=300):
        gr.Markdown(LONG_TEXT)

    with gr.Tabs():
        with gr.Tab("Tab with max_height=300", max_height=300):
            gr.Markdown(LONG_TEXT)
        with gr.Tab("Tab with height=200", height=200):
            gr.Markdown("Short content")

    code_initial = gr.Code(
        LONG_CODE, label="Code with max_lines=10 (initial value)", max_lines=10
    )
    code_output = gr.Code(label="Code with max_lines=10 (set by event)", max_lines=10)
    gr.Button("Fill code").click(lambda: LONG_CODE, None, code_output)

if __name__ == "__main__":
    demo.launch()
