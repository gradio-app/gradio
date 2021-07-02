import gradio as gr
import numpy as np

def disease_report(img, scan_for, generate_report):
    results = []
    for i, mode in enumerate(["Red", "Green", "Blue"]):
        color_filter = np.array([0, 0, 0])
        color_filter[i] = 1
        results.append([mode, img * color_filter])
    return results, "files/titanic.csv" if generate_report else None

iface = gr.Interface(disease_report, 
    [
        "image", 
        gr.inputs.CheckboxGroup(["Cancer", "Rash", "Heart Failure", "Stroke", "Diabetes", "Pneumonia"]),
        "checkbox"
    ],
    [
        gr.outputs.Carousel(["text", "image"], label="Disease"),
        gr.outputs.File(label="Report")
    ],
    title="Disease Report",
    description="Upload an Xray and select the diseases to scan for.",
    theme="compact",
    flagging_options=["good", "bad", "etc"]
)

if __name__ == "__main__":
    iface.launch()
