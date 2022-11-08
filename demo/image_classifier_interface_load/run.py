import gradio as gr
import pathlib

current_dir = pathlib.Path(__file__).parent

images = [str(current_dir / "cheetah1.jpeg"), str(current_dir / "cheetah1.jpg"), str(current_dir / "lion.jpg")]


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
        [str(current_dir / "cheetah1.jpeg"), None],
        [str(current_dir / "cheetah1.jpg"), "cheetah"],
        [str(current_dir / "lion.jpg"), "lion"],
    ],
    cache_examples=False,
)
demo = gr.TabbedInterface([using_img_classifier_as_function, img_classifier])

if __name__ == "__main__":
    demo.launch()