import gradio as gr
import cv2
import os
from pathlib import Path
import atexit

current_dir = Path(__file__).resolve().parent


def delete_files():
    for p in Path(current_dir).glob("*.ts"):
        p.unlink()
    for p in Path(current_dir).glob("*.mp4"):
        p.unlink()


atexit.register(delete_files)


def process_video(input_video, stream_as_mp4):
    cap = cv2.VideoCapture(input_video)

    video_codec = cv2.VideoWriter_fourcc(*"mp4v") if stream_as_mp4 else cv2.VideoWriter_fourcc(*"x264")  # type: ignore
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    iterating, frame = cap.read()

    n_frames = 0
    n_chunks = 0
    name = str(current_dir / f"output_{n_chunks}{'.mp4' if stream_as_mp4 else '.ts'}")
    segment_file = cv2.VideoWriter(name, video_codec, fps, (width, height))  # type: ignore

    while iterating:

        # flip frame vertically
        frame = cv2.flip(frame, 0)
        display_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        segment_file.write(display_frame)
        n_frames += 1
        if n_frames == 3 * fps:
            n_chunks += 1
            segment_file.release()
            n_frames = 0
            yield name
            name = str(
                current_dir / f"output_{n_chunks}{'.mp4' if stream_as_mp4 else '.ts'}"
            )
            segment_file = cv2.VideoWriter(name, video_codec, fps, (width, height))  # type: ignore

        iterating, frame = cap.read()

    segment_file.release()
    yield name


with gr.Blocks() as demo:
    gr.Markdown("# Video Streaming Out 📹")
    with gr.Row():
        with gr.Column():
            input_video = gr.Video(label="input")
            checkbox = gr.Checkbox(label="Stream as MP4 file?", value=False)
        with gr.Column():
            processed_frames = gr.Video(
                label="stream",
                streaming=True,
                autoplay=True,
                elem_id="stream_video_output",
            )
    with gr.Row():
        process_video_btn = gr.Button("process video")

    process_video_btn.click(process_video, [input_video, checkbox], [processed_frames])

    gr.Examples(
        [
            [
                os.path.join(
                    os.path.dirname(__file__),
                    "video/compliment_bot_screen_recording_3x.mp4",
                ),
                False,
            ],
            [
                os.path.join(
                    os.path.dirname(__file__),
                    "video/compliment_bot_screen_recording_3x.mp4",
                ),
                True,
            ],
        ],
        [input_video, checkbox],
        fn=process_video,
        outputs=processed_frames,
        cache_examples=False,
    )


if __name__ == "__main__":
    demo.launch()
