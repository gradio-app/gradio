# Real Time Object Detection from a Webcam Stream with WebRTC

Tags: VISION, STREAMING, WEBCAM

In this guide, we'll use YOLOv10 to perform real-time object detection in Gradio from a user's webcam feed. We'll utilize the latest streaming features introduced in Gradio 5.0. You can see the finished product in action below:

<video src="https://github.com/user-attachments/assets/4584cec6-8c1a-401b-9b61-a4fe0718b558" controls
height="600" width="600" style="display: block; margin: auto;" autoplay="true" loop="true">
</video>

## Setting up

Start by installing all the dependencies. Add the following lines to a `requirements.txt` file and run `pip install -r requirements.txt`:

```bash
opencv-python
twilio
gradio>=5.0
gradio-webrtc
onnxruntime-gpu
```

We'll use the ONNX runtime to speed up YOLOv10 inference. This guide assumes you have access to a GPU. If you don't, change `onnxruntime-gpu` to `onnxruntime`. Without a GPU, the model will run slower, resulting in a laggy demo.

We'll use OpenCV for image manipulation and the [Gradio WebRTC](https://github.com/freddyaboulton/gradio-webrtc) custom component to use [WebRTC](https://webrtc.org/) under the hood, achieving near-zero latency.

**Note**: If you want to deploy this app on any cloud provider, you'll need to use the free Twilio API for their [TURN servers](https://www.twilio.com/docs/stun-turn). Create a free account on Twilio. If you're not familiar with TURN servers, consult this [guide](https://www.twilio.com/docs/stun-turn/faq#faq-what-is-nat).

## The Inference Function

We'll download the YOLOv10 model from the Hugging Face hub and instantiate a custom inference class to use this model. 

The implementation of the inference class isn't covered in this guide, but you can find the source code [here](https://huggingface.co/spaces/freddyaboulton/webrtc-yolov10n/blob/main/inference.py#L9) if you're interested. This implementation borrows heavily from this [github repository](https://github.com/ibaiGorordo/ONNX-YOLOv8-Object-Detection).

We're using the `yolov10-n` variant because it has the lowest latency. See the [Performance](https://github.com/THU-MIG/yolov10?tab=readme-ov-file#performance) section of the README in the YOLOv10 GitHub repository.

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

Our inference function, `detection`, accepts a numpy array from the webcam and a desired confidence threshold. Object detection models like YOLO identify many objects and assign a confidence score to each. The lower the confidence, the higher the chance of a false positive. We'll let users adjust the confidence threshold.

The function returns a numpy array corresponding to the same input image with all detected objects in bounding boxes.

## The Gradio Demo

The Gradio demo is straightforward, but we'll implement a few specific features:

1. Use the `WebRTC` custom component to ensure input and output are sent to/from the server with WebRTC. 
2. The [WebRTC](https://github.com/freddyaboulton/gradio-webrtc) component will serve as both an input and output component.
3. Utilize the `time_limit` parameter of the `stream` event. This parameter sets a processing time for each user's stream. In a multi-user setting, such as on Spaces, we'll stop processing the current user's stream after this period and move on to the next. 

We'll also apply custom CSS to center the webcam and slider on the page.

```python
import gradio as gr
from gradio_webrtc import WebRTC

css = """.my-group {max-width: 600px !important; max-height: 600px !important;}
         .my-column {display: flex !important; justify-content: center !important; align-items: center !important;}"""

with gr.Blocks(css=css) as demo:
    gr.HTML(
        """
        <h1 style='text-align: center'>
        YOLOv10 Webcam Stream (Powered by WebRTC ⚡️)
        </h1>
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

You can use this app as a starting point to build real-time image applications with Gradio. Don't hesitate to open issues in the space or in the [WebRTC component GitHub repo](https://github.com/freddyaboulton/gradio-webrtc) if you have any questions or encounter problems.