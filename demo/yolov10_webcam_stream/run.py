import gradio as gr

from ultralytics import YOLOv10

model = YOLOv10.from_pretrained("jameslahm/yolov10n")


def yolov10_inference(image, conf_threshold):
    width, _ = image.size
    import time

    start = time.time()
    results = model.predict(source=image, imgsz=width, conf=conf_threshold)
    end = time.time()
    annotated_image = results[0].plot()
    print("time", end - start)
    return annotated_image[:, :, ::-1]


css = """.my-group {max-width: 600px !important; max-height: 600 !important;}
                      .my-column {display: flex !important; justify-content: center !important; align-items: center !important};"""


with gr.Blocks(css=css) as app:
    gr.HTML(
        """
    <h1 style='text-align: center'>
    YOLOv10 Webcam Stream
    </h1>
    """
    )
    gr.HTML(
        """
        <h3 style='text-align: center'>
        <a href='https://arxiv.org/abs/2405.14458' target='_blank'>arXiv</a> | <a href='https://github.com/THU-MIG/yolov10' target='_blank'>github</a>
        </h3>
        """
    )
    with gr.Column(elem_classes=["my-column"]):
        with gr.Group(elem_classes=["my-group"]):
            image = gr.Image(type="pil", label="Image", sources="webcam")
            conf_threshold = gr.Slider(
                label="Confidence Threshold",
                minimum=0.0,
                maximum=1.0,
                step=0.05,
                value=0.30,
            )
        image.stream(
            fn=yolov10_inference,
            inputs=[image, conf_threshold],
            outputs=[image],
            stream_every=0.1,
            time_limit=30,
        )

if __name__ == "__main__":
    app.launch()
