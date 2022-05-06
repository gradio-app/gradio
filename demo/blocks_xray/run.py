import gradio as gr
import random
import time


def xray_model(diseases, img):
    time.sleep(4)
    return {disease: random.random() for disease in diseases}


def ct_model(diseases, img):
    time.sleep(3)
    return {disease: 0.1 for disease in diseases}


with gr.Blocks() as demo:
    gr.Image("files/xray.jpg", height=48)
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
        with gr.TabItem("X-ray") as x_tab:
            with gr.Row():
                xray_scan = gr.Image()
                xray_results = gr.JSON()
            xray_run = gr.Button("Run")
            xray_progress = gr.StatusTracker(cover_container=True)
            xray_run.click(
                xray_model,
                inputs=[disease, xray_scan],
                outputs=xray_results,
                status_tracker=xray_progress,
            )

        with gr.TabItem("CT Scan"):
            with gr.Row():
                ct_scan = gr.Image()
                ct_results = gr.JSON()
            ct_run = gr.Button("Run")
            ct_progress = gr.StatusTracker(cover_container=True)
            ct_run.click(
                ct_model,
                inputs=[disease, ct_scan],
                outputs=ct_results,
                status_tracker=ct_progress,
            )

    upload_btn = gr.Button("Upload Results")
    upload_btn.click(
        lambda ct, xr: time.sleep(5),
        inputs=[ct_results, xray_results],
        outputs=[],
        status_tracker=gr.StatusTracker(),
    )

if __name__ == "__main__":
    demo.launch()
