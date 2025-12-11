import gradio as gr

def export_data(text):
    print("Exporting data:", text)
    return "Data exported to server!"

def refresh_data():
    import random
    return f"Refreshed content: {random.randint(1000, 9999)}"

with gr.Blocks() as demo:
    gr.Markdown("""
    # Textbox with Custom Buttons Demo
    
    This demo showcases custom buttons in a Textbox component that can trigger either (or both):
    - **Python functions** 
    - **JS functions** (with and without input parameters)
    
    You can use emojis, text, or icons for the buttons.
    """)
    
    gr.Markdown("### Textbox with Custom Buttons")
    refresh_btn = gr.Button("Refresh")
    alert_btn = gr.Button("⚠️ Alert")
    clear_btn = gr.Button("🗑️")
    
    audio = gr.Audio(
        value="https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3",
        buttons=["download", alert_btn],
        label="Sample Audio",
    )

    textbox = gr.Textbox(
        buttons=["copy", alert_btn],
        label="Sample Text",
    )

    gr.Markdown("### Textbox with Custom Buttons")

    textbox2 = gr.Textbox(
        buttons=["copy", alert_btn],
        label="Sample Text",
    )


    
    refresh_btn.click(refresh_data, outputs=textbox)
    
    alert_btn.click(
        None,
        inputs=textbox,
        outputs=[],
        js="(text) => { alert('This is a JavaScript alert!\\n\\nTextbox content: ' + text); return []; }"
    )
    
    
    clear_btn.click(
        None,
        inputs=[],
        outputs=textbox,
        js="() => ''"
    )

if __name__ == "__main__":
    demo.launch()

