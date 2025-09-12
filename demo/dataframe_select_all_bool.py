import gradio as gr
import pandas as pd

# Create sample data with boolean columns
df = pd.DataFrame({
    "Name": ["Alice", "Bob", "Charlie", "David", "Eve"],
    "Age": [25, 30, 35, 40, 45],
    "Active": [True, False, True, False, True],
    "Premium": [False, True, False, True, False],
    "Verified": [True, True, False, False, True]
})

def update_dataframe(df):
    """Process the dataframe and return it"""
    return df

with gr.Blocks() as demo:
    gr.Markdown("# Dataframe with Boolean Column Select All/Deselect All")
    gr.Markdown("The boolean columns (Active, Premium, Verified) should have checkboxes in their headers for select all/deselect all functionality.")
    
    dataframe = gr.Dataframe(
        value=df,
        interactive=True,
        datatype=["str", "number", "bool", "bool", "bool"],
        label="Sample Data with Boolean Columns"
    )
    
    btn = gr.Button("Process Data")
    output = gr.Dataframe(label="Output")
    
    btn.click(update_dataframe, inputs=dataframe, outputs=output)

if __name__ == "__main__":
    demo.launch()