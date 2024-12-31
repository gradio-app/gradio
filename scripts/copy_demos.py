"""
We pull in a select number of spaces and build them into a single FastAPI application to preview them on HF Spaces.
The script that is run in CI is located at: https://github.com/gradio-app/github/blob/main/packages/copy-demos/index.ts
This is the Python version of that script for local use.
"""

import argparse
import os
import pathlib
import shutil
import textwrap


def copy_all_demos(source_dir: str, dest_dir: str):
    demos_to_copy = [
        "audio_debugger",
        "blocks_essay",
        "blocks_group",
        "blocks_js_methods",
        "blocks_layout",
        "blocks_multiple_event_triggers",
        "blocks_update",
        "calculator",
        "cancel_events",
        "chatbot_multimodal",
        "chatinterface_streaming_echo",
        "clear_components",
        "code",
        "fake_gan",
        "fake_diffusion_with_gif",
        "file_explorer_component_events",
        "gradio_pdf_demo",
        "image_mod_default_image",
        "image_editor_events",
        "image_segmentation",
        "interface_random_slider",
        "kitchen_sink",
        "kitchen_sink_random",
        "login_with_huggingface",
        "matrix_transpose",
        "mini_leaderboard",
        "model3D",
        "native_plots",
        "reverse_audio",
        "stt_or_tts",
        "stream_audio",
        "stream_audio_out",
        "stream_frames",
        "video_component",
        "zip_files",
    ]
    for demo in demos_to_copy:
        shutil.copytree(
            os.path.join(source_dir, demo),
            os.path.join(dest_dir, demo),
            dirs_exist_ok=True,
        )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Copy all demos to all_demos and update requirements"
    )
    parser.add_argument("gradio_version", type=str, help="Gradio")
    parser.add_argument("gradio_client_version", type=str, help="Gradio Client Version")
    args = parser.parse_args()

    source_dir = pathlib.Path(pathlib.Path(__file__).parent, "..", "demo")
    dest_dir = pathlib.Path(
        pathlib.Path(__file__).parent, "..", "demo", "all_demos", "demos"
    )
    copy_all_demos(source_dir, dest_dir)
    reqs_file_path = pathlib.Path(
        pathlib.Path(__file__).parent, "..", "demo", "all_demos", "requirements.txt"
    )
    requirements = f"""
    gradio_client=={args.gradio_client_version}
    gradio=={args.gradio_version}
    matplotlib
    pypistats==1.1.0
    plotly
    altair
    vega_datasets
    """
    pathlib.Path(reqs_file_path).write_text(textwrap.dedent(requirements))
