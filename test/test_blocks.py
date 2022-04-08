import random
import unittest

import gradio as gr
from gradio.test_data.blocks_configs import XRAY_CONFIG


class TestBlocks(unittest.TestCase):
    def test_xray(self):
        xray_model = lambda diseases, img: {
            disease: random.random() for disease in diseases
        }
        ct_model = lambda diseases, img: {disease: 0.1 for disease in diseases}

        xray_blocks = gr.Blocks()

        with xray_blocks:
            gr.components.Markdown(
                """
            # Detect Disease From Scan
            With this model you can lorem ipsum
            - ipsum 1
            - ipsum 2
            """
            )
            disease = gr.components.CheckboxGroup(
                choices=["Covid", "Malaria", "Lung Cancer"], label="Disease to Scan For"
            )

            with gr.Tabs():
                with gr.TabItem("X-ray"):
                    with gr.Row():
                        xray_scan = gr.components.Image()
                        xray_results = gr.components.JSON()
                    xray_run = gr.Button(
                        "Run",
                        css={"background-color": "red", "--hover-color": "orange"},
                    )
                    xray_run.click(
                        xray_model, inputs=[disease, xray_scan], outputs=xray_results
                    )

                with gr.TabItem("CT Scan"):
                    with gr.Row():
                        ct_scan = gr.components.Image()
                        ct_results = gr.components.JSON()
                    ct_run = gr.Button("Run")
                    ct_run.click(
                        ct_model, inputs=[disease, ct_scan], outputs=ct_results
                    )

            _ = gr.components.Textbox()

        self.assertEqual(XRAY_CONFIG, xray_blocks.get_config_file())


if __name__ == "__main__":
    unittest.main()
