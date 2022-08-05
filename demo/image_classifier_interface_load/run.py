import gradio as gr

images = ["cheetah1.jpeg", "cheetah1.jpg", "lion.jpg"]


img_classifier = gr.Interface.load(
    "models/google/vit-base-patch16-224", examples=images, cache_examples=True
)


def func(img, text):
    return img_classifier(img), text


using_img_classifier_as_function = gr.Interface(
    func,
    [gr.Image(type="filepath"), "text"],
    ["label", "text"],
    examples=[
        ["cheetah1.jpeg", None],
        ["cheetah1.jpg", "cheetah"],
        ["lion.jpg", "lion"],
    ],
    cache_examples=True,
)
demo = gr.TabbedInterface([using_img_classifier_as_function, img_classifier])

if __name__ == "__main__":
    demo.launch()
