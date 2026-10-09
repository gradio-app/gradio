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

**Note**: The app below works as is on your own machine. To deploy it on Hugging Face Spaces or another cloud provider, you'll also need a TURN server; see [Deploying to Hugging Face Spaces](#deploying-to-hugging-face-spaces).

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
    # This model's code expects OpenCV's BGR layout
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    new_image = model.detect_objects(image, conf_threshold)
    return cv2.cvtColor(new_image, cv2.COLOR_BGR2RGB)
```

Our inference function, `detection`, accepts a numpy array from the webcam and a desired confidence threshold. Object detection models like YOLO identify many objects and assign a confidence score to each. The lower the confidence, the higher the chance of a false positive. We'll let users adjust the confidence threshold.

The function returns a numpy array corresponding to the same input image with all detected objects in bounding boxes. `gr.WebRTC` passes frames as RGB arrays, like the numpy value of `gr.Image`, and expects an RGB array back. The inference class works on OpenCV's BGR layout, so the function converts to BGR and back.

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
            webcam = gr.WebRTC(label="Stream")
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

## Deploying to Hugging Face Spaces

On your own machine, the browser connects to the server directly. On Hugging Face Spaces (and most cloud providers), a direct connection works on some visitors' networks but fails on many others, so the media has to be relayed through a [TURN server](https://www.twilio.com/docs/stun-turn/faq#faq-what-is-a-turn-server) when it fails. The browser still tries the direct route first, and streams that connect directly don't use any TURN traffic. You give the browser its TURN server with the `rtc_configuration` parameter of `gr.WebRTC`. It takes a dict, or a function that returns one, which is called for every new stream so that short-lived credentials can be issued. On Spaces, only the browser needs a TURN server: the server reaches the relay by itself, so `server_rtc_configuration` can be left unset. Set it as well if your host blocks outgoing UDP traffic.

Every Hugging Face account gets a free monthly TURN quota through Cloudflare. The question is whose account pays for each stream.

### Recommended: use each visitor's own account

Ask visitors to sign in with Hugging Face, and issue their TURN credentials with their own token. Each visitor then uses their own quota, so one heavy user can't use up the quota for everyone else. Add `hf_oauth: true` to the metadata of your Space's `README.md` and install `gradio[webrtc,oauth]`. Then give `rtc_configuration` a function that takes a `gr.OAuthToken`, and add a `gr.LoginButton`:

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

with gr.Blocks(css=css) as demo:
    gr.LoginButton()
    ...
    webcam = gr.WebRTC(label="Stream", rtc_configuration=turn_credentials)
```

The function can take the same special parameters as an event listener (`gr.Request`, `gr.OAuthProfile`, `gr.OAuthToken`). The default OAuth scopes are enough. If a visitor presses Record without signing in, the `gr.Error` message is shown to them.

### Without sign-in: bring your own TURN server

If you don't want to require sign-in, every stream goes through a TURN account of yours. You can create a TURN app in your own [Cloudflare account](https://developers.cloudflare.com/realtime/turn/) and issue credentials with its key, or run your own TURN server such as [coturn](https://github.com/coturn/coturn):

```python
import os

import httpx2

async def turn_credentials() -> dict:
    key_id = os.environ["CLOUDFLARE_TURN_KEY_ID"]
    async with httpx2.AsyncClient() as client:
        response = await client.post(
            f"https://rtc.live.cloudflare.com/v1/turn/keys/{key_id}/credentials/generate-ice-servers",
            headers={"Authorization": f"Bearer {os.environ['CLOUDFLARE_TURN_KEY_API_TOKEN']}"},
            json={"ttl": 600},
        )
    response.raise_for_status()
    return response.json()
```

Store the key as secrets of your Space. Since every visitor's traffic is billed to you, set `concurrency_limit` and `time_limit` in `stream()`: together they cap how much TURN traffic the app can use at a time.

### For testing only: your own Hugging Face token

While you develop, you can call the same Hugging Face endpoint with your own token, stored as an `HF_TOKEN` secret, instead of the visitor's. Don't do this in a public Space: every visitor's stream then counts against your quota, and once it runs out the app stops working for everyone, including you.

## Going further

- To update other components from the stream, for example a counter of detected objects, return `(frame, gr.webrtc.AdditionalOutputs(count))` from the function and list the components after the `gr.WebRTC` component in `outputs`. The values are matched positionally, like the return values of any other event.
- To end a stream from the handler, return `gr.webrtc.CloseStream("message")`.
- Like an event listener, the function can take `gr.Request`, `gr.OAuthProfile` or `gr.OAuthToken` parameters, for example to call an API with the signed-in visitor's own token. For a handler class, give them to its `start_up` method.
- Errors and messages work as in any other event: raise `gr.Error("...")` to show a message and end the stream (other exceptions show their message only with `launch(show_error=True)`), and call `gr.Warning`, `gr.Info` or `gr.Success` to show a message while the stream goes on.
- For audio streams, pass a subclass of `gradio.webrtc.StreamHandler` or `gradio.webrtc.AsyncStreamHandler` to `stream` instead of a function. Its `receive` method is called with every incoming audio frame and its `emit` method is polled for the next frame to play back. Audio frames are `(sample_rate, array)` tuples like the numpy value of `gr.Audio`, with arrays shaped `(samples,)` for mono or `(samples, 2)` for stereo.

## Conclusion

You can use this app as a starting point to build real-time image applications with Gradio. Voice activity detection, turn taking and other building blocks for voice applications are available in the companion [FastRTC](https://fastrtc.org/) library.
