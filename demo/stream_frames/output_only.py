import gradio as gr
import cv2
import numpy as np

def process_video(input_video):
    # i = 0
    # while True:
    #     yield np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8), i
    #     i += 1
    cap = cv2.VideoCapture("/Users/freddy/Pictures/bark_demo.mp4")

    output_path = "output.mp4"

    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    video = cv2.VideoWriter(output_path, cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))

    iterating, frame = cap.read()
    while iterating:
        print("ITERATING")

        # flip frame vertically
        frame = cv2.flip(frame, 0)
        display_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        video.write(frame)
        yield display_frame

        iterating, frame = cap.read()

    video.release()
    yield display_frame

with gr.Blocks() as demo:
    with gr.Row():
        input_video = gr.Video(label="input")
        num = gr.Number(label="number")
        output_video = gr.Video(label="output", streaming=True)

    with gr.Row():
        process_video_btn = gr.Button("process video")

    process_video_btn.click(process_video, input_video, [output_video])

demo.launch()