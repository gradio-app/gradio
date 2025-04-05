import gradio as gr
import numpy as np

def average_inpainting_colors(image):
    mask = image["layers"][0]
    img = image["background"]
    mask_bool = mask[:,:,3] > 0
    if not np.any(mask_bool):
        return img
    selected_pixels = img[mask_bool]
    avg_color = np.mean(selected_pixels, axis=0)
    result = img.copy()
    result[mask_bool] = avg_color
    return result

with gr.Blocks() as demo:
    with gr.Row():
        image_editor = gr.ImageEditor(
            type="numpy",
            label="Input Image with Inpainting Layers",
            interactive=True,
            show_fullscreen_button=True
        )

        output_image = gr.Image(
            type="numpy",
            label="Averaged Inpainting Layers"
        )

        image_editor.change(fn=average_inpainting_colors, inputs=image_editor, outputs=output_image)

if __name__ == "__main__":
    demo.launch()