import gradio as gr
import numpy as np
import random

with gr.Blocks() as demo:
    section_labels = ["apple", "banana", "carrot", "donut", "eggplant", "fish", "grapes", "hamburger", "ice cream", "juice"]

    with gr.Row():
        num_boxes = gr.Slider(0, 5, 1, label="Number of boxes")
        num_segments = gr.Slider(0, 5, 1, label="Number of segments")

    with gr.Row():
        img_input = gr.Image()
        img_output = gr.ImageSections()

    section_btn = gr.Button("Identify Sections")

    def section(img, num_boxes, num_segments):
        sections = []
        for i, _ in enumerate(num_boxes):
            x = random.randint(0, img.shape[1])
            y = random.randint(0, img.shape[0])
            w = random.randint(0, img.shape[1] - x)
            h = random.randint(0, img.shape[0] - y)
            sections.append((x, y, w, h), section_labels[i])
        for j, _ in enumerate(num_segments):
            x = random.randint(0, img.shape[1])
            y = random.randint(0, img.shape[0])
            w = random.randint(0, img.shape[1] - x)
            h = random.randint(0, img.shape[0] - y)
            mask = np.random.randint(0, 2, img.shape[:2])
            mask_area = np.zeros(img.shape[:2])
            mask_area[y:y+h, x:x+w] = mask[y:y+h, x:x+w]
            sections.append(mask_area, section_labels[i + j])
        return sections
    
    section_btn.click(section, [img_input, num_boxes, num_segments], img_output)


demo.launch()