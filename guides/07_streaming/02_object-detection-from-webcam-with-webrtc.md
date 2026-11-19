# Real Time Object Detection from a Webcam Stream with WebRTC

Tags: VISION, STREAMING, WEBCAM

In this guide, we'll use YOLOv10 to perform real-time object detection in Gradio from a user's webcam feed. We'll stream the webcam over [WebRTC](https://webrtc.org/) by passing `transport="webrtc"` to the `stream` event of a `gr.Image`. The frames then travel over a peer connection between the browser and the server, and the processed frames play back with the latency of a direct connection, instead of one HTTP request per frame. You can see the finished product in action below:

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

The `webrtc` extra installs [aiortc](https://github.com/aiortc/aiortc), which Gradio uses for the server side of the connection.

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

The function returns a numpy array corresponding to the same input image with all detected objects in bounding boxes. Frames arrive as RGB arrays, like the numpy value of `gr.Image`, and the function returns an RGB array. The inference class works on OpenCV's BGR layout, so the function converts to BGR and back.

## The Gradio Demo

The Gradio demo is straightforward, but we'll implement a few specific features:

1. Use a `gr.Image` with `sources=["webcam"]` and `streaming=True`, and attach the inference function with its `stream` method and `transport="webrtc"`.
2. List the image among both the inputs and the outputs, so that the webcam is sent to the server and the processed frames play back in the same component. The function takes one value per input, as in any event: the frame, then the slider's value. When the slider changes, the running stream gets the new value.
3. Utilize the `time_limit` parameter of `stream`. This parameter sets a processing time for each user's stream. In a multi-user setting, such as on Spaces, we'll stop processing the current user's stream after this period so that the next user can connect.

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

Each stream waits its turn in the queue like any other event, so `concurrency_limit` (1 by default) is the number of streams that run at once, and the image shows the visitor's place in line while they wait. `time_limit` is counted from the stream's turn.

To show the processed frames in a separate component, list a `gr.Image()` in `outputs` instead of the webcam. When several outputs could show the frames, pick one with `transport=gr.WebRTCOptions(media_output=...)`.

## Deploying to Hugging Face Spaces

On your own machine, the browser connects to the server directly. On Hugging Face Spaces (and most cloud providers), a direct connection works on some visitors' networks but fails on many others, so the media has to be relayed through a [TURN server](https://www.twilio.com/docs/stun-turn/faq#faq-what-is-a-turn-server) when it fails. The browser still tries the direct route first, and streams that connect directly don't use any TURN traffic. You give the browser its TURN server with the `rtc_configuration` setting of `gr.WebRTCOptions`, which you pass as `transport=` instead of `"webrtc"`. It takes a dict, or a function that returns one, which is called for every new stream so that short-lived credentials can be issued. On Spaces, only the browser needs a TURN server: the server reaches the relay by itself, so `server_rtc_configuration` can be left unset. Set it as well if your host blocks outgoing UDP traffic.

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

The function can take the same special parameters as an event listener (`gr.Request`, `gr.OAuthProfile`, `gr.OAuthToken`). The default OAuth scopes are enough. If a visitor starts the stream without signing in, the `gr.Error` message is shown to them.

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

Store the key as secrets of your Space. Since every visitor's traffic is billed to you, set `concurrency_limit` and `time_limit` in `stream()`: a page gets credentials only once its stream's turn has come, so together they cap how much TURN traffic the app can use at a time. A credential keeps working until its `ttl` runs out, so keep the `ttl` close to `time_limit`.

### For testing only: your own Hugging Face token

While you develop, you can call the same Hugging Face endpoint with your own token, stored as an `HF_TOKEN` secret, instead of the visitor's. Don't do this in a public Space: every visitor's stream then counts against your quota, and once it runs out the app stops working for everyone, including you.

## Going further

- To update other components from the stream, for example a counter of detected objects, list them in `outputs` and return one value for each, as in any other event: `return frame, count`. Return `gr.skip()` for an output that should stay as it is, for example to update the counter only every few frames.
- A `gr.State` among the inputs has its value from when the stream's turn came. If the function also returns it, each call gets what the previous call returned, as in a stream without `transport=`. The stream keeps that value while it runs, so a change that another event makes to the State in the meantime does not reach the function and is replaced by the stream's next value.
- The function is called once per frame, and it can be `async`. If it is slower than the camera, the frames that arrive while it runs are dropped and it gets the newest one, so the output stays close to real time; `transport=gr.WebRTCOptions(skip_frames=False)` processes every frame instead, and the output falls behind. `stream_every` sets the shortest interval between calls, for example `stream_every=0.1` for at most 10 calls a second.
- WebRTC starts video at a low bitrate and raises it as it finds bandwidth, so the first seconds can be blurry. `gr.WebRTCOptions(video_bitrate={"min": 1000, "start": 1500, "max": 4000})` (in kbps) starts higher at the cost of bandwidth.
- To end a stream from the function, return `CloseStream("message")` (from `gradio.streaming`) in place of the outputs; the message is shown to the user as a warning. To end it from another event, pass the event that `stream()` returns to that event's `cancels`, for example `stop_button.click(None, cancels=[stream_event])`.
- Like an event listener, the function can take `gr.Request`, `gr.OAuthProfile` or `gr.OAuthToken` parameters, for example to call an API with the signed-in visitor's own token. For a handler class, give them to its `start_up` method.
- Errors and messages work as in any other event: raise `gr.Error("...")` to show a message and end the stream, which then runs the `.failure()` listeners of the event that `stream()` returns (other exceptions show their message only with `launch(show_error=True)`), and call `gr.Warning`, `gr.Info` or `gr.Success` to show a message while the stream goes on.
- A function that needs something for the whole stream, for example a model session that keeps state between frames or one GPU allocation per stream on ZeroGPU, can be a generator function (`def ... yield`). One generator runs per stream: it starts with the first frame and the other inputs as its arguments, each `yield` gives one value per output as a function's return does, and the next inputs are what that `yield` evaluates to (the value itself with one input, a tuple with several): `def detect(frame, threshold): session = load(); while True: frame, threshold = yield session.run(frame, threshold)`. The stream ends when the generator returns, and the generator is closed when the stream ends, so a `try ... finally` or a `with` block around its loop releases what it holds. The same works for audio, with a chunk in place of the frame. Async generators are not supported.
- When a video stream needs something for its whole duration, for example a model session that keeps state between frames or one GPU allocation per stream on ZeroGPU, pass a subclass of `gradio.streaming.VideoStreamHandler` (or `AsyncVideoStreamHandler`) to `stream` instead of a function. Its `start_up` method is called when the stream connects (frames may already arrive while it runs) and `shutdown` when it ends; `video_receive` is called with every incoming frame (only the newest one, if it is slower than the camera) and `video_emit` is polled for what to send back, so the two need not be in step. `video_emit` returns one value per output, like the function. The values of the other inputs are in its `latest_args` once the page has sent them. If the webcam is only among the inputs, the stream sends only values back (say, a caption of what the camera sees in a `gr.Textbox`), and `video_emit` returns those.
- To stream video that the server generates, with no webcam, attach a generator function (`def ... yield`) to any event and list a `gr.Image` among its outputs, for example `button.click(generate, inputs=[prompt], outputs=[image, status], transport="webrtc")`. Each `yield` gives one value per output.
- The same works for audio with `gr.Audio(sources=["microphone"], streaming=True)`. A plain function gets `stream_every` seconds of audio per call (0.5 by default) and returns the audio to play back. For full-duplex audio, such as a voice agent that talks while it listens, pass a subclass of `gradio.streaming.StreamHandler` or `gradio.streaming.AsyncStreamHandler` instead. Its `receive` method is called with every incoming audio frame and its `emit` method is polled for the next frame to play back, returning one value per output. Audio is passed as `(sample_rate, array)` tuples like the numpy value of `gr.Audio`, with arrays shaped `(samples,)` for mono or `(samples, 2)` for stereo.
- For a voice agent that answers once the user stops talking, wrap a generator function in `gradio.streaming.ReplyOnPause` and pass that to `stream`, for example `mic.stream(ReplyOnPause(respond), inputs=[mic, voice], outputs=[mic, transcript], transport="webrtc")`. `respond` is called with what the user said, as a `(sample_rate, array)` tuple at 16 kHz, followed by the values of the other inputs, and yields its reply one value per output. If the user talks over the reply, it stops and the new question gets its own reply (pass `can_interrupt=False` to turn this off). Pauses are detected with [Silero VAD](https://github.com/snakers4/silero-vad), which needs the `vad` extra: `pip install "gradio[webrtc,vad]"`. On `gr.Server`, register it with `app.api(ReplyOnPause(respond), name="talk", transport="webrtc")`, with the `gr.AudioChunk` hint on the first parameter of `respond`.
- For the camera and microphone together, use a `gr.Video(sources=["webcam"])` among both the inputs and the outputs, with a subclass of `gradio.streaming.AudioVideoStreamHandler` (or `AsyncAudioVideoStreamHandler`). It has both the audio methods (`receive`, `emit`) and the video methods (`video_receive`, `video_emit`).
- To stream to a frontend of your own, register a function with `@app.api(transport="webrtc")` of a [`gradio.Server`](/guides/server-mode#webrtc-streams) app and call it from the page with the JavaScript client's `client.submit()`, passing a `MediaStream`.

## Conclusion

You can use this app as a starting point to build real-time image applications with Gradio.
