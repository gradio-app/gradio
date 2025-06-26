import gradio as gr
import pandas as pd
import numpy as np

# Sample data for components
sample_df = pd.DataFrame(
    {
        "Name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],
        "Age": [25, 30, 35, 28, 32],
        "City": ["New York", "London", "Paris", "Tokyo", "Berlin"],
        "Score": [95.5, 87.2, 92.1, 88.9, 91.3],
    }
)


def process_audio(audio):
    if audio is None:
        return "No audio uploaded"
    return f"Audio file received: {audio}"


def process_image(image):
    if image is None:
        return "No image uploaded"
    return "Image processed successfully!"


def process_3d_model(model):
    if model is None:
        return "No 3D model uploaded"
    return f"3D model file received: {model}"


def process_video(video):
    if video is None:
        return "No video uploaded"
    return f"Video file received: {video}"


def chat_response(message, history):
    if history is None:
        history = []
    response = f"You said: {message}. This is a demo response!"
    history.append([message, response])
    return history, ""


def update_dataframe(df, action):
    if action == "Add Row":
        new_row = pd.DataFrame(
            {"Name": ["New User"], "Age": [25], "City": ["New City"], "Score": [90.0]}
        )
        return pd.concat([df, new_row], ignore_index=True)
    elif action == "Clear":
        return pd.DataFrame({"Name": [], "Age": [], "City": [], "Score": []})
    return df


with gr.Blocks(title="Multi-Component Demo with 10 Tabs") as demo:
    gr.Markdown("# 🎛️ Multi-Component Gradio Demo")
    gr.Markdown(
        "This demo showcases various Gradio components across 10 interactive tabs."
    )

    with gr.Tabs() as main_tabs:
        with gr.Tab("📝 Text", id="tab_text"):
            gr.Markdown("### Text Processing")
            text_input = gr.Textbox(
                label="Input Text",
                placeholder="Enter your text here...",
                lines=3,
                interactive=True,
            )
            text_area = gr.TextArea(
                label="Large Text Area",
                placeholder="Enter longer text...",
                lines=5,
                interactive=True,
            )
            text_output = gr.Textbox(label="Processed Text", interactive=True)

            def process_text(text1, text2):
                combined = f"Text 1: {text1}\nText 2: {text2}\nTotal characters: {len(text1) + len(text2)}"
                return combined

            text_input.change(
                process_text, inputs=[text_input, text_area], outputs=text_output
            )

        # Tab 1: 3D Model Viewer
        with gr.Tab("🎯 3D Model", id="tab_3d"):
            gr.Markdown("### 3D Model Viewer")
            model_input = gr.Model3D(
                label="Upload 3D Model", interactive=True, height=400
            )
            model_output = gr.Textbox(label="Model Status", interactive=True)
            model_input.change(
                process_3d_model, inputs=model_input, outputs=model_output
            )

        # Tab 2: Image Editor
        with gr.Tab("🖼️ Image Editor", id="tab_image_editor"):
            gr.Markdown("### Image Editor")
            image_editor = gr.ImageEditor(
                label="Edit Image",
                interactive=True,
                height=400,
            )
            editor_output = gr.Textbox(label="Editor Status", interactive=True)
            image_editor.change(
                lambda x: "Image edited!" if x else "No image",
                inputs=image_editor,
                outputs=editor_output,
            )

        # Tab 3: Audio
        with gr.Tab("🎵 Audio", id="tab_audio"):
            gr.Markdown("### Audio Component")
            with gr.Row():
                audio_input = gr.Audio(
                    label="Upload Audio", interactive=True, type="filepath"
                )
                audio_mic = gr.Audio(
                    label="Record Audio", interactive=True, sources=["microphone"]
                )
            audio_output = gr.Textbox(label="Audio Status", interactive=True)
            audio_input.change(process_audio, inputs=audio_input, outputs=audio_output)

        # Tab 4: Image
        with gr.Tab("📸 Image", id="tab_image"):
            gr.Markdown("### Image Component")
            with gr.Row():
                image_input = gr.Image(
                    label="Upload Image", interactive=True, height=300
                )
                image_webcam = gr.Image(
                    label="Webcam Image", interactive=True, sources=["webcam"]
                )
            image_output = gr.Textbox(label="Image Status", interactive=True)
            image_input.change(process_image, inputs=image_input, outputs=image_output)

        # Tab 5: Dataframe
        with gr.Tab("📊 Dataframe", id="tab_dataframe"):
            gr.Markdown("### Interactive Dataframe")
            df_component = gr.Dataframe(
                value=sample_df,
                label="Data Table",
                interactive=True,
                wrap=True,
            )
            with gr.Row():
                add_row_btn = gr.Button("Add Row", interactive=True)
                clear_btn = gr.Button("Clear Data", interactive=True)
            df_status = gr.Textbox(label="Dataframe Status", interactive=True)

            add_row_btn.click(
                lambda df: update_dataframe(df, "Add Row"),
                inputs=df_component,
                outputs=df_component,
            )
            clear_btn.click(
                lambda df: update_dataframe(df, "Clear"),
                inputs=df_component,
                outputs=df_component,
            )

        # Tab 6: Text Processing

        # Tab 7: File Upload
        with gr.Tab("📁 Files", id="tab_files"):
            gr.Markdown("### File Upload")
            file_input = gr.File(
                label="Upload Files",
                interactive=True,
                file_count="multiple",
                file_types=["image", "video", "audio", ".pdf", ".txt"],
            )
            file_output = gr.Textbox(label="File Status", interactive=True)

            def process_files(files):
                if files is None or len(files) == 0:
                    return "No files uploaded"
                file_names = [f.name for f in files]
                return f"Uploaded {len(files)} files: {', '.join(file_names)}"

            file_input.change(process_files, inputs=file_input, outputs=file_output)

        # Tab 8: Chatbot
        with gr.Tab("💬 Chatbot", id="tab_chatbot"):
            gr.Markdown("### Interactive Chatbot")

            def echo(message, history):
                return message

            gr.ChatInterface(
                fn=echo,
                type="messages",
                examples=["hello", "hola", "merhaba"],
                title="Echo Bot",
            )

        # Tab 9: Gallery
        with gr.Tab("🖼️ Gallery", id="tab_gallery"):
            gr.Markdown("### Image Gallery")
            gallery = gr.Gallery(
                label="Image Gallery",
                columns=3,
                rows=2,
                height="400px",
                interactive=True,
                allow_preview=True,
            )
            gallery_input = gr.File(
                label="Add Images to Gallery",
                file_count="multiple",
                file_types=["image"],
                interactive=True,
            )
            gallery_status = gr.Textbox(label="Gallery Status", interactive=True)

            def update_gallery(files):
                if files is None:
                    return [], "No images uploaded"
                return files, f"Gallery updated with {len(files)} images"

            gallery_input.change(
                update_gallery, inputs=gallery_input, outputs=[gallery, gallery_status]
            )

        # Tab 10: Video
        with gr.Tab("🎬 Video", id="tab_video"):
            gr.Markdown("### Video Component")
            video_input = gr.Video(label="Upload Video", interactive=True, height=400)
            video_webcam = gr.Video(
                label="Record Video", interactive=True, sources=["webcam"]
            )
            video_output = gr.Textbox(label="Video Status", interactive=True)
            video_input.change(process_video, inputs=video_input, outputs=video_output)

    # Global controls
    gr.Markdown("---")
    with gr.Row():
        selected_tab = gr.Textbox(label="Currently Selected Tab", interactive=True)
        tab_counter = gr.Number(
            label="Tab Number (1-10)", value=1, minimum=1, maximum=10, interactive=True
        )

    # Tab selection functionality
    def get_selected_tab(evt: gr.SelectData):
        tab_names = [
            "3D Model",
            "Image Editor",
            "Audio",
            "Image",
            "Dataframe",
            "Text",
            "Files",
            "Chatbot",
            "Gallery",
            "Video",
        ]
        return f"Selected: {evt.value}"

    # Add select events for all tabs
    tabs = [
        main_tabs
    ]  # You would need to reference individual tabs for this to work properly

    gr.Markdown("### 🎯 Features:")
    gr.Markdown("""
    - **Tab 1**: 3D Model viewer with file upload
    - **Tab 2**: Image editor with drawing tools
    - **Tab 3**: Audio upload and recording
    - **Tab 4**: Image upload and webcam capture
    - **Tab 5**: Interactive dataframe with CRUD operations
    - **Tab 6**: Text processing with multiple input types
    - **Tab 7**: Multi-file upload with various formats
    - **Tab 8**: Interactive chatbot interface
    - **Tab 9**: Image gallery with preview
    - **Tab 10**: Video upload and recording
    """)

if __name__ == "__main__":
    demo.launch()
