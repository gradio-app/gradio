# Multimodal Gradio App Powered by Groq with Automatic Speech Detection

Tags: AUDIO, STREAMING, CHATBOTS, VOICE

## Introduction
Modern voice applications should feel natural and responsive, moving beyond the traditional "click-to-record" pattern. By combining Groq's fast inference capabilities with automatic speech detection, we can create a more intuitive interaction model where users can simply start talking whenever they want to engage with the AI.

> Credits: VAD and Gradio code inspired by [WillHeld's Diva-audio-chat](https://huggingface.co/spaces/WillHeld/diva-audio-chat/tree/main).

In this tutorial, you will learn how to create a multimodal Gradio and Groq app that has automatic speech detection. You can also watch the full video tutorial which includes a demo of the application:

<iframe width="560" height="315" src="https://www.youtube.com/embed/azXaioGdm2Q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Background

Many voice apps currently work by the user clicking record, speaking, then stopping the recording. While this can be a powerful demo, the most natural mode of interaction with voice requires the app to dynamically detect when the user is speaking, so they can talk back and forth without having to continually click a record button. 

Creating a natural interaction with voice and text requires a dynamic and low-latency response. Thus, we need both automatic voice detection and fast inference. With @ricky0123/vad-web powering speech detection and Groq powering the LLM, both of these requirements are met. Groq provides a lightning fast response, and Gradio allows for easy creation of impressively functional apps.

This tutorial shows you how to build a calorie tracking app where you speak to an AI that automatically detects when you start and stop your response, and provides its own text response back to guide you with questions that allow it to give a calorie estimate of your last meal.

## Key Components

- **Gradio**: Provides the web interface and audio handling capabilities
- **@ricky0123/vad-web**: Handles voice activity detection
- **Groq**: Powers fast LLM inference for natural conversations
- **Whisper**: Transcribes speech to text

### Setting Up the Environment

First, let’s install and import our essential libraries and set up a client for using the Groq API. Here’s how to do it:

`requirements.txt`
```
gradio
groq
numpy
soundfile
librosa
spaces
xxhash
datasets
```

`app.py`
```python
import groq
import gradio as gr
import soundfile as sf
from dataclasses import dataclass, field
import os

# Initialize Groq client securely
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError("Please set the GROQ_API_KEY environment variable.")
client = groq.Client(api_key=api_key)
```

Here, we’re pulling in key libraries to interact with the Groq API, build a sleek UI with Gradio, and handle audio data. We’re accessing the Groq API key securely with a key stored in an environment variable, which is a security best practice for avoiding leaking the API key.

---

### State Management for Seamless Conversations

We need a way to keep track of our conversation history, so the chatbot remembers past interactions, and manage other states like whether recording is currently active. To do this, let’s create an `AppState` class:

```python
@dataclass
class AppState:
    conversation: list = field(default_factory=list)
    stopped: bool = False
    model_outs: Any = None
```

Our `AppState` class is a handy tool for managing conversation history and tracking whether recording is on or off. Each instance will have its own fresh list of conversations, making sure chat history is isolated to each session. 

---

### Transcribing Audio with Whisper on Groq

Next, we’ll create a function to transcribe the user’s audio input into text using Whisper, a powerful transcription model hosted on Groq. This transcription will also help us determine whether there’s meaningful speech in the input. Here’s how:

```python
def transcribe_audio(client, file_name):
    if file_name is None:
        return None

    try:
        with open(file_name, "rb") as audio_file:
            response = client.audio.transcriptions.with_raw_response.create(
                model="whisper-large-v3-turbo",
                file=("audio.wav", audio_file),
                response_format="verbose_json",
            )
            completion = process_whisper_response(response.parse())
            return completion
    except Exception as e:
        print(f"Error in transcription: {e}")
        return f"Error in transcription: {str(e)}"
```

This function opens the audio file and sends it to Groq’s Whisper model for transcription, requesting detailed JSON output. verbose_json is needed to get information to determine if speech was included in the audio. We also handle any potential errors so our app doesn’t fully crash if there’s an issue with the API request. 

```python
def process_whisper_response(completion):
    """
    Process Whisper transcription response and return text or null based on no_speech_prob
    
    Args:
        completion: Whisper transcription response object
        
    Returns:
        str or None: Transcribed text if no_speech_prob <= 0.7, otherwise None
    """
    if completion.segments and len(completion.segments) > 0:
        no_speech_prob = completion.segments[0].get('no_speech_prob', 0)
        print("No speech prob:", no_speech_prob)

        if no_speech_prob > 0.7:
            return None
            
        return completion.text.strip()
    
    return None
```

We also need to interpret the audio data response. The process_whisper_response function takes the resulting completion from Whisper and checks if the audio was just background noise or had actual speaking that was transcribed. It uses a threshold of 0.7 to interpret the no_speech_prob, and will return None if there was no speech. Otherwise, it will return the text transcript of the conversational response from the human.


---

### Adding Conversational Intelligence with LLM Integration

Our chatbot needs to provide intelligent, friendly responses that flow naturally. We’ll use a Groq-hosted Llama-3.2 for this:

```python
def generate_chat_completion(client, history):
    messages = []
    messages.append(
        {
            "role": "system",
            "content": "In conversation with the user, ask questions to estimate and provide (1) total calories, (2) protein, carbs, and fat in grams, (3) fiber and sugar content. Only ask *one question at a time*. Be conversational and natural.",
        }
    )

    for message in history:
        messages.append(message)

    try:
        completion = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=messages,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error in generating chat completion: {str(e)}"
```

We’re defining a system prompt to guide the chatbot’s behavior, ensuring it asks one question at a time and keeps things conversational. This setup also includes error handling to ensure the app gracefully manages any issues.

---

### Voice Activity Detection for Hands-Free Interaction

To make our chatbot hands-free, we’ll add Voice Activity Detection (VAD) to automatically detect when someone starts or stops speaking. Here’s how to implement it using ONNX in JavaScript:

```javascript
async function main() {
  const script1 = document.createElement("script");
  script1.src = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.js";
  document.head.appendChild(script1)
  const script2 = document.createElement("script");
  script2.onload = async () =>  {
    console.log("vad loaded");
    var record = document.querySelector('.record-button');
    record.textContent = "Just Start Talking!"
    
    const myvad = await vad.MicVAD.new({
      onSpeechStart: () => {
        var record = document.querySelector('.record-button');
        var player = document.querySelector('#streaming-out')
        if (record != null && (player == null || player.paused)) {
          record.click();
        }
      },
      onSpeechEnd: (audio) => {
        var stop = document.querySelector('.stop-button');
        if (stop != null) {
          stop.click();
        }
      }
    })
    myvad.start()
  }
  script2.src = "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js";
}
```

This script loads our VAD model and sets up functions to start and stop recording automatically. When the user starts speaking, it triggers the recording, and when they stop, it ends the recording.

---

### Building a User Interface with Gradio

Now, let’s create an intuitive and visually appealing user interface with Gradio. This interface will include an audio input for capturing voice, a chat window for displaying responses, and state management to keep things synchronized.

```python
with gr.Blocks(theme=theme, js=js) as demo:
    with gr.Row():
        input_audio = gr.Audio(
            label="Input Audio",
            sources=["microphone"],
            type="numpy",
            streaming=False,
            waveform_options=gr.WaveformOptions(waveform_color="#B83A4B"),
        )
    with gr.Row():
        chatbot = gr.Chatbot(label="Conversation", type="messages")
    state = gr.State(value=AppState())
```

In this code block, we’re using Gradio’s `Blocks` API to create an interface with an audio input, a chat display, and an application state manager. The color customization for the waveform adds a nice visual touch.

---

### Handling Recording and Responses

Finally, let’s link the recording and response components to ensure the app reacts smoothly to user inputs and provides responses in real-time.

```python
    stream = input_audio.start_recording(
        process_audio,
        [input_audio, state],
        [input_audio, state],
    )
    respond = input_audio.stop_recording(
        response, [state, input_audio], [state, chatbot]
    )
```

These lines set up event listeners for starting and stopping the recording, processing the audio input, and generating responses. By linking these events, we create a cohesive experience where users can simply talk, and the chatbot handles the rest.

---

## Summary

1. When you open the app, the VAD system automatically initializes and starts listening for speech
2. As soon as you start talking, it triggers the recording automatically
3. When you stop speaking, the recording ends and:
   - The audio is transcribed using Whisper
   - The transcribed text is sent to the LLM
   - The LLM generates a response about calorie tracking
   - The response is displayed in the chat interface
4. This creates a natural back-and-forth conversation where you can simply talk about your meals and get instant feedback on nutritional content

This app demonstrates how to create a natural voice interface that feels responsive and intuitive. By combining Groq's fast inference with automatic speech detection, we've eliminated the need for manual recording controls while maintaining high-quality interactions. The result is a practical calorie tracking assistant that users can simply talk to as naturally as they would to a human nutritionist.

Link to GitHub repository: [Groq Gradio Basics](https://github.com/bklieger-groq/gradio-groq-basics/tree/main/calorie-tracker)