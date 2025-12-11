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
    - **Python functions** (server-side processing)
    - **JavaScript functions** (client-side processing, instant updates)
    """)
    
    with gr.Row():
        with gr.Column():
            gr.Markdown("### Textbox with Custom Buttons")
            export_btn = gr.Button("Export (Python)", icon="https://cdn-icons-png.flaticon.com/512/724/724933.png")
            refresh_btn = gr.Button("Refresh (Python)")
            alert_btn = gr.Button("Show Alert (JS)", variant="secondary")
            timestamp_btn = gr.Button("Show Time (JS)", variant="secondary")
            clear_btn = gr.Button("Clear (JS)", variant="stop")
            
            textbox = gr.Textbox(
                value="Sample text content that can be exported, refreshed, or transformed.",
                buttons=["copy", export_btn, refresh_btn, alert_btn, timestamp_btn, clear_btn],
                label="Sample Text",
                lines=5
            )
            
            output = gr.Textbox(label="Output (Python Function Result)")
        
        with gr.Column():
            gr.Markdown("### Instructions")
            gr.Markdown("""
            - **Export (Python)**: Sends text to server, processes it, and returns result
            - **Refresh (Python)**: Generates new random content on the server
            - **Show Alert (JS)**: Shows a browser alert popup (JavaScript only!)
            - **Show Time (JS)**: Shows current browser time in an alert (JavaScript only!)
            - **Clear (JS)**: Clears the textbox instantly in the browser
            
            Notice how the JavaScript functions (alerts) appear instantly without a server roundtrip!
            """)
    
    export_btn.click(export_data, inputs=textbox, outputs=output)
    refresh_btn.click(refresh_data, outputs=textbox)
    
    alert_btn.click(
        None,
        inputs=textbox,
        outputs=[],
        js="(text) => { alert('This is a JavaScript alert!\\n\\nTextbox content: ' + text); return []; }"
    )
    
    timestamp_btn.click(
        None,
        inputs=[],
        outputs=[],
        js="() => { const now = new Date(); alert('Current browser time (JavaScript):\\n\\n' + now.toLocaleString()); return []; }"
    )
    
    clear_btn.click(
        None,
        inputs=[],
        outputs=textbox,
        js="() => ''"
    )

if __name__ == "__main__":
    demo.launch()

