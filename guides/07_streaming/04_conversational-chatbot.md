# Conversational Chatbots

Tags: AUDIO, STREAMING, CHATBOTS

The next generation of AI user interfaces will be audio-native.
Users will be able to speak to a chatbot and the chatbot will talk back.
Several models have been built under this paradigm, namely GPT-4o and [mini omni](https://github.com/gpt-omni/mini-omni).

In this guide, we'll cover how you can build your own conversational chat application by using mini omni as an example. You can see a demo of the finished app below!

[omni mini demo](https://github.com/user-attachments/assets/db36f4db-7535-49f1-a2dd-bd36c487ebdf)

## App Overview

Our application should enable the following use case:
* Users click a button to start recording their message
* When we detect the user has finished speaking we stop their recording
* We will then pass the user audio to the omni model and stream back omni's response
* After omni mini has finished speaking, we turn on the user's webcam
* All of the previously spoken audio, from both the user and omni, will be displayed in a chatbot component.

Let's get started.


## Processing the User's Audio

We will be streaming the user's audio from their microphone to the server and on each new chunk of audio we will determine if the user stopped speaking.

Our function, called `process_audio` will look like the following:

```python
import numpy as np

from utils import determine_pause

def process_audio(audio: tuple, state: AppState):
    if state.stream is None:
        state.stream = audio[1]
        state.sampling_rate = audio[0]
    else:
        state.stream =  np.concatenate((state.stream, audio[1]))

    pause_detected = determine_pause(state.stream, state.sampling_rate, state)
    state.pause_detected = pause_detected

    if state.pause_detected and state.started_talking:
        return gr.Audio(recording=False), state
    return None, state
```

It's inputs will be the current audio chunk, represented as a tuple of form `(sampling_rate, numpy array of audio)`, and the current application state. In this demo, the application state will be the following dataclass:

```python
@dataclass
class AppState:
    stream: np.ndarray | None = None
    sampling_rate: int = 0
    pause_detected: bool = False
    stopped: bool = False
    conversation: list = []
```

We concatenate the next chunk of audio to an array that's storing all of the previous audio and the run the `pause_detected` function to determine if the user stopped speaking.
If the user stopped speaking, we return an update to the component to tell it to stop recording. If not, we return `None` to signify "no updates". In both cases, we return the current `AppState`.

The implementation of the `determine_pause` function is not covered in this guide since it's specific to the omni-mini implementation but the source code is [here](https://huggingface.co/spaces/gradio/omni-mini/blob/eb027808c7bfe5179b46d9352e3fa1813a45f7c3/app.py#L98).


## Generating the Response

First, we will convert the user's message, stored in `AppState.stream`, to an array of bytes (this is specific to the omni-mini implementation). We will use the `pydub` library to do this which is already a dependency of Gradio.

Then we will stream the generated audio back to the user by iterating over the outputs of the `speaking` function. Once again, we won't cover the implmentation of that function but its source code can be found [here](https://huggingface.co/spaces/gradio/omni-mini/blob/main/app.py#L116).

Our function is called `response` and it's full implementation is below:

```python
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

You'll notice that before and after running the `speaking` function, we save the user or omni audio to a file and append to the `state.conversation` list. This is so that we can store the entire conversation and display it in a chatbot component. 

## The Gradio App

We will build the Gradio app with the Blocks API. On the left hand side we will place the input audio component for recording the user's message. On the right hand side, we will show the chatbot and the output audio component for omni's most recent response.

We use the `stream` event in the input audio component to stream the user's audio to the server. The `stream_every` parameter means that we will stream the audio in chunks of 0.5 seconds. On each chunk we will run the `process_audio` function. The `time_limit` parameter means that we will process the user's audio for a maximum of 30 seconds.

Once the input audio component has stopped recording, we will generate a response with the `response` function. After the response is done generating, we will add the latest state of the conversation to the chatbot by making use of the `then` event. 

We will also add a button to stop and reset the conversation. The full implementation of the UI is below:

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

## Conclusion

You can adapt the skeleton of this application to fit any conversational chatbot demos. You can see the full application running on Hugging Face Spaces here: https://huggingface.co/spaces/gradio/omni-mini