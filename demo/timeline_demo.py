import gradio as gr

# Basic timeline demo
with gr.Blocks(title="Timeline Demo") as demo:
    gr.Markdown("# Timeline Component Demo")
    
    gr.Markdown("## Vertical Timeline (Default)")
    timeline1 = gr.Timeline(
        value=[
            {
                "title": "Start Training",
                "description": "Initialize model and start training process",
                "timestamp": "10:00",
                "status": "completed",
            },
            {
                "title": "Epoch 10",
                "description": "Loss: 0.45, Accuracy: 85%",
                "timestamp": "10:30",
                "status": "completed",
            },
            {
                "title": "Epoch 20",
                "description": "Loss: 0.32, Accuracy: 92%",
                "timestamp": "11:00",
                "status": "in-progress",
            },
            {
                "title": "Evaluate Model",
                "description": "Run validation and test set evaluation",
                "timestamp": "11:30",
                "status": "pending",
            },
            {
                "title": "Deploy Model",
                "description": "Export and deploy to production",
                "timestamp": "12:00",
                "status": "pending",
            },
        ],
        layout="vertical",
        label="Training Progress",
    )

    gr.Markdown("## Horizontal Timeline")
    timeline2 = gr.Timeline(
        value=[
            {
                "title": "Data Collection",
                "timestamp": "Day 1",
                "status": "completed",
            },
            {
                "title": "Data Preprocessing",
                "timestamp": "Day 2",
                "status": "completed",
            },
            {
                "title": "Model Training",
                "timestamp": "Day 3",
                "status": "in-progress",
            },
            {
                "title": "Evaluation",
                "timestamp": "Day 4",
                "status": "pending",
            },
        ],
        layout="horizontal",
        label="ML Pipeline",
    )

    gr.Markdown("## Interactive Timeline with Events")
    timeline3 = gr.Timeline(
        value=[
            {"title": "Click me!", "status": "completed"},
            {"title": "Or me!", "status": "in-progress"},
            {"title": "Or even me!", "status": "pending"},
        ],
        layout="vertical",
        label="Interactive Timeline",
        interactive=True,
    )
    
    output = gr.Textbox(label="Selected Event")
    
    def on_select(evt: gr.SelectData):
        return f"Selected event index: {evt.index}"
    
    timeline3.select(on_select, outputs=output)

if __name__ == "__main__":
    demo.launch(server_name="127.0.0.1", server_port=7860, ssr_mode=False, share=False, _frontend=False)
