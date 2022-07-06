# Real Time Speech Recognition 

Related spaces: https://huggingface.co/spaces/abidlabs/streaming-asr-paused, https://huggingface.co/spaces/abidlabs/full-context-asr
Tags: ASR, SPEECH, STREAMING
Docs: audio, state, textbox

## Introduction

Automatic speech recognition (ASR), the conversion of spoken speech to text, is a very important and thriving area of machine learning. ASR algorithms run on practically every smartphone, and are becoming increasingly embedded in professional workflows, such as digital assistants for nurses and doctors. Because ASR algorithms are designed to be used directly by customers and end users, it is important to validate that they are behaving as expected when confronted with a wide variety of speech patterns (different accents, pitches, and background audio conditions).

Using `gradio`, you can easily build a demo of your ASR model and share that with a testing team, or test it yourself by speaking through the microphone on your device.

This tutorial will show how to take a pretrained speech to text model and deploy it with a Gradio interface. We will start with a ***full-context*** model, in which the user speaks the entire audio before the prediction runs. Then we will adapt the demo to make it ***streaming***, meaning that the audio model will convert speech as you speak. The streaming demo that we create will look something like this (try it below or [in a new tab](https://huggingface.co/spaces/abidlabs/streaming-asr-paused)!):

<iframe src="https://hf.space/gradioiframe/abidlabs/streaming-asr-paused/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

Real-time ASR is inherently *stateful*, meaning that the model's predictions change depending on what words the user previously spoke. So, in this tutorial, we will also cover how to use **state** with Gradio demos. 

### Prerequisites

Make sure you have the `gradio` Python package already [installed](/getting_started). You will also need a pretrained speech recognition model. In this tutorial, we will build demos from 2 ASR libraries:

* Transformers (for this, `pip install transformers` and `pip install torch`) 
* DeepSpeech (`pip install deepspeech==0.8.2`)

Make sure you have at least one of these installed so that you can follow along the tutorial. You will also need `ffmpeg` [installed on your system](https://www.ffmpeg.org/download.html), if you do not already have it, to process files from the microphone.

## Step 1 — Setting up the Transformers ASR Model

First, you will need to have an ASR model that you have either trained yourself or you will need to download a pretrained model. In this tutorial, we will start by using a pretrained ASR model from the Hugging Face model, `Wav2Vec2`. 

Here is the code to load `Wav2Vec2` from Hugging Face `transformers`.

```python
from transformers import pipeline

p = pipeline("automatic-speech-recognition")
```

That's it! By default, the automatic speech recognition model pipeline loads Facebook's `facebook/wav2vec2-base-960h` model.

## Step 2 — Creating a Full-Context ASR Demo with Transformers 

We will start by creating a *full-context* ASR demo, in which the user speaks the full audio before using the ASR model to run inference. This is very easy with Gradio -- we simply create a function around the `pipeline` object above.

We will use `gradio`'s built in `Audio` component, configured to take input from the user's microphone and return a filepath for the recorded audio. The output component will be a plain `Textbox`.

```python
import gradio as gr

def transcribe(audio):
    text = p(audio)["text"]
    return text

gr.Interface(
    fn=transcribe, 
    inputs=gr.inputs.Audio(source="microphone", type="filepath"), 
    outputs="text").launch()
```

So what's happening here? The `transcribe` function takes a single parameter, `audio`, which is a filepath to the audio file that the user has recorded. The `pipeline` object expects a filepath and converts it to text, which is returned to the frontend and displayed in a textbox. 

Let's see it in action! (Record a short audio clip and then click submit, or [open in a new tab](https://huggingface.co/spaces/abidlabs/full-context-asr)):

<iframe src="https://hf.space/gradioiframe/abidlabs/full-context-asr/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>

## Step 3 — Creating a Streaming ASR Demo  with Transformers

Ok great! We've built an ASR model that works well for short audio clips. However, if you are recording longer audio clips, you probably want a *streaming* interface, one that transcribes audio as the user speaks instead of just all-at-once at the end.

The good news is that it's not too difficult to adapt the demo we just made to make it streaming, using the same `Wav2Vec2` model. 

The biggest change is that we must now introduce a `state` parameter, which holds the audio that has been *transcribed so far*. This allows us to only the latest chunk of audio and simply append it to the audio we previously transcribed. 

When adding state to a Gradio demo, you need to do a total of 3 things:

* Add a `state` parameter to the function
* Return the updated `state` at the end of the function
* Add the `"state"` components to the `inputs` and `outputs` in `Interface`

Here's what the code looks like:

```python
import gradio as gr

def transcribe(audio, state=""):
    text = p(audio)["text"]
    state += text + " "
    return state, state

gr.Interface(
    fn=transcribe, 
    inputs=[
        gr.inputs.Audio(source="microphone", type="filepath"), 
        "state"
    ],
    outputs=[
        "textbox",
        "state"
    ],
    live=True).launch()
```

Notice that we've also made one other change, which is that we've set `live=True`. This keeps the Gradio interface running constantly, so it automatically transcribes audio without the user having to repeatedly hit the submit button.

Let's see how it does (try below or [in a new tab](https://huggingface.co/spaces/abidlabs/streaming-asr))!

<iframe src="https://hf.space/gradioiframe/abidlabs/streaming-asr/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


One thing that you may notice is that the transcription quality has dropped since the chunks of audio are so small, they lack the context to properly be transcribed. A "hacky" fix to this is to simply increase the runtime of the `transcribe()` function so that longer audio chunks are processed. We can do this by adding a `time.sleep()` inside the function, as shown below (we'll see a proper fix next) 

```python
from transformers import pipeline
import gradio as gr
import time

p = pipeline("automatic-speech-recognition")

def transcribe(audio, state=""):
    time.sleep(2)
    text = p(audio)["text"]
    state += text + " "
    return state, state

gr.Interface(
    fn=transcribe, 
    inputs=[
        gr.inputs.Audio(source="microphone", type="filepath"), 
        "state"
    ],
    outputs=[
        "textbox",
        "state"
    ],
    live=True).launch()
```

Try the demo below to see the difference (or [open in a new tab](https://huggingface.co/spaces/abidlabs/streaming-asr-paused))!

<iframe src="https://hf.space/gradioiframe/abidlabs/streaming-asr-paused/+" frameBorder="0" height="350" title="Gradio app" class="container p-0 flex-grow space-iframe" allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads"></iframe>


## Step 4 — Creating a Streaming ASR Demo with DeepSpeech

You're not restricted to ASR models from the `transformers` library -- you can use your own models or models from other libraries. The `DeepSpeech` library contains models that are specifically designed to handle streaming audio data. These models perform really well with  streaming data as they are able to account for previous chunks of audio data when making predictions.

Going through the DeepSpeech library is beyond the scope of this Guide (check out their [excellent documentation here](https://deepspeech.readthedocs.io/en/r0.9/)), but you can use Gradio very similarly with a DeepSpeech ASR model as with a Transformers ASR model. 

Here's a complete example (on Linux):

First install the DeepSpeech library and download the pretrained models from the terminal:

```bash
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.8.2/deepspeech-0.8.2-models.pbmm
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.8.2/deepspeech-0.8.2-models.scorer
apt install libasound2-dev portaudio19-dev libportaudio2 libportaudiocpp0 ffmpeg
pip install deepspeech==0.8.2
```

Then, create a similar `transcribe()` function as before:

```python
from deepspeech import Model
import numpy as np

model_file_path = "deepspeech-0.8.2-models.pbmm"
lm_file_path = "deepspeech-0.8.2-models.scorer"
beam_width = 100
lm_alpha = 0.93
lm_beta = 1.18

model = Model(model_file_path)
model.enableExternalScorer(lm_file_path)
model.setScorerAlphaBeta(lm_alpha, lm_beta)
model.setBeamWidth(beam_width)


def reformat_freq(sr, y):
    if sr not in (
        48000,
        16000,
    ):  # Deepspeech only supports 16k, (we convert 48k -> 16k)
        raise ValueError("Unsupported rate", sr)
    if sr == 48000:
        y = (
            ((y / max(np.max(y), 1)) * 32767)
            .reshape((-1, 3))
            .mean(axis=1)
            .astype("int16")
        )
        sr = 16000
    return sr, y


def transcribe(speech, stream):
    _, y = reformat_freq(*speech)
    if stream is None:
        stream = model.createStream()
    stream.feedAudioContent(y)
    text = stream.intermediateDecode()
    return text, stream

```

Then, create a Gradio Interface as before (the only difference being that the return type should be `numpy` instead of a `filepath` to be compatible with the DeepSpeech models)

```python
import gradio as gr

gr.Interface(
    fn=transcribe, 
    inputs=[
        gr.inputs.Audio(source="microphone", type="numpy"), 
        "state"
    ], 
    outputs= [
        "text", 
        "state"
    ], 
    live=True).launch()
```

Running all of this should allow you to deploy your realtime ASR model with a nice GUI. Try it out and see how well it works for you.

--------------------------------------------


And you're done! That's all the code you need to build a web-based GUI for your ASR model. 

Fun tip: you can share your ASR model instantly with others simply by setting `share=True` in `launch()`. 


