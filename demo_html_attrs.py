import gradio as gr

def echo(text):
    return text

with gr.Blocks() as demo:
    gr.Markdown("# HTML Attributes Demo")
    gr.Markdown("This demo shows how to use the new `html_attrs` parameter to add HTML attributes to textbox components.")
    
    with gr.Row():
        with gr.Column():
            gr.Markdown("## Textbox with autocorrect disabled")
            textbox1 = gr.Textbox(
                label="No autocorrect",
                placeholder="Type here... autocorrect is disabled",
                html_attrs={"autocorrect": "off", "spellcheck": "false"}
            )
            
        with gr.Column():
            gr.Markdown("## Textbox with custom attributes")
            textbox2 = gr.Textbox(
                label="Custom attributes",
                placeholder="This has custom HTML attributes",
                html_attrs={
                    "autocorrect": "off",
                    "spellcheck": "false", 
                    "autocomplete": "off",
                    "data-custom": "example"
                }
            )
    
    with gr.Row():
        with gr.Column():
            gr.Markdown("## Regular textbox (for comparison)")
            textbox3 = gr.Textbox(
                label="Regular textbox",
                placeholder="This has default autocorrect behavior"
            )
    
    output = gr.Textbox(label="Output")
    
    gr.Button("Submit").click(
        fn=lambda t1, t2, t3: f"Textbox 1: {t1}\nTextbox 2: {t2}\nTextbox 3: {t3}",
        inputs=[textbox1, textbox2, textbox3],
        outputs=output
    )

if __name__ == "__main__":
    demo.launch() 