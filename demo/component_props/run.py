import gradio as gr

with gr.Blocks() as demo:
    a = gr.Number(value=5, minimum=0, maximum=10, label="Input A", info="Enter a number between 0 and 10")
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
        x.maximum *= 2
        x.value = (x.value or 0) * 2
        x.info = f"Enter a number between 0 and {x.maximum}"
        return x

    double_btn.click(double_value_and_max, a, a).then(
        process_with_props, a, output_a
    )

    def reset(x: gr.Number):
        x.maximum = 10
        x.value = 5
        x.info = "Enter a number between 0 and 10"
        return x

    reset_btn.click(reset, a, a).then(
        process_with_props, a, output_a
    )

    # Image component demo
    gr.Markdown("## Image Component Props")
    b = gr.Image(value="cheetah.jpg", label="Input Image", width=300, height=300, type="filepath")
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
        x.value = "cheetah.jpg"
        return x

    reset_image_btn.click(reset_image, b, b).then(
        show_image_props, b, output_b
    )


if __name__ == "__main__":
    demo.launch()
