# Create a Real-Time Immersive Audio + Video Demo

Tags: REAL-TIME, IMMERSIVE, VIDEO, AUDIO, STREAMING, GEMINI, WEBRTC

Gradio can stream the webcam and microphone to your Python code over WebRTC and play audio and video back with low latency. In this guide, you'll build a fun demo where Gemini is an art critic that critiques your artwork. It:
- Streams your webcam and microphone to a Gemini Live session
- Sends a video frame at most once per second (and an optional uploaded image) to the model
- Plays the model's spoken replies back in real time
- Runs in a regular `gr.Blocks` app, with the webcam and the replies in one `gr.Video`

### What you'll build
<video autoplay loop>
  <source src="https://github.com/gradio-app/gradio/blob/main/guides/assets/art-critic.mp4?raw=true" type="video/mp4" />
</video>

### Prerequisites
- Python 3.11+
- A Gemini API key, from the [Gemini API key](https://aistudio.google.com/apikey) page

Install the dependencies:

```bash
pip install "gradio[components,webrtc]" google-genai pillow
```

## 1) Encoders for audio and images

The Gemini Live API takes microphone audio as raw 16-bit PCM and images as JPEG. These two functions wrap the numpy arrays that Gradio passes into what the API expects.

```python
import asyncio
import time
from contextlib import AsyncExitStack
from io import BytesIO

import numpy as np
from google import genai
from google.genai import types
from PIL import Image

import gradio as gr
from gradio.streaming import AsyncAudioVideoStreamHandler, CloseStream, wait_for_item

MODEL = "gemini-3.8-live"
SYSTEM_INSTRUCTION = (
    "You are an art critic. Critique the artwork the user shows you, on the "
    "webcam or as an uploaded image, in a funny and lighthearted way. Be "
    "concise, friendly and helpful."
)


def encode_audio(data: np.ndarray, sample_rate: int) -> types.Blob:
    """Raw 16-bit PCM, the format the Live API takes from the microphone."""
    return types.Blob(data=data.tobytes(), mime_type=f"audio/pcm;rate={sample_rate}")


def encode_image(data: np.ndarray) -> types.Blob:
    with BytesIO() as buffer:
        Image.fromarray(data).save(buffer, "JPEG")
        return types.Blob(data=buffer.getvalue(), mime_type="image/jpeg")
```

## 2) Implement the Gemini audio-video handler

A plain function, called once per frame, is enough for most streams. Here we need more: one Gemini session for the whole stream, and audio that goes to Gemini and comes back on its own schedule, since Gemini talks while the user listens. That is what a handler class is for. A subclass of `gradio.streaming.AsyncAudioVideoStreamHandler` gets a new instance for every stream, and Gradio calls its methods:

- `start_up` once when the stream starts. It opens the Gemini session, starts a task that collects Gemini's replies, and returns. The stream's time limit counts from when `start_up` returns, so don't keep it running for the whole stream.
- `receive` with every incoming microphone frame, as a `(sample_rate, array)` tuple, resampled to `input_sample_rate`. It sends the audio to Gemini.
- `emit` over and over, for the next audio to play back. It returns a `(sample_rate, array)` tuple, or `None` when nothing is ready, and must not block, which is what `wait_for_item` is for. When the Gemini session has ended, it returns a `CloseStream`, which ends the stream and shows its message to the user.
- `video_receive` with every incoming webcam frame, as an RGB array. It sends a frame to Gemini at most once a second, and the uploaded artwork whenever it changes.
- `video_emit` over and over, for the next frame to show. Here it shows the webcam as it is.
- `shutdown` once when the stream ends. It closes the Gemini session.

The values of the app's other inputs, here the artwork and the API key, are in `self.latest_args` once the page has sent them; `wait_for_args()` waits for that. Parameters declared after `frame` in `receive` or `video_receive` also get these values, as `artwork` does below.

```python
class GeminiHandler(AsyncAudioVideoStreamHandler):
    def __init__(self) -> None:
        super().__init__(
            expected_layout="mono",
            output_sample_rate=24000,
            input_sample_rate=16000,
        )
        self.audio_queue: asyncio.Queue = asyncio.Queue()
        self.stack = AsyncExitStack()
        self.session = None
        self.receive_task = None
        self.frame = None
        self.last_frame_time = 0.0
        self.sent_artwork = None

    async def start_up(self) -> None:
        # The values of the other inputs: the artwork and the API key
        await self.wait_for_args()
        _, api_key = self.latest_args
        if not api_key:
            raise gr.Error("Enter your Gemini API key to start.")
        client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})
        config = {
            "response_modalities": ["AUDIO"],
            "system_instruction": SYSTEM_INSTRUCTION,
        }
        try:
            self.session = await self.stack.enter_async_context(
                client.aio.live.connect(model=MODEL, config=config)
            )
        except Exception as e:
            raise gr.Error(f"Could not connect to Gemini: {e}") from e
        self.receive_task = asyncio.create_task(self.receive_audio())

    async def receive_audio(self) -> None:
        """Puts Gemini's spoken replies on the queue that emit() reads. Runs
        until the session ends, when receive() raises."""
        while True:
            # Each receive() yields the messages of one turn
            async for response in self.session.receive():
                content = response.server_content
                if content is None:
                    continue
                if content.interrupted:
                    # The user talked over the reply: drop what is left of it
                    self.clear_queue()
                    while not self.audio_queue.empty():
                        self.audio_queue.get_nowait()
                if content.model_turn:
                    for part in content.model_turn.parts:
                        if part.inline_data:
                            audio = np.frombuffer(part.inline_data.data, dtype=np.int16)
                            self.audio_queue.put_nowait(audio)

    # Microphone audio, as (16000, int16 array), goes to Gemini as it arrives
    async def receive(self, frame: tuple[int, np.ndarray]) -> None:
        sample_rate, array = frame
        if self.session:
            await self.session.send_realtime_input(
                audio=encode_audio(array, sample_rate)
            )

    # Gemini's replies are played back as 24 kHz audio
    async def emit(self):
        if self.receive_task is None:
            return None
        if self.receive_task.done() and self.audio_queue.empty():
            return CloseStream("The Gemini session has ended.")
        array = await wait_for_item(self.audio_queue, 0.01)
        if array is None:
            return None
        return (self.output_sample_rate, array)

    # A webcam frame goes to Gemini at most once a second, with the uploaded
    # artwork whenever it changes. The parameter after `frame` gets the latest
    # value of the stream's next input, the gr.Image.
    async def video_receive(self, frame: np.ndarray, artwork: np.ndarray | None = None):
        self.frame = frame
        if not self.session or time.time() - self.last_frame_time < 1.0:
            return
        self.last_frame_time = time.time()
        await self.session.send_realtime_input(video=encode_image(frame))
        if artwork is not None and artwork is not self.sent_artwork:
            self.sent_artwork = artwork
            await self.session.send_realtime_input(video=encode_image(artwork))

    # The webcam is shown back as it is
    async def video_emit(self):
        return self.frame

    async def shutdown(self) -> None:
        if self.receive_task:
            self.receive_task.cancel()
        await self.stack.aclose()
```

## 3) Build the Gradio UI

A `gr.Video` with `sources=["webcam"]` among both the inputs and the outputs of `stream()` sends the webcam and microphone to the server and plays the handler's video and audio in the same component. Pass the handler class itself, and `transport="webrtc"`. The artwork and the API key are ordinary inputs, which the handler reads as described above.

`time_limit` and `on_time_limit="stop"` end each stream after 90 seconds, which also stays under the Live API's session limit for audio with video. `concurrency_limit=5` lets five streams run at once; other visitors wait in the queue until one ends.

```python
with gr.Blocks() as demo:
    gr.Markdown(
        "## 🎨 Art Critic\n\n"
        "Hold your artwork up to the webcam or upload a picture of it, and Gemini "
        "will critique it. Get a Gemini API key on the "
        "[Gemini API key](https://aistudio.google.com/apikey) page."
    )
    with gr.Row():
        with gr.Column():
            webcam = gr.Video(label="Webcam", sources=["webcam"])
        with gr.Column():
            artwork = gr.Image(
                label="Artwork", type="numpy", sources=["upload", "clipboard"]
            )
            api_key = gr.Textbox(label="Gemini API key", type="password")
    webcam.stream(
        GeminiHandler,
        inputs=[webcam, artwork, api_key],
        outputs=[webcam],
        transport="webrtc",
        time_limit=90,
        on_time_limit="stop",
        concurrency_limit=5,
    )

if __name__ == "__main__":
    demo.launch()
```

Run the script, open the app, paste your API key, click the webcam, and start recording. Then show Gemini your artwork and ask what it thinks.

## Deploying to Hugging Face Spaces

On your own machine, the browser connects to the server directly. On Hugging Face Spaces, the connection often needs a TURN server to relay the media. See [Deploying to Hugging Face Spaces](/guides/object-detection-from-webcam-with-webrtc#deploying-to-hugging-face-spaces) in the WebRTC streaming guide for how to set one up, for example with each visitor's own Hugging Face account: you pass `transport=gr.WebRTCOptions(rtc_configuration=...)` instead of `transport="webrtc"` and add a `gr.LoginButton`.

### References
- [Real-time object detection from a webcam with WebRTC](/guides/object-detection-from-webcam-with-webrtc): more on streams with `transport=`, including plain functions, other outputs and handler classes
- [Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
