import numpy as np
import gradio as gr
from pathlib import Path
import os
from PIL import Image

def prime_factors(n: str):
    """
    Compute the prime factorization of a positive integer.

    Args:
        n (str): The integer to factorize. Must be greater than 1.
    """
    n_int = int(n)
    if n_int <= 1:
        raise ValueError("Input must be an integer greater than 1.")

    factors = []
    while n_int % 2 == 0:
        factors.append(2)
        n_int //= 2

    divisor = 3
    while divisor * divisor <= n_int:
        while n_int % divisor == 0:
            factors.append(divisor)
            n_int //= divisor
        divisor += 2

    if n_int > 1:
        factors.append(n_int)

    return factors


def generate_cheetah_image():
    """
    Generate a cheetah image.

    Returns:
        The generated cheetah image.
    """
    return Path(os.path.dirname(__file__)) / "cheetah.jpg"


def image_orientation(image: Image.Image) -> str:
    """
    Returns whether image is portrait or landscape.

    Args:
        image (Image.Image): The image to check.

    Returns:
        str: "Portrait" if image is portrait, "Landscape" if image is landscape.
    """
    return "Portrait" if image.height > image.width else "Landscape"


def sepia(input_img):
    """
    Apply a sepia filter to the input image.

    Args:
        input_img (np.array): The input image to apply the sepia filter to.

    Returns:
        The sepia filtered image.
    """
    sepia_filter = np.array([
        [0.393, 0.769, 0.189],
        [0.349, 0.686, 0.168],
        [0.272, 0.534, 0.131]
    ])
    sepia_img = input_img.dot(sepia_filter.T)
    sepia_img /= sepia_img.max()
    return sepia_img



demo = gr.TabbedInterface(
    [
        gr.Interface(prime_factors, gr.Textbox("1001"), gr.Textbox(), api_name="prime_factors"),
        gr.Interface(generate_cheetah_image, None, gr.Image(), api_name="generate_cheetah_image"),
        gr.Interface(image_orientation, gr.Image(type="pil"), gr.Textbox(), api_name="image_orientation"),
        gr.Interface(sepia, gr.Image(), gr.Image(), api_name="sepia"),
    ],
    [
        "Prime Factors",
        "Cheetah Image",
        "Image Orientation Checker",
        "Sepia Filter",
    ]
)

if __name__ == "__main__":
    demo.launch(mcp_server=True)
