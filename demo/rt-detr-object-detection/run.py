# type: ignore
import spaces
import gradio as gr
import cv2
from PIL import Image
import torch
import time
import numpy as np
import uuid

from transformers import RTDetrForObjectDetection, RTDetrImageProcessor  # type: ignore

from draw_boxes import draw_bounding_boxes

image_processor = RTDetrImageProcessor.from_pretrained("PekingU/rtdetr_r50vd")
model = RTDetrForObjectDetection.from_pretrained("PekingU/rtdetr_r50vd").to("cuda")


SUBSAMPLE = 2


@spaces.GPU
def stream_object_detection(video, conf_threshold):
    cap = cv2.VideoCapture(video)

    video_codec = cv2.VideoWriter_fourcc(*"mp4v")  # type: ignore
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    desired_fps = fps // SUBSAMPLE
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) // 2
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) // 2

    iterating, frame = cap.read()

    n_frames = 0

    name = f"output_{uuid.uuid4()}.mp4"
    segment_file = cv2.VideoWriter(name, video_codec, desired_fps, (width, height))  # type: ignore
    batch = []

    while iterating:
        frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        if n_frames % SUBSAMPLE == 0:
            batch.append(frame)
        if len(batch) == 2 * desired_fps:
            inputs = image_processor(images=batch, return_tensors="pt").to("cuda")

            print(f"starting batch of size {len(batch)}")
            start = time.time()
            with torch.no_grad():
                outputs = model(**inputs)
            end = time.time()
            print("time taken for inference", end - start)

            start = time.time()
            boxes = image_processor.post_process_object_detection(
                outputs,
                target_sizes=torch.tensor([(height, width)] * len(batch)),
                threshold=conf_threshold,
            )

            for _, (array, box) in enumerate(zip(batch, boxes)):
                pil_image = draw_bounding_boxes(
                    Image.fromarray(array), box, model, conf_threshold
                )
                frame = np.array(pil_image)
                # Convert RGB to BGR
                frame = frame[:, :, ::-1].copy()
                segment_file.write(frame)

            batch = []
            segment_file.release()
            yield name
            end = time.time()
            print("time taken for processing boxes", end - start)
            name = f"output_{uuid.uuid4()}.mp4"
            segment_file = cv2.VideoWriter(
                name, video_codec, desired_fps, (width, height)
            )  # type: ignore

        iterating, frame = cap.read()
        n_frames += 1


with gr.Blocks() as demo:
    gr.HTML(
        """
    <h1 style='text-align: center'>
    Video Object Detection with <a href='https://huggingface.co/PekingU/rtdetr_r101vd_coco_o365' target='_blank'>RT-DETR</a>
    </h1>
    """
    )
    with gr.Row():
        with gr.Column():
            video = gr.Video(label="Video Source")
            conf_threshold = gr.Slider(
                label="Confidence Threshold",
                minimum=0.0,
                maximum=1.0,
                step=0.05,
                value=0.30,
            )
        with gr.Column():
            output_video = gr.Video(
                label="Processed Video", streaming=True, autoplay=True
            )

    video.upload(
        fn=stream_object_detection,
        inputs=[video, conf_threshold],
        outputs=[output_video],
    )

    gr.Examples(
        examples=["3285790-hd_1920_1080_30fps.mp4"],
        inputs=[video],
    )

if __name__ == "__main__":
    demo.launch()
