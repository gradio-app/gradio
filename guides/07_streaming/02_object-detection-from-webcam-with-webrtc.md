# Real Time Object Detection from a Webcam Stream with WebRTC

Tags: VISION, STREAMING, WEBCAM

In this guide, we'll use YOLOv10 to perform real-time object detection in Gradio from a user's webcam feed. We'll send the webcam over [WebRTC](https://webrtc.org/) by passing `transport="webrtc"` to the `stream` event of a `gr.Image`, which gives the low latency a real-time demo needs. You can see the finished product in action below:

<video src="https://github.com/user-attachments/assets/4584cec6-8c1a-401b-9b61-a4fe0718b558" controls
height="600" width="600" style="display: block; margin: auto;" autoplay="true" loop="true">
</video>

## Setting up

Start by installing all the dependencies. Add the following lines to a `requirements.txt` file and run `pip install -r requirements.txt`:

```bash
gradio[components,webrtc]
opencv-python
onnxruntime-gpu
```

We'll use the ONNX runtime to speed up YOLOv10 inference. This guide assumes you have access to a GPU. If you don't, change `onnxruntime-gpu` to `onnxruntime`. Without a GPU, the model will run slower, resulting in a laggy demo.

We'll use OpenCV for image manipulation.

**Note**: If you want to deploy this app on Hugging Face Spaces or another cloud provider, the browser needs a TURN server to connect; see [Deploying to Hugging Face Spaces](#deploying-to-hugging-face-spaces). If you're not familiar with TURN servers, consult this [guide](https://www.twilio.com/docs/stun-turn/faq#faq-what-is-nat).

## The Inference Function

We'll download the YOLOv10 model from the Hugging Face hub and instantiate a custom inference class to use this model. 

The implementation of the inference class isn't covered in this guide, but you can find the source code [here](https://huggingface.co/spaces/freddyaboulton/webrtc-yolov10n/blob/main/inference.py#L9) if you're interested. This implementation borrows heavily from this [github repository](https://github.com/ibaiGorordo/ONNX-YOLOv8-Object-Detection).

We're using the `yolov10-n` variant because it has the lowest latency. See the [Performance](https://github.com/THU-MIG/yolov10?tab=readme-ov-file#performance) section of the README in the YOLOv10 GitHub repository.

```python
import cv2
from huggingface_hub import hf_hub_download
from inference import YOLOv10

model_file = hf_hub_download(
    repo_id="onnx-community/yolov10n", filename="onnx/model.onnx"
)

model = YOLOv10(model_file)

def detection(image, conf_threshold=0.3):
    image = cv2.resize(image, (model.input_width, model.input_height))
    # This model's code expects OpenCV's BGR layout
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    new_image = model.detect_objects(image, conf_threshold)
    return cv2.cvtColor(new_image, cv2.COLOR_BGR2RGB)
```

Our inference function, `detection`, accepts a numpy array from the webcam and a desired confidence threshold. Object detection models like YOLO identify many objects and assign a confidence score to each. The lower the confidence, the higher the chance of a false positive. We'll let users adjust the confidence threshold.

The function returns a numpy array corresponding to the same input image with all detected objects in bounding boxes. Frames arrive as RGB arrays, like the numpy value of `gr.Image`, so the function converts them to BGR for the model and back.

## The Gradio Demo

The Gradio demo is straightforward, but we'll implement a few specific features:

1. Use a `gr.Image` with `sources=["webcam"]` and `streaming=True`, and attach the inference function with its `stream` method and `transport="webrtc"`.
2. List the image among both the inputs and the outputs, so that the webcam is sent to the server and the processed frames play back in the same component.
3. Utilize the `time_limit` parameter of the `stream` event. This parameter sets how long each user's stream keeps its turn. In a multi-user setting, such as on Spaces, when the next user is waiting, the current user's stream hands its turn over after this period and waits in line again.

We'll also apply custom CSS to center the webcam and slider on the page.

```python
import gradio as gr

css = """.my-group {max-width: 600px !important; max-height: 600px !important;}
         .my-column {display: flex !important; justify-content: center !important; align-items: center !important;}"""

with gr.Blocks() as demo:
    gr.HTML(
        """
        <h1 style='text-align: center'>
        YOLOv10 Webcam Stream (Powered by WebRTC ⚡️)
        </h1>
        """
    )
    with gr.Column(elem_classes=["my-column"]):
        with gr.Group(elem_classes=["my-group"]):
            webcam = gr.Image(label="Stream", sources=["webcam"], streaming=True)
            conf_threshold = gr.Slider(
                label="Confidence Threshold",
                minimum=0.0,
                maximum=1.0,
                step=0.05,
                value=0.30,
            )

        webcam.stream(
            fn=detection,
            inputs=[webcam, conf_threshold],
            outputs=[webcam],
            transport="webrtc",
            time_limit=10,
        )

if __name__ == "__main__":
    demo.launch(css=css)
```

## Deploying to Hugging Face Spaces

On Spaces, the browser often cannot reach the server directly, so the media is relayed through a TURN server. Every Hugging Face account gets a free monthly TURN quota, and the simplest way to use it is to have visitors sign in and issue their credentials with their own token. Add `hf_oauth: true` to the metadata of your Space's `README.md`, add `oauth` to the extras in `requirements.txt` (`gradio[components,webrtc,oauth]`), and pass a function that returns the credentials as the `rtc_configuration` of [`gr.WebRTCOptions`](/docs/gradio/webrtcoptions):

```python
import httpx2

async def turn_credentials(token: gr.OAuthToken | None) -> dict:
    if token is None:
        raise gr.Error("Sign in with Hugging Face to start the stream.")
    async with httpx2.AsyncClient() as client:
        response = await client.get(
            "https://fastrtc-turn-service.hf.space/credentials",
            headers={"Authorization": f"Bearer {token.token}"},
            params={"ttl": 600},
        )
    response.raise_for_status()
    return response.json()

with gr.Blocks() as demo:
    gr.LoginButton()
    ...
    webcam.stream(
        fn=detection,
        inputs=[webcam, conf_threshold],
        outputs=[webcam],
        transport=gr.WebRTCOptions(rtc_configuration=turn_credentials),
        time_limit=10,
    )
```

To avoid requiring sign-in, return the credentials of a TURN server of your own instead, for example from a [Cloudflare TURN app](https://developers.cloudflare.com/realtime/turn/).

## Conclusion

You can use this app as a starting point to build real-time image applications with Gradio.
