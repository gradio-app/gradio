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
    disease = gr.inputs.CheckboxGroup(["Covid", "Malaria", "Lung Cancer"], choices=, label="Disease to Scan For")

    with gr.Tabs():
        with gr.TabItem("X-ray"):
            with gr.Row():
                xray_scan = gr.inputs.Image()
                xray_results = gr.outputs.JSON()
                output_textbox = gr.outputs.Textbox()
                input_textbox = gr.inputs.Textbox(default_value="Hello This Is a Input Textbox")
            xray_run = gr.Button("Run")
            xray_run.click(xray_model, inputs=[disease, xray_scan], outputs=xray_results)
            xray_run.click(xray_model, inputs=[disease, xray_scan], outputs=output_textbox)

        with gr.TabItem("CT Scan"):
            with gr.Row():
                ct_scan = gr.inputs.Image()
                ct_results = gr.outputs.JSON()
            ct_run = gr.Button("Run")
            ct_run.click(ct_model, inputs=[disease, ct_scan], outputs=ct_results)

    overall_probability = gr.outputs.Textbox()

# TODO: remove later
import json
print(json.dumps(xray_blocks.get_config_file(), indent=2))
    
xray_blocks.launch()
