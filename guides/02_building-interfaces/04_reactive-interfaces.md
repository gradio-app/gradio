# Reactive Interfaces

Finally, we cover how to get Gradio demos to refresh automatically or continuously stream data.

## Live Interfaces

You can make interfaces automatically refresh by setting `live=True` in the interface. Now the interface will recalculate as soon as the user input changes.

$code_calculator_live
$demo_calculator_live

Note there is no submit button, because the interface resubmits automatically on change.

## Streaming Components

Some components have a "streaming" mode, such as `Audio` component in microphone mode, or the `Image` component in webcam mode. Streaming means data is sent continuously to the backend and the `Interface` function is continuously being rerun.

The difference between `gr.Audio(source='microphone')` and `gr.Audio(source='microphone', streaming=True)`, when both are used in `gr.Interface(live=True)`, is that the first `Component` will automatically submit data and run the `Interface` function when the user stops recording, whereas the second `Component` will continuously send data and run the `Interface` function _during_ recording.

Here is example code of streaming images from the webcam.

$code_stream_frames

Streaming can also be done in an output component. A `gr.Audio(streaming=True)` output component can take a stream of audio data yielded piece-wise by a generator function and combines them into a single audio file. For a detailed example, see our guide on performing [automatic speech recognition](/guides/real-time-speech-recognition) with Gradio.
