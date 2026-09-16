import gradio as gr
from gradio.media import get_image, get_model3d

with gr.Blocks() as demo:
    a = gr.Number(
        value=5,
        minimum=0,
        maximum=10,
        label="Input A",
        info="Enter a number between 0 and 10",
    )
    output_a = gr.JSON(label="Output", elem_id="output")
    with gr.Row():
        show_value_btn = gr.Button("Show Value")
        double_btn = gr.Button("Double Value and Maximum")
        reset_btn = gr.Button("Reset")

    def process_with_props(x: gr.Number):
        return {
            "value": x.value,
            "maximum": x.maximum,
            "minimum": x.minimum,
        }

    show_value_btn.click(process_with_props, a, output_a)

    def double_value_and_max(x: gr.Number):
        x.maximum *= 2  # type: ignore
        x.value = (x.value or 0) * 2
        x.info = f"Enter a number between 0 and {x.maximum}"
        return x

    double_btn.click(double_value_and_max, a, a).then(process_with_props, a, output_a)

    def reset(x: gr.Number):
        x.maximum = 10
        x.value = 5
        x.info = "Enter a number between 0 and 10"
        return x

    reset_btn.click(reset, a, a).then(process_with_props, a, output_a)

    # Image component demo
    gr.Markdown("## Image Component Props")
    b = gr.Image(
        value=get_image("cheetah.jpg"),
        label="Input Image",
        width=300,
        height=300,
        type="filepath",
    )
    output_b = gr.JSON(label="Image Props Output", elem_id="image-output")
    with gr.Row():
        show_image_props_btn = gr.Button("Show Image Props")
        change_image_size_btn = gr.Button("Change Image Size")
        reset_image_btn = gr.Button("Reset Image")

    def show_image_props(x: gr.Image):
        return {
            "value": x.value if x.value is None else str(x.value),
            "width": x.width,
            "height": x.height,
            "type": x.type,
        }

    show_image_props_btn.click(show_image_props, b, output_b)

    def change_image_size(x: gr.Image):
        x.width = 400
        x.height = 400
        return x

    change_image_size_btn.click(change_image_size, b, b).then(
        show_image_props, b, output_b
    )

    def reset_image(x: gr.Image):
        x.width = 300
        x.height = 300
        x.value = get_image("cheetah.jpg")
        return x

    reset_image_btn.click(reset_image, b, b).then(show_image_props, b, output_b)

    gr.Markdown("## Model3D Component Props")
    STATIC_CAMERA = (0, 30, 200)
    EDITABLE_CAMERA = (45, 30, 250)
    model = gr.Model3D(
        value=get_model3d("Fox.gltf"),
        camera_position=STATIC_CAMERA,
        interactive=False,
        elem_id="model3d-props",
    )
    editable_model = gr.Model3D(
        value=get_model3d("Fox.gltf"),
        camera_position=EDITABLE_CAMERA,
        display_mode="point_cloud",
        interactive=True,
        elem_id="model3d-editable",
    )
    model_output = gr.JSON(label="Model3D Props", elem_id="model3d-output")
    show_model_props_btn = gr.Button("Show Model3D Props")
    reset_model_camera_btn = gr.Button("Reset Model3D Camera")

    def show_model_props(x: gr.Model3D, y: gr.Model3D):
        return {
            "static": x.camera_position,
            "editable": y.camera_position,
            "static_exact": list(x.camera_position) == list(STATIC_CAMERA),
            "editable_exact": list(y.camera_position) == list(EDITABLE_CAMERA),
        }

    show_model_props_btn.click(show_model_props, [model, editable_model], model_output)
    reset_model_camera_btn.click(
        lambda: (
            gr.Model3D(camera_position=STATIC_CAMERA),
            gr.Model3D(camera_position=EDITABLE_CAMERA),
        ),
        None,
        [model, editable_model],
    )

    gr.Markdown("## ImageSlider Component Props")
    SLIDER_POSITION = 30
    slider = gr.ImageSlider(
        value=(get_image("cheetah.jpg"), get_image("cheetah.jpg")),
        slider_position=SLIDER_POSITION,
        interactive=False,
        elem_id="imageslider-props",
    )
    slider_output = gr.JSON(label="ImageSlider Props", elem_id="imageslider-output")
    show_slider_props_btn = gr.Button("Show Slider Props")
    reset_slider_btn = gr.Button("Restore Slider Position")

    def show_slider_props(x: gr.ImageSlider):
        return {
            "slider_position": x.slider_position,
            "exact": x.slider_position == SLIDER_POSITION,
        }

    show_slider_props_btn.click(show_slider_props, slider, slider_output)
    reset_slider_btn.click(
        lambda: gr.ImageSlider(slider_position=SLIDER_POSITION), None, slider
    )


if __name__ == "__main__":
    demo.launch()
