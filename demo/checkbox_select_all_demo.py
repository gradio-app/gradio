import gradio as gr

def process_selections(selected):
    return f"You selected: {', '.join(selected) if selected else 'None'}"

choices = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"]

with gr.Blocks() as demo:
    gr.Markdown("# CheckboxGroup with Select All")
    gr.Markdown("Test the new `show_select_all` parameter for CheckboxGroup")
    
    with gr.Row():
        with gr.Column():
            gr.Markdown("## With Select All")
            checkbox_with_select_all = gr.CheckboxGroup(
                choices=choices, 
                label="Choose Options",
                show_select_all=True,
                value=["Option 1"]
            )
            
        with gr.Column():
            gr.Markdown("## Without Select All")
            checkbox_without_select_all = gr.CheckboxGroup(
                choices=choices,
                label="Choose Options", 
                show_select_all=False,
                value=["Option 1"]
            )
    
    output1 = gr.Textbox(label="Selected (with select all)")
    output2 = gr.Textbox(label="Selected (without select all)")
    
    checkbox_with_select_all.change(
        process_selections,
        inputs=checkbox_with_select_all,
        outputs=output1
    )
    
    checkbox_without_select_all.change(
        process_selections,
        inputs=checkbox_without_select_all,
        outputs=output2
    )

if __name__ == "__main__":
    demo.launch()