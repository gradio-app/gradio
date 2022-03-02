import gradio as gr

import random

xray_model = lambda diseases, img: {disease: random.random() for disease in diseases}
ct_model = lambda diseases, img: {disease: 0.1 for disease in diseases}

xray_blocks = gr.Blocks()

with xray_blocks:
    gr.Markdown(
        """
	# Detect Disease From Scan
	With this model you can lorem ipsum
	- ipsum 1
	- ipsum 2
	"""
    )
    disease = gr.inputs.CheckboxGroup(
        ["Covid", "Malaria", "Lung Cancer"], label="Disease to Scan For"
    )

    with gr.Tab("X-ray"):
        with gr.Row():
            xray_scan = gr.inputs.Image()
            xray_results = gr.outputs.JSON()
        xray_run = gr.Button("Run")
        xray_run.click(xray_model, inputs=[disease, xray_scan], outputs=xray_results)

    with gr.Tab("CT Scan"):
        with gr.Row():
            ct_scan = gr.inputs.Image()
            ct_results = gr.outputs.JSON()
        ct_run = gr.Button("Run")
        ct_run.click(ct_model, inputs=[disease, ct_scan], outputs=ct_results)

    overall_probability = gr.outputs.Textbox()

# TODO: remove later
print(xray_blocks.get_config_file())
xray_blocks.launch()
