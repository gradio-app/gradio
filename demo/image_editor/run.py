# import gradio as gr
# import time
# import os
# import numpy as np
# from PIL import Image


# def sleep(im):
#     time.sleep(5)
#     return [im["background"], im["layers"][0], im["layers"][1], im["composite"]]


# def predict(im):
#     return im["composite"]


# def save_to_disk(im):
#     """
#     Save all components of the image editor to disk.
#     Returns the paths of the saved files.
#     """
#     # Create output directory if it doesn't exist
#     output_dir = "saved_images"
#     os.makedirs(output_dir, exist_ok=True)

#     # Generate a timestamp for unique filenames
#     timestamp = int(time.time())

#     saved_paths = []

#     try:
#         # Save background
#         if im["background"] is not None:
#             bg_path = os.path.join(output_dir, f"background_{timestamp}.png")
#             Image.fromarray(im["background"]).save(bg_path)
#             saved_paths.append(f"Background: {bg_path}")

#         # Save layers
#         for i, layer in enumerate(im["layers"]):
#             if layer is not None:
#                 layer_path = os.path.join(output_dir, f"layer_{i}_{timestamp}.png")
#                 Image.fromarray(layer).save(layer_path)
#                 saved_paths.append(f"Layer {i+1}: {layer_path}")

#         # Save composite
#         if im["composite"] is not None:
#             composite_path = os.path.join(output_dir, f"composite_{timestamp}.png")
#             Image.fromarray(im["composite"]).save(composite_path)
#             saved_paths.append(f"Composite: {composite_path}")

#         if saved_paths:
#             return (
#                 f"✅ Successfully saved {len(saved_paths)} images to '{output_dir}':\n"
#                 + "\n".join(saved_paths)
#             )
#         else:
#             return "❗ No images to save. Please edit the image first."

#     except Exception as e:
#         return f"❌ Error saving images: {str(e)}"


# def load_composite(composite_file):
#     """
#     Load a composite image into the image editor.
#     Returns a dictionary in the format expected by the image editor and a status message.
#     """
#     try:
#         if composite_file is None:
#             return None, "No file selected. Please select a composite image file."

#         # Open the image file
#         img = Image.open(composite_file.name)
#         img_array = np.array(img)

#         # Return the image as the composite
#         return (
#             {
#                 "background": None,  # Will be auto-filled by ImageEditor
#                 "layers": [],  # Will be auto-filled by ImageEditor
#                 "composite": img_array,
#             },
#             f"✅ Successfully loaded composite image: {os.path.basename(composite_file.name)}",
#         )
#     except Exception as e:
#         error_msg = f"❌ Error loading composite image: {str(e)}"
#         return None, error_msg


# def load_background_and_layers(background_file, layer1_file, layer2_file):
#     """
#     Load background and layer images into the image editor.
#     Returns a dictionary in the format expected by the image editor and a status message.
#     """
#     try:
#         # Check if at least one file is provided
#         if background_file is None and layer1_file is None and layer2_file is None:
#             return None, "No files selected. Please select at least one image file."

#         # Initialize the result dictionary
#         result = {
#             "background": None,
#             "layers": [],
#             "composite": None,  # Will be auto-computed by ImageEditor
#         }

#         loaded_files = []

#         # Load background if provided
#         if background_file is not None:
#             img = Image.open(background_file.name)
#             result["background"] = np.array(img)
#             loaded_files.append(f"background: {os.path.basename(background_file.name)}")

#         # Load layers if provided
#         for i, layer_file in enumerate([layer1_file, layer2_file]):
#             if layer_file is not None:
#                 img = Image.open(layer_file.name)
#                 result["layers"].append(np.array(img))
#                 loaded_files.append(f"layer {i+1}: {os.path.basename(layer_file.name)}")
#             else:
#                 # Add an empty layer to maintain the structure
#                 result["layers"].append(None)

#         return (
#             result,
#             f"✅ Successfully loaded {len(loaded_files)} images:\n"
#             + "\n".join(loaded_files),
#         )
#     except Exception as e:
#         error_msg = f"❌ Error loading images: {str(e)}"
#         return None, error_msg


# # New function to update ImageEditor settings
# def update_editor_settings(
#     canvas_width,
#     canvas_height,
#     fixed_canvas,
#     border_region,
#     show_fullscreen,
#     show_download,
#     image_mode,
#     enable_layers,
#     brush_preset=None,
#     eraser_preset=None,
# ):
#     """Update ImageEditor settings and return a configuration summary"""
#     # Handle brush presets
#     brush = None
#     if brush_preset == "default":
#         brush = gr.Brush()
#     elif brush_preset == "thin_red":
#         brush = gr.Brush(default_size=5, colors=["#FF0000"], default_color="#FF0000")
#     elif brush_preset == "thick_blue":
#         brush = gr.Brush(default_size=20, colors=["#0000FF"], default_color="#0000FF")
#     elif brush_preset == "rainbow":
#         brush = gr.Brush(
#             default_size=10,
#             colors=[
#                 "#FF0000",
#                 "#FFA500",
#                 "#FFFF00",
#                 "#00FF00",
#                 "#0000FF",
#                 "#4B0082",
#                 "#9400D3",
#             ],
#             default_color="#FF0000",
#         )
#     elif brush_preset == "fixed_palette":
#         brush = gr.Brush(
#             default_size=15,
#             colors=["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"],
#             default_color="#FF0000",
#             color_mode="fixed",
#         )
#     elif brush_preset == "disabled":
#         brush = False

#     # Handle eraser presets
#     eraser = None
#     if eraser_preset == "default":
#         eraser = gr.Eraser()
#     elif eraser_preset == "small":
#         eraser = gr.Eraser(default_size=5)
#     elif eraser_preset == "medium":
#         eraser = gr.Eraser(default_size=15)
#     elif eraser_preset == "large":
#         eraser = gr.Eraser(default_size=30)
#     elif eraser_preset == "disabled":
#         eraser = False

#     # Create a new ImageEditor with the updated settings
#     new_editor = gr.ImageEditor(
#         fixed_canvas=fixed_canvas,
#         border_region=border_region,
#         canvas_size=[canvas_width, canvas_height],
#         type="numpy",
#         show_fullscreen_button=show_fullscreen,
#         show_download_button=show_download,
#         image_mode=image_mode,
#         layers=enable_layers,
#         brush=brush,
#         eraser=eraser,
#     )

#     # Return a summary of the settings for display
#     settings_summary = f"""
#     Editor settings updated successfully!

#     Canvas Size: {canvas_width} × {canvas_height} pixels
#     Fixed Canvas: {"Enabled" if fixed_canvas else "Disabled"}
#     Border Region: {border_region} pixels
#     Fullscreen Button: {"Visible" if show_fullscreen else "Hidden"}
#     Download Button: {"Visible" if show_download else "Hidden"}
#     Image Mode: {image_mode}
#     Layers: {"Enabled" if enable_layers else "Disabled"}
#     """

#     # Add brush and eraser information to the summary
#     if brush_preset:
#         settings_summary += f"\nBrush Preset: {brush_preset}"
#     if eraser_preset:
#         settings_summary += f"\nEraser Preset: {eraser_preset}"

#     return new_editor, settings_summary


# with gr.Blocks() as demo:
#     gr.Markdown("# Image Editor with Save and Load Functionality")

#     with gr.Row():
#         im = gr.ImageEditor(
#             value="./cheetah.jpg",
#             # fixed_canvas=True,
#             border_region=100,
#             canvas_size=[500, 500],
#             type="numpy",
#             layers=gr.LayerOptions(
#                 allow_additional_layers=False, layers=["Mask", "Mask 2"]
#             ),
#         )
#         im_preview = gr.Image(label="Preview")

#     with gr.Row():
#         with gr.Column(scale=1):
#             gr.Markdown("### Event Counters")
#             n_upload = gr.Number(0, label="Number of upload events", step=1)
#             n_change = gr.Number(0, label="Number of change events", step=1)
#             n_input = gr.Number(0, label="Number of input events", step=1)

#         with gr.Column(scale=2):
#             with gr.Tab("Save Images"):
#                 save_btn = gr.Button(
#                     "Save All Image Components to Disk", variant="primary"
#                 )
#                 save_result = gr.Textbox(label="Save Result", lines=5)

#             with gr.Tab("Load Images"):
#                 gr.Markdown("### Load Composite Image")
#                 composite_file = gr.File(
#                     label="Select Composite Image", file_types=["image"]
#                 )
#                 load_composite_btn = gr.Button("Load Composite", variant="primary")
#                 load_composite_status = gr.Textbox(label="Load Status", lines=2)

#                 gr.Markdown("### Load Background and Layers")
#                 with gr.Row():
#                     background_file = gr.File(
#                         label="Select Background", file_types=["image"]
#                     )
#                     layer1_file = gr.File(label="Select Layer 1", file_types=["image"])
#                     layer2_file = gr.File(label="Select Layer 2", file_types=["image"])
#                 load_bg_layers_btn = gr.Button(
#                     "Load Background and Layers", variant="primary"
#                 )
#                 load_bg_layers_status = gr.Textbox(label="Load Status", lines=3)

#             with gr.Tab("Editor Settings"):
#                 gr.Markdown("### Configure ImageEditor Properties")

#                 with gr.Group():
#                     gr.Markdown("#### Canvas Settings")
#                     with gr.Row():
#                         canvas_width = gr.Slider(
#                             minimum=200,
#                             maximum=1200,
#                             value=600,
#                             step=50,
#                             label="Canvas Width (px)",
#                         )
#                         canvas_height = gr.Slider(
#                             minimum=200,
#                             maximum=1200,
#                             value=600,
#                             step=50,
#                             label="Canvas Height (px)",
#                         )
#                     fixed_canvas = gr.Checkbox(value=True, label="Fixed Canvas Size")
#                     border_region = gr.Slider(
#                         minimum=0,
#                         maximum=200,
#                         value=100,
#                         step=10,
#                         label="Border Region (px)",
#                     )

#                 with gr.Group():
#                     gr.Markdown("#### Display Settings")
#                     with gr.Row():
#                         show_fullscreen = gr.Checkbox(
#                             value=True, label="Show Fullscreen Button"
#                         )
#                         show_download = gr.Checkbox(
#                             value=True, label="Show Download Button"
#                         )

#                     image_mode = gr.Dropdown(
#                         choices=["RGB", "RGBA", "L"], value="RGBA", label="Image Mode"
#                     )
#                     enable_layers = gr.Checkbox(value=True, label="Enable Layers")

#                 with gr.Group():
#                     gr.Markdown("#### Brush Presets")
#                     gr.Markdown("Select a preset to change the brush settings:")
#                     brush_preset = gr.Radio(
#                         choices=[
#                             "default",
#                             "thin_red",
#                             "thick_blue",
#                             "rainbow",
#                             "fixed_palette",
#                             "disabled",
#                         ],
#                         value="default",
#                         label="Brush Preset",
#                     )

#                     gr.Markdown("#### Eraser Presets")
#                     gr.Markdown("Select a preset to change the eraser settings:")
#                     eraser_preset = gr.Radio(
#                         choices=["default", "small", "medium", "large", "disabled"],
#                         value="default",
#                         label="Eraser Preset",
#                     )

#                 update_settings_btn = gr.Button(
#                     "Update Editor Settings", variant="primary"
#                 )
#                 settings_status = gr.Textbox(label="Settings Status", lines=8)

#     im.upload(lambda x: x + 1, outputs=n_upload, inputs=n_upload)
#     im.change(lambda x: x + 1, outputs=n_change, inputs=n_change)
#     im.input(lambda x: x + 1, outputs=n_input, inputs=n_input)
#     im.change(predict, outputs=im_preview, inputs=im, show_progress="hidden")
#     im.apply(predict, outputs=im_preview, inputs=im, show_progress="hidden")

#     # Connect save button to save_to_disk function
#     save_btn.click(save_to_disk, inputs=im, outputs=save_result)

#     # Connect load buttons to their respective functions
#     load_composite_btn.click(
#         load_composite, inputs=[composite_file], outputs=[im, load_composite_status]
#     )

#     load_bg_layers_btn.click(
#         load_background_and_layers,
#         inputs=[background_file, layer1_file, layer2_file],
#         outputs=[im, load_bg_layers_status],
#     )

#     # Connect update settings button
#     update_settings_btn.click(
#         update_editor_settings,
#         inputs=[
#             canvas_width,
#             canvas_height,
#             fixed_canvas,
#             border_region,
#             show_fullscreen,
#             show_download,
#             image_mode,
#             enable_layers,
#             brush_preset,
#             eraser_preset,
#         ],
#         outputs=[im, settings_status],
#     )

# if __name__ == "__main__":
#     demo.launch()


import gradio as gr

with gr.Blocks() as demo:
    with gr.Tab("Default ImageEditor"):
        im = gr.ImageEditor(value="./cheetah.jpg", interactive=True)
    with gr.Tab("Brush Options"):
        with gr.Row():
            with gr.Column():
                image_editor = gr.ImageEditor(
                    value="./cheetah.jpg",
                    interactive=True,
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
                    return (
                        gr.ImageEditor(
                            value="./cheetah.jpg",
                            interactive=True,
                            layers=gr.LayerOptions(
                                allow_additional_layers=allow_additional_layers,
                                layers=layer,
                            ),
                        ),
                        f"### Settings applied:\n\n- `LayerOptions.allow_additional_layers={allow_additional_layers}`\n- `LayerOptions.layers={layer}`",
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


if __name__ == "__main__":
    demo.launch()
