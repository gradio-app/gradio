# Real Time Object Detection from a Webcam Stream with WebRTC

Tags: VISION, STREAMING, WEBCAM

In this guide, we'll use YOLOv10 to perform real-time object detection in Gradio from a user's webcam feed. We'll stream the webcam over [WebRTC](https://webrtc.org/) with the built-in `gr.WebRTC` component, which sends each frame to the server and plays the processed frame back with the latency of a direct connection, instead of one HTTP request per frame. You can see the finished product in action below:

<video src="https://github.com/user-attachments/assets/4584cec6-8c1a-401b-9b61-a4fe0718b558" controls
height="600" width="600" style="display: block; margin: auto;" autoplay="true" loop="true">
</video>

## Setting up

Start by installing all the dependencies. Add the following lines to a `requirements.txt` file and run `pip install -r requirements.txt`:

```bash
gradio[webrtc]
opencv-python
onnxruntime-gpu
```

The `webrtc` extra installs [aiortc](https://github.com/aiortc/aiortc), which `gr.WebRTC` uses for the server side of the connection.

We'll use the ONNX runtime to speed up YOLOv10 inference. This guide assumes you have access to a GPU. If you don't, change `onnxruntime-gpu` to `onnxruntime`. Without a GPU, the model will run slower, resulting in a laggy demo.

We'll use OpenCV for image manipulation.

**Note**: If you want to deploy this app on any cloud provider, including Hugging Face Spaces, you'll need a TURN server to relay the media, because the browser cannot reach the server directly. Pass its ICE servers with the `rtc_configuration` parameter of `gr.WebRTC`, either as a dict or as a function that returns one, which is called for every connection so that short-lived credentials work. Hugging Face accounts get a free monthly TURN quota through Cloudflare; the `fastrtc` package's `get_cloudflare_turn_credentials` function returns a configuration in the right shape. If you're not familiar with TURN servers, consult this [guide](https://www.twilio.com/docs/stun-turn/faq#faq-what-is-a-turn-server).

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

The function returns a numpy array corresponding to the same input image with all detected objects in bounding boxes. `gr.WebRTC` passes frames as BGR arrays (the layout OpenCV uses) and expects a BGR array back.

## The Gradio Demo

The Gradio demo is straightforward, but we'll implement a few specific features:

1. Use the `gr.WebRTC` component with `mode="send-receive"` so that the webcam is sent to the server and the processed frames are played back in the same component.
2. Attach the inference function with the `stream` method. The first input is the component itself; the values of the other inputs (here, the slider) are passed to the function after the frame, and are pushed to the running stream whenever they change.
3. Utilize the `time_limit` parameter of `stream`. This parameter sets a processing time for each user's stream. In a multi-user setting, such as on Spaces, we'll stop processing the current user's stream after this period so that the next user can connect.

We'll also apply custom CSS to center the webcam and slider on the page.

```python
import gradio as gr

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
            webcam = gr.WebRTC(label="Stream", rtc_configuration=rtc_configuration)
            conf_threshold = gr.Slider(
                label="Confidence Threshold",
                minimum=0.0,
                maximum=1.0,
                step=0.05,
                value=0.30,
            )

        webcam.stream(
            fn=detection, inputs=[webcam, conf_threshold], outputs=[webcam], time_limit=10
        )

if __name__ == "__main__":
    demo.launch()
```

## Going further

- To update other components from the stream, for example a counter of detected objects, return `(frame, gr.webrtc.AdditionalOutputs(count))` from the function and list the components after the `gr.WebRTC` component in `outputs`. The values are matched positionally, like the return values of any other event.
- To end a stream from the handler, return `gr.webrtc.CloseStream("message")`.
- For audio streams, pass a subclass of `gradio.webrtc.StreamHandler` or `gradio.webrtc.AsyncStreamHandler` to `stream` instead of a function. Its `receive` method is called with every incoming audio frame and its `emit` method is polled for the next frame to play back.

## Conclusion

You can use this app as a starting point to build real-time image applications with Gradio. Voice activity detection, turn taking and other building blocks for voice applications are available in the companion [FastRTC](https://fastrtc.org/) library.
