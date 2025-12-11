import gradio as gr

def export_data(text):
    print("Exporting data:", text)
    return "Data exported!"

def refresh_data():
    import random
    return f"Refreshed content: {random.randint(1000, 9999)}"

with gr.Blocks() as demo:
    gr.Markdown("# Textbox with Custom Buttons Demo")
    
    export_btn = gr.Button("Export", icon="https://cdn-icons-png.flaticon.com/512/724/724933.png")
    refresh_btn = gr.Button("Refresh")
    
    textbox = gr.Textbox(
        value="Sample text content that can be exported or refreshed.",
        buttons=["copy", export_btn, refresh_btn],
        label="Sample Text",
        lines=5
    )
    
    output = gr.Textbox(label="Output")
    
    export_btn.click(export_data, inputs=textbox, outputs=output)
    refresh_btn.click(refresh_data, outputs=textbox)

if __name__ == "__main__":
    demo.launch()

