import gradio as gr

with gr.Blocks() as demo:
    with gr.Tab("Default ImageEditor"):
        im = gr.ImageEditor(value="./cheetah.jpg", interactive=True, fixed_canvas=True)
    with gr.Tab("Brush Options"):
        with gr.Row():
            with gr.Column():
                image_editor = gr.ImageEditor(
                    value="./cheetah.jpg",
                    interactive=True,
                    fixed_canvas=True,
                    brush=gr.Brush(
                        default_size=10,
                        default_color="#000000",
                        colors=[
                            "#FFA50050",
                            "#FF0000",
                            ("#00FF00", 0.5),
                            ("rgba(255, 255, 0, 0.5)", 0.5),
                            "rgba(255, 0, 0, 0.5)",
                            "pink",
                            "hsla(300, 100%, 50%, 0.5)",
                            ("hsl(300, 100%, 50%)", 0.8),
                            ("crimson", 0.5),
                            ("#000080", 1),
                        ],
                    ),
                    eraser=gr.Eraser(default_size=10),
                )
                image_editor.apply(fn=lambda x: print(x), inputs=[image_editor])
            with gr.Column():
                with gr.Group():
                    brush_size = gr.Slider(
                        minimum=1,
                        maximum=100,
                        value=10,
                        label="Brush Size",
                    )
                    brush_opacity = gr.Slider(
                        minimum=0,
                        maximum=100,
                        value=50,
                        label="Brush Opacity",
                    )
                    brush_color = gr.ColorPicker(value="#000000", label="Brush Color")

                with gr.Group():
                    eraser_size = gr.Slider(
                        minimum=1,
                        maximum=100,
                        value=10,
                        label="Eraser Size",
                    )

                update_btn = gr.Button("Apply Settings")

                status_msg = gr.Markdown(
                    value="**Adjust settings and click Apply.**",
                )

        def update_editor_settings(size, opacity, color, e_size):

            return (
                gr.ImageEditor(
                    brush=gr.Brush(
                        default_size=size,
                        default_color=(color, opacity / 100),
                        colors=[
                            "#FFA50050",
                            "#FF0000",
                            ("#00FF00", 0.5),
                            ("rgba(255, 255, 0, 0.5)", 0.5),
                            "rgba(255, 0, 0, 0.5)",
                            "pink",
                            "hsla(300, 100%, 50%, 0.5)",
                            ("hsl(300, 100%, 50%)", 0.8),
                            ("crimson", 0.5),
                            ("#000080", 1),
                        ],
                    ),
                    eraser=gr.Eraser(default_size=e_size),
                ),
                f'### Settings applied:\n\n- `Brush.default_size={size}`\n- `Brush.default_color=("{color}", {opacity / 100})`\n- `Eraser.default_size={e_size}`',
            )

        update_btn.click(
            update_editor_settings,
            inputs=[brush_size, brush_opacity, brush_color, eraser_size],
            outputs=[image_editor, status_msg],
        )

        def update_status(size=None, opacity=None, color=None, e_size=None):
            changes = []
            if size is not None:
                changes.append(f"`Brush.default_size={size}`")
            if opacity is not None:
                changes.append(f"`Brush.default_color=('{color}', {opacity / 100})`")
            if color is not None:
                changes.append(f"`Brush.default_color=('{color}', {opacity / 100})`")
            if e_size is not None:
                changes.append(f"`Eraser.default_size={e_size}`")

            if changes:
                return (
                    "Settings changed:\n\n"
                    + "- "
                    + "\n- ".join(changes)
                    + "\n\n**Click Apply to update.**"
                )
            return ""

        brush_size.change(
            fn=update_status,
            inputs=[brush_size, brush_opacity, brush_color, eraser_size],
            outputs=status_msg,
        )
        brush_opacity.change(
            fn=update_status,
            inputs=[brush_size, brush_opacity, brush_color, eraser_size],
            outputs=status_msg,
        )
        brush_color.change(
            fn=update_status,
            inputs=[brush_size, brush_opacity, brush_color, eraser_size],
            outputs=status_msg,
        )
        eraser_size.change(
            fn=update_status,
            inputs=[brush_size, brush_opacity, brush_color, eraser_size],
            outputs=status_msg,
        )
    with gr.Tab("Layer Options"):
        with gr.Row():
            with gr.Column():
                im = gr.ImageEditor(
                    value="./cheetah.jpg",
                    interactive=True,
                    layers=gr.LayerOptions(
                        allow_additional_layers=False, layers=["Mask"]
                    ),
                )
            with gr.Column():
                disable_layers = gr.Checkbox(value=False, label="Disable Layers")
                allow_additional_layers = gr.Checkbox(
                    value=True, label="Allow Additional Layers"
                )
                layer = gr.Dropdown(
                    choices=["Mask", "Mask 2"],
                    value="Mask",
                    label="Layer",
                    multiselect=True,
                    interactive=True,
                    allow_custom_value=True,
                )
                gr.Checkbox(value=True, label="Allow Additional Layers")
                update_layer_btn = gr.Button("Update Layer Options")
                status_msg = gr.Markdown(value="**Adjust settings and click Apply.**")

                def update_layer_options(
                    disable_layers, allow_additional_layers, layer
                ):
                    print(
                        "update_layer_options",
                        disable_layers,
                        allow_additional_layers,
                        layer,
                    )
                    return (
                        gr.ImageEditor(
                            value="./cheetah.jpg",
                            interactive=True,
                            layers=(
                                False
                                if disable_layers
                                else gr.LayerOptions(
                                    allow_additional_layers=allow_additional_layers,
                                    layers=layer,
                                )
                            ),
                        ),
                        f"### Settings applied:\n\n- `LayerOptions=False`\n- `LayerOptions.allow_additional_layers={allow_additional_layers}`\n- `LayerOptions.layers={layer}`",
                    )

                update_layer_btn.click(
                    update_layer_options,
                    inputs=[disable_layers, allow_additional_layers, layer],
                    outputs=[im, status_msg],
                )

                def update_status(disable_layers, allow_additional_layers, layer):
                    changes = []
                    if disable_layers is not None:
                        changes.append(
                            f"`LayerOptions.disable_layers={disable_layers}`"
                        )
                    if allow_additional_layers is not None:
                        changes.append(
                            f"`LayerOptions.allow_additional_layers={allow_additional_layers}`"
                        )
                    if layer is not None:
                        changes.append(f"`LayerOptions.layers={layer}`")

                    if changes:
                        return (
                            "Settings changed:\n\n"
                            + "- "
                            + "\n- ".join(changes)
                            + "\n\n**Click Apply to update.**"
                        )
                    return ""

    with gr.Tab("ImageEditor Templates"):
        gr.ImageMask(value="./cheetah.jpg", interactive=True)
        gr.Paint(interactive=True)
        gr.Sketchpad(interactive=True)

if __name__ == "__main__":
    demo.launch()
