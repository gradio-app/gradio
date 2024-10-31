# Real Time Speech Recognition

Tags: ASR, SPEECH, STREAMING

## Introduction

Automatic speech recognition (ASR), the conversion of spoken speech to text, is a very important and thriving area of machine learning. ASR algorithms run on practically every smartphone, and are becoming increasingly embedded in professional workflows, such as digital assistants for nurses and doctors. Because ASR algorithms are designed to be used directly by customers and end users, it is important to validate that they are behaving as expected when confronted with a wide variety of speech patterns (different accents, pitches, and background audio conditions).

Using `gradio`, you can easily build a demo of your ASR model and share that with a testing team, or test it yourself by speaking through the microphone on your device.

This tutorial will show how to take a pretrained speech-to-text model and deploy it with a Gradio interface. We will start with a **_full-context_** model, in which the user speaks the entire audio before the prediction runs. Then we will adapt the demo to make it **_streaming_**, meaning that the audio model will convert speech as you speak. 

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). You will also need a pretrained speech recognition model. In this tutorial, we will build demos from 2 ASR libraries:

- Transformers (for this, `pip install torch transformers torchaudio`)

Make sure you have at least one of these installed so that you can follow along the tutorial. You will also need `ffmpeg` [installed on your system](https://www.ffmpeg.org/download.html), if you do not already have it, to process files from the microphone.

Here's how to build a real time speech recognition (ASR) app:

1. [Set up the Transformers ASR Model](#1-set-up-the-transformers-asr-model)
2. [Create a Full-Context ASR Demo with Transformers](#2-create-a-full-context-asr-demo-with-transformers)
3. [Create a Streaming ASR Demo with Transformers](#3-create-a-streaming-asr-demo-with-transformers)

## 1. Set up the Transformers ASR Model

First, you will need to have an ASR model that you have either trained yourself or you will need to download a pretrained model. In this tutorial, we will start by using a pretrained ASR model from the model, `whisper`.

Here is the code to load `whisper` from Hugging Face `transformers`.

```python
from transformers import pipeline

p = pipeline("automatic-speech-recognition", model="openai/whisper-base.en")
```

That's it!

## 2. Create a Full-Context ASR Demo with Transformers

We will start by creating a _full-context_ ASR demo, in which the user speaks the full audio before using the ASR model to run inference. This is very easy with Gradio -- we simply create a function around the `pipeline` object above.

We will use `gradio`'s built in `Audio` component, configured to take input from the user's microphone and return a filepath for the recorded audio. The output component will be a plain `Textbox`.

$code_asr
$demo_asr

The `transcribe` function takes a single parameter, `audio`, which is a numpy array of the audio the user recorded. The `pipeline` object expects this in float32 format, so we convert it first to float32, and then extract the transcribed text.

## 3. Create a Streaming ASR Demo with Transformers

To make this a *streaming* demo, we need to make these changes:

1. Set `streaming=True` in the `Audio` component
2. Set `live=True` in the `Interface`
3. Add a `state` to the interface to store the recorded audio of a user

Tip: You can also set `time_limit` and `stream_every` parameters in the interface. The `time_limit` caps the amount of time each user's stream can take. The default is 30 seconds so users won't be able to stream audio for more than 30 seconds. The `stream_every` parameter controls how frequently data is sent to your function. By default it is 0.5 seconds.

Take a look below.

$code_stream_asr

Notice that we now have a state variable because we need to track all the audio history. `transcribe` gets called whenever there is a new small chunk of audio, but we also need to keep track of all the audio spoken so far in the state. As the interface runs, the `transcribe` function gets called, with a record of all the previously spoken audio in the `stream` and the new chunk of audio as `new_chunk`. We return the new full audio to be stored back in its current state, and we also return the transcription. Here, we naively append the audio together and call the `transcriber` object on the entire audio. You can imagine more efficient ways of handling this, such as re-processing only the last 5 seconds of audio whenever a new chunk of audio is received. 

$demo_stream_asr

Now the ASR model will run inference as you speak! 
