import gradio as gr
import pathlib

current_dir = pathlib.Path(__file__)

images = [current_dir / "cheetah1.jpeg", current_dir / "cheetah1.jpg", current_dir / "lion.jpg"]


img_classifier = gr.Interface.load(
    "models/google/vit-base-patch16-224", examples=images, cache_examples=False
)


def func(img, text):
    return img_classifier(img), text


using_img_classifier_as_function = gr.Interface(
    func,
    [gr.Image(type="filepath"), "text"],
    ["label", "text"],
    examples=[
        [current_dir / "cheetah1.jpeg", None],
        [current_dir / "cheetah1.jpg", "cheetah"],
        [current_dir / "lion.jpg", "lion"],
    ],
    cache_examples=True,
)
demo = gr.TabbedInterface([using_img_classifier_as_function, img_classifier])

if __name__ == "__main__":
    demo.launch()
