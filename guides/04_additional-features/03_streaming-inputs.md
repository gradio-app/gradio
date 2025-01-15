# Streaming inputs

In the previous guide, we covered how to stream a sequence of outputs from an event handler. Gradio also allows you to stream images from a user's camera or audio chunks from their microphone **into** your event handler. This can be used to create real-time object detection apps or conversational chat applications with Gradio.

Currently, the `gr.Image` and the `gr.Audio` components support input streaming via the `stream` event.
Let's create the simplest streaming app possible, which simply returns the webcam stream unmodified.

$code_streaming_simple
$demo_streaming_simple

Try it out! The streaming event is triggered when the user starts recording. Under the hood, the webcam will take a photo every 0.1 seconds and send it to the server. The server will then return that image.

There are two unique keyword arguments for the `stream` event:

* `time_limit` - This is the amount of time the gradio server will spend processing the event. Media streams are naturally unbounded so it's important to set a time limit so that one user does not hog the Gradio queue. The time limit only counts the time spent processing the stream, not the time spent waiting in the queue. The orange bar displayed at the bottom of the input image represents the remaining time. When the time limit expires, the user will automatically rejoin the queue.

* `stream_every` - This is the frequency (in seconds) with which the stream will capture input and send it to the server. For demos like image detection or manipulation, setting a smaller value is desired to get a "real-time" effect. For demos like speech transcription, a higher value is useful so that the transcription algorithm has more context of what's being said.

## A Realistic Image Demo

Let's create a demo where a user can choose a filter to apply to their webcam stream. Users can choose from an edge-detection filter, a cartoon filter, or simply flipping the stream vertically.

$code_streaming_filter
$demo_streaming_filter

You will notice that if you change the filter value it will immediately take effect in the output stream. That is an important difference of stream events in comparison to other Gradio events. The input values of the stream can be changed while the stream is being processed. 

Tip: We set the "streaming" parameter of the image output component to be "True". Doing so lets the server automatically convert our output images into base64 format, a format that is efficient for streaming.

## Unified Image Demos

For some image streaming demos, like the one above, we don't need to display separate input and output components. Our app would look cleaner if we could just display the modified output stream.

We can do so by just specifying the input image component as the output of the stream event.

$code_streaming_filter_unified
$demo_streaming_filter_unified

## Keeping track of past inputs or outputs

Your streaming function should be stateless. It should take the current input and return its corresponding output. However, there are cases where you may want to keep track of past inputs or outputs. For example, you may want to keep a buffer of the previous `k` inputs to improve the accuracy of your transcription demo. You can do this with Gradio's `gr.State()` component.

Let's showcase this with a sample demo:

```python
def transcribe_handler(current_audio, state, transcript):
    next_text = transcribe(current_audio, history=state)
    state.append(current_audio)
    state = state[-3:]
    return state, transcript + next_text

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            mic = gr.Audio(sources="microphone")
            state = gr.State(value=[])
        with gr.Column():
            transcript = gr.Textbox(label="Transcript")
    mic.stream(transcribe_handler, [mic, state, transcript], [state, transcript],
               time_limit=10, stream_every=1)


demo.launch()
```

## End-to-End Examples

For an end-to-end example of streaming from the webcam, see the object detection from webcam [guide](/main/guides/object-detection-from-webcam-with-webrtc).