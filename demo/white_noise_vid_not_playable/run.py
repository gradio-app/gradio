import cv2
import gradio as gr
import numpy as np


def gif_maker():
    img_array = []
    height, width = 50, 50
    for i in range(30):
        img_array.append(np.random.randint(0, 255, size=(height, width, 3)).astype(np.uint8))
    output_file = "test.mp4"
    out = cv2.VideoWriter(output_file, cv2.VideoWriter_fourcc(*'mp4v'), 15, (height, width))
    for i in range(len(img_array)):
        out.write(img_array[i])
    out.release()
    return output_file, output_file


demo = gr.Interface(gif_maker, inputs=None, outputs=[gr.Video(), gr.File()])

if __name__ == "__main__":
    demo.launch()