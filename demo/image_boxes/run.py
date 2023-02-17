import gradio as gr


def predict(inp):
    image = inp['image']
    boxes = inp['mask']

    sub_images = []
    for box in boxes:
        sub_images.append(image.crop(box))
    return sub_images


demo = gr.Interface(fn=predict,
                    inputs=gr.Image(tool="boxes", type="pil"),
                    outputs=gr.Gallery())

demo.launch()
