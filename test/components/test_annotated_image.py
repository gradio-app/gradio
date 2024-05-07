import numpy as np
import PIL

import gradio as gr


class TestAnnotatedImage:
    def test_postprocess(self):
        """
        postprocess
        """
        component = gr.AnnotatedImage()
        img = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        mask1 = [40, 40, 50, 50]
        mask2 = np.zeros((100, 100), dtype=np.uint8)
        mask2[10:20, 10:20] = 1

        input = (img, [(mask1, "mask1"), (mask2, "mask2")])
        result = component.postprocess(input).model_dump()

        base_img_out = PIL.Image.open(result["image"]["path"])

        assert result["annotations"][0]["label"] == "mask1"

        mask1_img_out = PIL.Image.open(result["annotations"][0]["image"]["path"])
        assert mask1_img_out.size == base_img_out.size
        mask1_array_out = np.array(mask1_img_out)
        assert np.max(mask1_array_out[40:50, 40:50]) == 255
        assert np.max(mask1_array_out[50:60, 50:60]) == 0

    def test_annotated_image_format_parameter(self):
        component = gr.AnnotatedImage(format="jpeg")
        img = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
        mask1 = [40, 40, 50, 50]
        data = (img, [(mask1, "mask1"), (mask1, "mask2")])
        output = component.postprocess(data)
        assert output.image.path.endswith(".jpeg")
        assert output.annotations[0].image.path.endswith(".png")

    def test_component_functions(self):
        ht_output = gr.AnnotatedImage(label="sections", show_legend=False)
        assert ht_output.get_config() == {
            "name": "annotatedimage",
            "show_label": True,
            "label": "sections",
            "show_legend": False,
            "container": True,
            "min_width": 160,
            "scale": None,
            "format": "webp",
            "color_map": None,
            "height": None,
            "width": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "proxy_url": None,
            "_selectable": False,
            "key": None,
        }

    def test_in_interface(self):
        def mask(img):
            top_left_corner = [0, 0, 20, 20]
            random_mask = np.random.randint(0, 2, img.shape[:2])
            return (img, [(top_left_corner, "left corner"), (random_mask, "random")])

        iface = gr.Interface(mask, "image", gr.AnnotatedImage())
        output = iface("test/test_files/bus.png")
        output_img, (mask1, _) = output["image"], output["annotations"]
        input_img = PIL.Image.open("test/test_files/bus.png")
        output_img = PIL.Image.open(output_img)
        mask1_img = PIL.Image.open(mask1["image"])

        assert output_img.size == input_img.size
        assert mask1_img.size == input_img.size
