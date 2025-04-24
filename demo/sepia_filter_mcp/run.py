import numpy as np
import gradio as gr

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

demo = gr.Interface(sepia, gr.Image(), "image")
if __name__ == "__main__":
    demo.launch(mcp_server=True)
