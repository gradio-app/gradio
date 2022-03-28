import os
import tempfile

import numpy as np
from fpdf import FPDF

import gradio as gr


def disease_report(img, scan_for, generate_report):
    results = []
    for i, mode in enumerate(["Red", "Green", "Blue"]):
        color_filter = np.array([0, 0, 0])
        color_filter[i] = 1
        results.append([mode, img * color_filter])
    tmp_dir = tempfile.gettempdir()
    report = os.path.join(tmp_dir, "report.pdf")
    if generate_report:
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=15)
        pdf.cell(200, 10, txt="Disease Report", ln=1, align="C")
        pdf.cell(200, 10, txt="A Gradio Demo.", ln=2, align="C")
        pdf.output(report)
    return results, report if generate_report else None


demo = gr.Interface(
    disease_report,
    [
        "image",
        gr.CheckboxGroup(
            ["Cancer", "Rash", "Heart Failure", "Stroke", "Diabetes", "Pneumonia"]
        ),
        "checkbox",
    ],
    [
        gr.Carousel(["text", "image"], label="Disease"),
        gr.File(label="Report"),
    ],
    title="Disease Report",
    description="Upload an Xray and select the diseases to scan for.",
    theme="grass",
    flagging_options=["good", "bad", "etc"],
    allow_flagging="auto",
)

if __name__ == "__main__":
    demo.launch()
