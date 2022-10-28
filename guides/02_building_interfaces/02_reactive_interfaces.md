# Reactive Interfaces

## Live Interfaces

You can make interfaces automatically refresh by setting `live=True` in the interface. Now the interface will recalculate as soon as the user input changes.

$code_calculator_live
$demo_calculator_live

Note there is no submit button, because the interface resubmits automatically on change.

## Streaming Components

Some components have a "streaming" mode, such as `Audio` component in microphone mode, or the `Image` component in webcam mode. Streaming means data is sent continuously to the backend and the `Interface` function is continuously being rerun. 

The difference between `gr.Audio(source='microphone')` and `gr.Audio(source='microphone', streaming=True)`, when both are used in `gr.Interface(live=True)`, is that the first  `Component` will automatically submit data and run the `Interface` function when the user stops recording, whereas the second `Component` will continuously send data and run the `Interface` function *during* recording.

Here is example code of streaming images from the webcam.

$code_stream_frames