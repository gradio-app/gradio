import random

import gradio as gr

xray_model = lambda diseases, img: {disease: random.random() for disease in diseases}
ct_model = lambda diseases, img: {disease: 0.1 for disease in diseases}


with gr.Blocks() as demo:
    gr.Markdown(
        """
# Detect Disease From Scan
With this model you can lorem ipsum
- ipsum 1
- ipsum 2
"""
    )
    disease = gr.CheckboxGroup(
        choices=["Covid", "Malaria", "Lung Cancer"], label="Disease to Scan For"
    )

    with gr.Tabs():
        with gr.TabItem("X-ray"):
            with gr.Row():
                xray_scan = gr.Image()
                xray_results = gr.JSON()
            xray_run = gr.Button("Run")
            xray_run.click(
                xray_model, inputs=[disease, xray_scan], outputs=xray_results
            )

        with gr.TabItem("CT Scan"):
            with gr.Row():
                ct_scan = gr.Image()
                ct_results = gr.JSON()
            ct_run = gr.Button("Run")
            ct_run.click(ct_model, inputs=[disease, ct_scan], outputs=ct_results)

    overall_probability = gr.Textbox()

if __name__ == "__main__":
    demo.launch()
