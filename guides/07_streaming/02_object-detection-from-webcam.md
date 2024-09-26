# Real Time Object Detection from a Webcam Stream with WebRTC

Tags: VISION, STREAMING, WEBCAM

In this guide we'll use Yolo-v10 to do real time object detection in Gradio from a user's webcam feed.
Along the way, we'll be using the latest streaming features introduced in Gradio 5.0. You can see the finished product in action below:

![WebRTC Object Detection Demo](https://github.com/user-attachments/assets/4584cec6-8c1a-401b-9b61-a4fe0718b558)


## Setting up

We're going to start by installing all the dependencies. Add the following lines to a `requirements.txt` file and run `pip install -r requirements.txt`:

```bash
opencv-python
twilio
gradio>=5.0
gradio-webrtc
onnxruntime-gpu
```

We'll use the ONNX runtime to speed up YoloV10 inference. This guide will assume you have access to a GPU. If you don't, change `onnxruntime-gpu` to `onnxruntime`. Without a GPU the model will run slower so the demo will appear laggy.

Additionally, we'll use opencv for some image manipulation and the [Gradio WebRTC](https://github.com/freddyaboulton/gradio-webrtc) custom component to use [WebRTC](https://webrtc.org/) under the hood to achieve near-zero latency.

Tip: If you want to deploy this app on any cloud provider, you'll have to use the free twilio api to use their [TURN servers](https://www.twilio.com/docs/stun-turn). So head there and create a free account. If you are not familiar with TURN servers, consult this [guide](https://www.twilio.com/docs/stun-turn/faq#faq-what-is-nat).


## The Inference Function

We'll download the YOLO V10 model from the Hugging Face hub and instantiate a custom inference class to use this model. 

We won't cover the implementation of the inference class in this guide, but the source code is located [here](https://huggingface.co/spaces/freddyaboulton/webrtc-yolov10n/blob/main/inference.py#L9) if you're interested.  

Tip: We are using the `yolov10-n` variant because it has the lowest latency. See the [Performance](https://github.com/THU-MIG/yolov10?tab=readme-ov-file#performance) section of the README in the yolo-v10 github repository.

```python
from huggingface_hub import hf_hub_download
from inference import YOLOv10

model_file = hf_hub_download(
    repo_id="onnx-community/yolov10n", filename="onnx/model.onnx"
)

model = YOLOv10(model_file)


def detection(image, conf_threshold=0.3):
    image = cv2.resize(image, (model.input_width, model.input_height))
    new_image = model.detect_objects(image, conf_threshold)
    return new_image
```

Our inference function called `detection` will accept a numpy array from the webcam as well as a desired conference threshold. Object detection models like YOLO identify many objects and assign a confidence score to each object. The lower the confidence, the higher the chance of a false positive. So we will let our users play with the conference threshold.

The function will return a numpy array corresponding to the same input image with all the detected objects in bounding boxes.


## The Gradio Demo

The Gradio demo will be pretty straightforward but we'll do a couple of things that are specific to this use case:

* We will use the `WebRTC` custom component to ensure the input and output are sent to/from the server with WebRTC. 
* The WebRTC component will be both an input and an output component.
* We'll use the `time_limit` parameter of the `stream` event. The `time_limit` parameter will mean that we'll process each user's stream for that amount of time. In a multi-user setting, such as on Spaces, this means that after this period of time, we'll stop processing the current user's stream and move on to the next. 

In addition, we'll apply some custom css so that the webcam and slider are centered on the page.

```python
css = """.my-group {max-width: 600px !important; max-height: 600 !important;}
                      .my-column {display: flex !important; justify-content: center !important; align-items: center !important};"""


with gr.Blocks(css=css) as demo:
    gr.HTML(
        """
    <h1 style='text-align: center'>
    YOLOv10 Webcam Stream (Powered by WebRTC ⚡️)
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
            image = WebRTC(label="Stream", rtc_configuration=rtc_configuration)
            conf_threshold = gr.Slider(
                label="Confidence Threshold",
                minimum=0.0,
                maximum=1.0,
                step=0.05,
                value=0.30,
            )

        image.stream(
            fn=detection, inputs=[image, conf_threshold], outputs=[image], time_limit=10
        )

if __name__ == "__main__":
    demo.launch()
```


## Conclusion

Our app is hosted on Hugging Face Spaces [here](https://huggingface.co/spaces/freddyaboulton/webrtc-yolov10n). 

You can use this app as a starting point to build real-time image applications with Gradio. Don't hesitate to open issues in the space or in the [WebRTC component github repo](https://github.com/freddyaboulton/gradio-webrtc).
