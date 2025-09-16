import gradio as gr

def update_child1_visibility(choice):
    if choice == "Show":
        return gr.update(visible=True)
    elif choice == "Hide (remove from DOM)":
        return gr.update(visible=False)
    else:  # "Hide (keep in DOM)"
        return gr.update(visible="hidden")

def update_child2_visibility(choice):
    if choice == "Show":
        return gr.update(visible=True)
    elif choice == "Hide (remove from DOM)":
        return gr.update(visible=False)
    else:  # "Hide (keep in DOM)"
        return gr.update(visible="hidden")

def get_values():
    return "Values still accessible even when hidden!"

with gr.Blocks() as demo:
    gr.Markdown("# Test Form Visibility with Children")
    gr.Markdown("""
    This demo tests how forms handle visibility when all children are invisible.
    
    **Expected behavior:**
    - If all form children have `visible=False`: Form should have `visible=False` (removed from DOM)
    - If any form child has `visible="hidden"`: Form should have `visible="hidden"` (hidden with CSS)
    - If any form child is visible: Form should be visible
    """)
    
    with gr.Row():
        with gr.Column():
            child1_control = gr.Radio(
                ["Show", "Hide (remove from DOM)", "Hide (keep in DOM)"],
                label="Control Child 1 visibility",
                value="Show"
            )
            child2_control = gr.Radio(
                ["Show", "Hide (remove from DOM)", "Hide (keep in DOM)"],
                label="Control Child 2 visibility", 
                value="Show"
            )
    
    with gr.Column():
        gr.Markdown("### Form Container")
        with gr.Group():  # This acts as a form container
            text1 = gr.Textbox(
                label="Child 1",
                value="I'm the first child",
                visible=True
            )
            text2 = gr.Textbox(
                label="Child 2", 
                value="I'm the second child",
                visible=True
            )
        
        btn = gr.Button("Get Values")
        output = gr.Textbox(label="Output")
    
    # Update visibility based on radio selections
    child1_control.change(update_child1_visibility, inputs=child1_control, outputs=text1)
    child2_control.change(update_child2_visibility, inputs=child2_control, outputs=text2)
    
    # Test if hidden components can still be accessed
    btn.click(get_values, outputs=output)
    
    gr.Markdown("""
    ### Test scenarios:
    1. Set both children to "Show" → Form should be visible
    2. Set both children to "Hide (remove from DOM)" → Form should disappear completely
    3. Set one child to "Hide (keep in DOM)" and other to "Hide (remove from DOM)" → Form should be hidden with CSS
    4. Set one child to "Show" and other to any hidden state → Form should remain visible
    """)

if __name__ == "__main__":
    demo.launch()