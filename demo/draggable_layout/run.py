import gradio as gr

def process_text(text1, text2, text3, text4):
    return f"Textbox 1: {text1}\nTextbox 2: {text2}\nTextbox 3: {text3}\nTextbox 4: {text4}"

with gr.Blocks() as demo:
    gr.Markdown("# Draggable Layout Demo")
    gr.Markdown("Try dragging the textboxes below to reorder them!")
    
    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### Horizontal Layout")
            gr.Markdown("These components are arranged horizontally and can be dragged to reorder:")
            
            with gr.Draggable():
                textbox1 = gr.Textbox(label="Textbox 1", value="First", elem_id="tb1")
                textbox2 = gr.Textbox(label="Textbox 2", value="Second", elem_id="tb2")
                textbox3 = gr.Textbox(label="Textbox 3", value="Third", elem_id="tb3")
                textbox4 = gr.Textbox(label="Textbox 4", value="Fourth", elem_id="tb4")
        
        with gr.Column(scale=1):
            gr.Markdown("### Vertical Layout")
            gr.Markdown("These components are arranged vertically and can be dragged to reorder:")
            
            with gr.Column():
                with gr.Draggable():
                    slider1 = gr.Slider(label="Slider 1", minimum=0, maximum=100, value=25)
                    slider2 = gr.Slider(label="Slider 2", minimum=0, maximum=100, value=50)
                    slider3 = gr.Slider(label="Slider 3", minimum=0, maximum=100, value=75)
                    dropdown = gr.Dropdown(["Option A", "Option B", "Option C"], label="Dropdown", value="Option A")
    
    gr.Markdown("### Panel Variant")
    with gr.Draggable(variant="panel"):
        gr.Button("Button 1", variant="primary")
        gr.Button("Button 2", variant="secondary")
        gr.Button("Button 3")
        gr.Button("Button 4", variant="stop")
    
    gr.Markdown("### Mixed Components")
    with gr.Draggable():
        gr.Image(label="Image Upload")
        gr.Audio(label="Audio Upload")
        gr.File(label="File Upload")
        gr.Video(label="Video Upload")
    
    with gr.Row():
        process_btn = gr.Button("Process Text Inputs", variant="primary")
        output = gr.Textbox(label="Combined Output", lines=4)
    
    process_btn.click(
        fn=process_text,
        inputs=[textbox1, textbox2, textbox3, textbox4],
        outputs=output
    )

if __name__ == "__main__":
    demo.launch()