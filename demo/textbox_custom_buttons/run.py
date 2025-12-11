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
    
    This demo showcases custom buttons in a Textbox component that can trigger both:
    - **Python functions** 
    - **JS functions** (with and without input parameters)
    """)
    
    gr.Markdown("### Textbox with Custom Buttons")
    refresh_btn = gr.Button("Refresh")
    alert_btn = gr.Button("⚠️")
    clear_btn = gr.Button("🗑️")
    
    textbox = gr.Textbox(
        value="Sample text content that can be exported, refreshed, or transformed.",
        buttons=["copy", refresh_btn, alert_btn, clear_btn],
        label="Sample Text",
        lines=5
    )
    
    output = gr.Textbox(label="Output (Python Function Result)")
        
    
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

