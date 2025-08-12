# Create a Real-Time Immersive Audio + Video Demo with FastRTC

Tags: REAL-TIME, IMMERSIVE, FASTRTC, VIDEO, AUDIO, STREAMING, GEMINI, WEBRTC

FastRTC is a library that lets you build low-latency real-time apps over WebRTC. In this guide, you’ll implement a Gemini Audio + Video Chat that:
- Streams your webcam and microphone to a Gemini real-time session
- Sends periodic video frames (and an optional uploaded image) to the model
- Streams back the model’s audio responses in real time
- Creates a polished full-screen Gradio `WebRTC` UI

### What you’ll build
<gradio-app space="gradio/gemini-audio-video"></gradio-app>

### Prerequisites
- Python 3.9+
- A Gemini API key in the environment: `GEMINI_API_KEY`

Install the dependencies:

```bash
pip install "fastrtc[vad, tts]" gradio google-genai python-dotenv websockets pillow
```

Create a `.env` file with your Gemini key:

```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```


## 1) Encoders for audio and images
Encoder functions to send audio as base64-encoded data and images as base64-encoded JPEG.

```python
import base64
import numpy as np
from io import BytesIO
from PIL import Image

def encode_audio(data: np.ndarray) -> dict:
    """Encode audio data (int16 mono) for Gemini."""
    return {
        "mime_type": "audio/pcm",
        "data": base64.b64encode(data.tobytes()).decode("UTF-8"),
    }

def encode_image(data: np.ndarray) -> dict:
    with BytesIO() as output_bytes:
        pil_image = Image.fromarray(data)
        pil_image.save(output_bytes, "JPEG")
        bytes_data = output_bytes.getvalue()
    base64_str = str(base64.b64encode(bytes_data), "utf-8")
    return {"mime_type": "image/jpeg", "data": base64_str}
```


## 2) Implement the Gemini audio-video handler
This handler:
- Opens a Gemini Live session on startup
- Receives streaming audio from Gemini and yields it back to the client
- Sends microphone audio as it arrives
- Sends a video frame at most once per second (to avoid flooding the API)
- Optionally sends an uploaded image (`gr.Image`) alongside the webcam frame

```python
import asyncio
import os
import time
import numpy as np
import websockets
from dotenv import load_dotenv
from google import genai
from fastrtc import AsyncAudioVideoStreamHandler, wait_for_item

load_dotenv()

class GeminiHandler(AsyncAudioVideoStreamHandler):
    def __init__(self) -> None:
        super().__init__(
            "mono",
            output_sample_rate=24000,
            input_sample_rate=16000,
        )
        self.audio_queue = asyncio.Queue()
        self.video_queue = asyncio.Queue()
        self.session = None
        self.last_frame_time = 0.0
        self.quit = asyncio.Event()

    def copy(self) -> "GeminiHandler":
        return GeminiHandler()

    async def start_up(self):
        client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY"),
            http_options={"api_version": "v1alpha"},
        )
        config = {"response_modalities": ["AUDIO"]}
        async with client.aio.live.connect(
            model="gemini-2.0-flash-exp",
            config=config,
        ) as session:
            self.session = session
            while not self.quit.is_set():
                turn = self.session.receive()
                try:
                    async for response in turn:
                        if data := response.data:
                            # Gemini returns bytes for audio; convert to np.int16 mono
                            audio = np.frombuffer(data, dtype=np.int16).reshape(1, -1)
                            self.audio_queue.put_nowait(audio)
                except websockets.exceptions.ConnectionClosedOK:
                    break

    # Video: receive and (optionally) send frames to Gemini
    async def video_receive(self, frame: np.ndarray):
        self.video_queue.put_nowait(frame)
        if self.session and (time.time() - self.last_frame_time > 1.0):
            self.last_frame_time = time.time()
            await self.session.send(input=encode_image(frame))
            # If there is an uploaded image passed alongside the WebRTC component,
            # it will be available in latest_args[1]
            if self.latest_args[1] is not None:
                await self.session.send(input=encode_image(self.latest_args[1]))

    async def video_emit(self) -> np.ndarray:
        frame = await wait_for_item(self.video_queue, 0.01)
        if frame is not None:
            return frame
        # Fallback while waiting for first frame
        return np.zeros((100, 100, 3), dtype=np.uint8)

    # Audio: forward microphone audio to Gemini
    async def receive(self, frame: tuple[int, np.ndarray]) -> None:
        _, array = frame
        array = array.squeeze()  # (num_samples,)
        audio_message = encode_audio(array)
        if self.session:
            await self.session.send(input=audio_message)

    # Audio: emit Gemini’s audio back to the client
    async def emit(self):
        array = await wait_for_item(self.audio_queue, 0.01)
        if array is not None:
            return (self.output_sample_rate, array)
        return array

    async def shutdown(self) -> None:
        if self.session:
            self.quit.set()
            await self.session.close()
            self.quit.clear()
```


## 3) Setup Stream and Gradio UI
We’ll add an optional `gr.Image` input alongside the `WebRTC` component. The handler will access this in `self.latest_args[1]` when sending frames to Gemini.

```python
import gradio as gr
from fastrtc import Stream, WebRTC

stream = Stream(
    handler=GeminiHandler(),
    modality="audio-video",
    mode="send-receive",
    additional_inputs=[
        gr.Image(label="Image", type="numpy", sources=["upload", "clipboard"])
    ],
    ui_args={
        "icon": "https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png",
        "pulse_color": "rgb(255, 255, 255)",
        "icon_button_color": "rgb(255, 255, 255)",
        "title": "Gemini Audio Video Chat",
    },
)

if __name__ == "__main__":
    stream.ui.launch()
```

### References
- Gemini Audio Video Chat reference code: [Hugging Face Space](https://huggingface.co/spaces/gradio/gemini-audio-video/blob/main/app.py)
- FastRTC docs: `https://fastrtc.org`
- Audio + video user guide: `https://fastrtc.org/userguide/audio-video/`
- Gradio component integration: `https://fastrtc.org/userguide/gradio/`
- Cookbook (live demos + code): `https://fastrtc.org/cookbook/`
