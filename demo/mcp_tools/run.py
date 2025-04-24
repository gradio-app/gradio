import numpy as np
import gradio as gr
from pathlib import Path
import os


def sepia(input_img):
    """
    Apply a sepia filter to the input image.

    Args:
        input_img (str): The input image to apply the sepia filter to.

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

def prime_factors(n):
    """
    Compute the prime factorization of a positive integer.

    Args:
        n (int): The integer to factorize. Must be greater than 1.

    Returns:
        List[int]: A list of prime factors in ascending order.

    Raises:
        ValueError: If n is not greater than 1.
    """
    n = int(n)
    if n <= 1:
        raise ValueError("Input must be an integer greater than 1.")

    factors = []
    while n % 2 == 0:
        factors.append(2)
        n //= 2

    divisor = 3
    while divisor * divisor <= n:
        while n % divisor == 0:
            factors.append(divisor)
            n //= divisor
        divisor += 2

    if n > 1:
        factors.append(n)

    return factors


def generate_cheetah_image():
    """
    Generate a cheetah image.

    Returns:
        The generated cheetah image.
    """
    return Path(os.path.dirname(__file__)) / "cheetah.jpg"


demo = gr.TabbedInterface(
    [
        gr.Interface(sepia, gr.Image(), gr.Image()),
        gr.Interface(prime_factors, gr.Textbox(), gr.Textbox()),
        gr.Interface(generate_cheetah_image, None, gr.Image())
    ],
    [
        "Sepia Filter",
        "Prime Factors",
        "Cheetah Image"
    ]
)

if __name__ == "__main__":
    demo.launch(mcp_server=True)
