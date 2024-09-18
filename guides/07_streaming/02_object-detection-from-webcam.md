# Object Detection from a Webcam Stream

Tags: VISION, STREAMING, WEBCAM

In this guide we'll use Yolo-v10 to do near-real time object detection in Gradio from a user's webcam.
Along the way, we'll be using the latest streaming features introduced in Gradio 5.0.

## Setting up the Model

First, we'll follow the installation instructions for [Yolov10n](https://huggingface.co/jameslahm/yolov10n) on the Hugging Face hub. 

Run `pip install git+https://github.com/THU-MIG/yolov10.git` in your virtual environment.

Then, we'll download the model from the Hub (`ultralytics` is the library we've just installed).

```python
from ultralytics import YOLOv10

model = YOLOv10.from_pretrained('jameslahm/yolov10n')
```

We are using the `yolov10-n` variant because it has the lowest latency. See the [Performance](https://github.com/THU-MIG/yolov10?tab=readme-ov-file#performance) section of the README in the github repository.


## The Inference Function

Our inference function will accept a PIL image from the webcam as well as a desired conference threshold.
Object detection models like YOLO identify many objects and assign a confidence score to each object. The lower the confidence, the higher the chance of a false positive. So we will let our users play with the conference threshold.

```python
def yolov10_inference(image, conf_threshold):
    width, _ = image.size
    results = model.predict(source=image, imgsz=width, conf=conf_threshold)
    annotated_image = results[0].plot()
    return annotated_image[:, :, ::-1]
```

We will use the `plot` method to draw a bounding box around each detected object. YoloV10 asses images are in the BGR color format, so we will flip them to be in the expected RGB format of web browsers.

## The Gradio Demo

The Gradio demo will be pretty straightforward but we'll do a couple of things that are specific to streaming:

* The user's webcam will be both an input and an output. That way, the user will only see their stream with the detected objects.
* We'll use the `time_limit` and `stream_every` parameters of the `stream` event. The `time_limit` parameter will mean that we'll process each user's stream for that amount of time. In a multi-user setting, such as on Spaces, this means that after this period of time, the next user in the queue will be able to use the demo. The `stream_every` function will control how frequently the webcam stream is sent to the server.

In addition, we'll apply some custom css so that the webcam and slider are centered on the page.

```python
css=""".my-group {max-width: 600px !important; max-height: 600 !important;}
                      .my-column {display: flex !important; justify-content: center !important; align-items: center !important};"""


with gr.Blocks(css=css) as app:
    gr.HTML(
        """
    <h1 style='text-align: center'>
    YOLOv10 Webcam Stream
    </h1>
    """)
    gr.HTML(
        """
        <h3 style='text-align: center'>
        <a href='https://arxiv.org/abs/2405.14458' target='_blank'>arXiv</a> | <a href='https://github.com/THU-MIG/yolov10' target='_blank'>github</a>
        </h3>
        """)
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
            time_limit=30
        )
```


## Conclusion

You can check out our demo hosted on Hugging Face Spaces [here](https://huggingface.co/spaces/gradio/YOLOv10-webcam-stream). 

It is also embedded on this page below

$demo_YOLOv10-webcam-stream