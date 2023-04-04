import gradio as gr
import numpy as np

with gr.Blocks() as demo:
    imgs = gr.State()
    gallery = gr.Gallery()

    def generate_images():
        images = []
        for _ in range(9):
            image = np.ones((100, 100, 3), dtype=np.uint8) * np.random.randint(
                0, 255, 3
            )  # image is a solid single color
            images.append(image)
        return images, images

    demo.load(generate_images, None, [gallery, imgs])

    with gr.Row():
        selected = gr.Number(show_label=False, placeholder="Selected")
        darken_btn = gr.Button("Darken selected")

    def get_select_index(evt: gr.SelectData):
        return evt.index

    gallery.select(get_select_index, None, selected)

    def darken_img(imgs, index):
        index = int(index)
        imgs[index] = np.round(imgs[index] * 0.8).astype(np.uint8)
        return imgs, imgs

    darken_btn.click(darken_img, [imgs, selected], [imgs, gallery])

if __name__ == "__main__":
    demo.launch()
