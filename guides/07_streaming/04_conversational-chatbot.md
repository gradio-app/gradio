# Building Conversational Chatbots with Gradio

Tags: AUDIO, STREAMING, CHATBOTS

## Introduction

The next generation of AI user interfaces is moving towards audio-native experiences. Users will be able to speak to chatbots and receive spoken responses in return. Several models have been built under this paradigm, including GPT-4o and [mini omni](https://github.com/gpt-omni/mini-omni).

In this guide, we'll walk you through building your own conversational chat application using mini omni as an example. You can see a demo of the finished app below:

<video src="https://github.com/user-attachments/assets/db36f4db-7535-49f1-a2dd-bd36c487ebdf" controls
height="600" width="600" style="display: block; margin: auto;" autoplay="true" loop="true">
</video>

## Application Overview

Our application will enable the following user experience:

1. Users click a button to start recording their message
2. The app detects when the user has finished speaking and stops recording
3. The user's audio is passed to the omni model, which streams back a response
4. After omni mini finishes speaking, the user's microphone is reactivated
5. All previous spoken audio, from both the user and omni, is displayed in a chatbot component

Let's dive into the implementation details.

## Processing User Audio

We'll stream the user's audio from their microphone to the server and determine if the user has stopped speaking on each new chunk of audio.

Here's our `process_audio` function:

```python
import numpy as np
from utils import determine_pause

def process_audio(audio: tuple, state: AppState):
    if state.stream is None:
        state.stream = audio[1]
        state.sampling_rate = audio[0]
    else:
        state.stream = np.concatenate((state.stream, audio[1]))

    pause_detected = determine_pause(state.stream, state.sampling_rate, state)
    state.pause_detected = pause_detected

    if state.pause_detected and state.started_talking:
        return gr.Audio(recording=False), state
    return None, state
```

This function takes two inputs:
1. The current audio chunk (a tuple of `(sampling_rate, numpy array of audio)`)
2. The current application state

We'll use the following `AppState` dataclass to manage our application state:

```python
from dataclasses import dataclass

@dataclass
class AppState:
    stream: np.ndarray | None = None
    sampling_rate: int = 0
    pause_detected: bool = False
    stopped: bool = False
    conversation: list = []
```

The function concatenates new audio chunks to the existing stream and checks if the user has stopped speaking. If a pause is detected, it returns an update to stop recording. Otherwise, it returns `None` to indicate no changes.

The implementation of the `determine_pause` function is specific to the omni-mini project and can be found [here](https://huggingface.co/spaces/gradio/omni-mini/blob/eb027808c7bfe5179b46d9352e3fa1813a45f7c3/app.py#L98).

## Generating the Response

After processing the user's audio, we need to generate and stream the chatbot's response. Here's our `response` function:

```python
import io
import tempfile
from pydub import AudioSegment

def response(state: AppState):
    if not state.pause_detected and not state.started_talking:
        return None, AppState()
    
    audio_buffer = io.BytesIO()

    segment = AudioSegment(
        state.stream.tobytes(),
        frame_rate=state.sampling_rate,
        sample_width=state.stream.dtype.itemsize,
        channels=(1 if len(state.stream.shape) == 1 else state.stream.shape[1]),
    )
    segment.export(audio_buffer, format="wav")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_buffer.getvalue())
    
    state.conversation.append({"role": "user",
                                "content": {"path": f.name,
                                "mime_type": "audio/wav"}})
    
    output_buffer = b""

    for mp3_bytes in speaking(audio_buffer.getvalue()):
        output_buffer += mp3_bytes
        yield mp3_bytes, state

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(output_buffer)
    
    state.conversation.append({"role": "assistant",
                    "content": {"path": f.name,
                                "mime_type": "audio/mp3"}})
    yield None, AppState(conversation=state.conversation)
```

This function:
1. Converts the user's audio to a WAV file
2. Adds the user's message to the conversation history
3. Generates and streams the chatbot's response using the `speaking` function
4. Saves the chatbot's response as an MP3 file
5. Adds the chatbot's response to the conversation history

Note: The implementation of the `speaking` function is specific to the omni-mini project and can be found [here](https://huggingface.co/spaces/gradio/omni-mini/blob/main/app.py#L116).

## Building the Gradio App

Now let's put it all together using Gradio's Blocks API:

```python
import gradio as gr

def start_recording_user(state: AppState):
    if not state.stopped:
        return gr.Audio(recording=True)

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_audio = gr.Audio(
                label="Input Audio", sources="microphone", type="numpy"
            )
        with gr.Column():
            chatbot = gr.Chatbot(label="Conversation", type="messages")
            output_audio = gr.Audio(label="Output Audio", streaming=True, autoplay=True)
    state = gr.State(value=AppState())

    stream = input_audio.stream(
        process_audio,
        [input_audio, state],
        [input_audio, state],
        stream_every=0.5,
        time_limit=30,
    )
    respond = input_audio.stop_recording(
        response,
        [state],
        [output_audio, state]
    )
    respond.then(lambda s: s.conversation, [state], [chatbot])

    restart = output_audio.stop(
        start_recording_user,
        [state],
        [input_audio]
    )
    cancel = gr.Button("Stop Conversation", variant="stop")
    cancel.click(lambda: (AppState(stopped=True), gr.Audio(recording=False)), None,
                [state, input_audio], cancels=[respond, restart])

if __name__ == "__main__":
    demo.launch()
```

This setup creates a user interface with:
- An input audio component for recording user messages
- A chatbot component to display the conversation history
- An output audio component for the chatbot's responses
- A button to stop and reset the conversation

The app streams user audio in 0.5-second chunks, processes it, generates responses, and updates the conversation history accordingly.

## Conclusion

This guide demonstrates how to build a conversational chatbot application using Gradio and the mini omni model. You can adapt this framework to create various audio-based chatbot demos. To see the full application in action, visit the Hugging Face Spaces demo: https://huggingface.co/spaces/gradio/omni-mini

Feel free to experiment with different models, audio processing techniques, or user interface designs to create your own unique conversational AI experiences!