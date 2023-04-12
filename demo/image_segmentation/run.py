import gradio as gr
import numpy as np
import random

with gr.Blocks() as demo:
    section_labels = ["apple", "banana", "carrot", "donut", "eggplant", "fish", "grapes", "hamburger", "ice cream", "juice"]

    with gr.Row():
        num_boxes = gr.Slider(0, 5, 2, step=1, label="Number of boxes")
        num_segments = gr.Slider(0, 5, 1, step=1, label="Number of segments")

    with gr.Row():
        img_input = gr.Image()
        img_output = gr.ImageSections()

    section_btn = gr.Button("Identify Sections")

    def section(img, num_boxes, num_segments):
        sections = []
        for a in range(num_boxes):
            x = random.randint(0, img.shape[1])
            y = random.randint(0, img.shape[0])
            w = random.randint(0, img.shape[1] - x)
            h = random.randint(0, img.shape[0] - y)
            sections.append(((x, y, w, h), section_labels[a]))
        for b in range(num_segments):
            x = random.randint(0, img.shape[1])
            y = random.randint(0, img.shape[0])
            r = random.randint(0, min(x, y, img.shape[1] - x, img.shape[0] - y))
            mask = np.zeros(img.shape[:2], dtype=np.uint8)
            for i in range(img.shape[0]):
                for j in range(img.shape[1]):
                    if (i - y)**2 + (j - x)**2 < r**2:
                        mask[i, j] = 1
            sections.append((mask, section_labels[a + b]))
        return (img, sections)
    
    section_btn.click(section, [img_input, num_boxes, num_segments], img_output)


demo.launch()