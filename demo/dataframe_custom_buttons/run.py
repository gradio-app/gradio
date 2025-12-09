import gradio as gr

def export_data(df):
    print("Exporting data:", df)
    return "Data exported!"

def refresh_data():
    import random
    return {
        "headers": ["Name", "Age", "City"],
        "data": [
            ["Alice", random.randint(20, 40), "New York"],
            ["Bob", random.randint(20, 40), "Los Angeles"],
            ["Charlie", random.randint(20, 40), "Chicago"],
        ]
    }

with gr.Blocks() as demo:
    gr.Markdown("# Dataframe with Custom Buttons Demo")
    
    export_btn = gr.Button("Export", icon="https://cdn-icons-png.flaticon.com/512/724/724933.png")
    refresh_btn = gr.Button("Refresh")
    
    df = gr.Dataframe(
        value={
            "headers": ["Name", "Age", "City"],
            "data": [
                ["Alice", 30, "New York"],
                ["Bob", 25, "Los Angeles"],
                ["Charlie", 35, "Chicago"],
            ]
        },
        buttons=["fullscreen", "copy", export_btn, refresh_btn],
        label="Sample Data"
    )
    
    output = gr.Textbox(label="Output")
    
    export_btn.click(export_data, inputs=df, outputs=output)
    refresh_btn.click(refresh_data, outputs=df)

if __name__ == "__main__":
    demo.launch()

