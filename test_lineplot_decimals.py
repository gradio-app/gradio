import gradio as gr
import pandas as pd

# Create data with very small numbers like in the screenshot
data = pd.DataFrame({
    "step": list(range(10)) * 2,
    "grad_norm": [0.0] * 4 + [1e-20, 2e-20, 3e-20, 5e-20, 8e-20, 1e-19] + 
                 [0.0] * 4 + [0.5e-20, 1e-20, 1.5e-20, 2.5e-20, 4e-20, 5e-20],
    "run": ["run1"] * 10 + ["run2"] * 10
})

with gr.Blocks() as demo:
    gr.Markdown("## Test Line Plot Decimals")
    gr.LinePlot(
        value=data,
        x="step",
        y="grad_norm",
        color="run",
        title="train/grad_norm",
        y_axis_format=".2e"
    )

demo.launch(ssr_mode=True)

