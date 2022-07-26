import gradio as gr
import cv2
import numpy as np
import random


# Convert decimal color to hexadecimal color
def RGB_to_Hex(rgb):
    color = "#"
    for i in rgb:
        num = int(i)
        color += str(hex(num))[-2:].replace("x", "0").upper()
    return color


# Randomly generate light or dark colors
def random_color(is_light=True):
    return (
        random.randint(0, 127) + int(is_light) * 128,
        random.randint(0, 127) + int(is_light) * 128,
        random.randint(0, 127) + int(is_light) * 128,
    )


def switch_color(color_style):
    if color_style == "light":
        is_light = True
    elif color_style == "dark":
        is_light = False
    back_color_ = random_color(is_light)  # Randomly generate colors
    back_color = RGB_to_Hex(back_color_)  # Convert to hexadecimal

    # Draw color pictures.
    w, h = 50, 50
    img = np.zeros((h, w, 3), np.uint8)
    cv2.rectangle(img, (0, 0), (w, h), back_color_, thickness=-1)

    return back_color, back_color, img


inputs = [gr.Radio(["light", "dark"], value="light")]

outputs = [
    gr.ColorPicker(label="color"),
    gr.Textbox(label="hexadecimal color"),
    gr.Image(type="numpy", label="color picture"),
]

title = "Color Generator"
description = (
    "Click the Submit button, and a dark or light color will be randomly generated."
)

demo = gr.Interface(
    fn=switch_color,
    inputs=inputs,
    outputs=outputs,
    title=title,
    description=description,
)

if __name__ == "__main__":
    demo.launch()
