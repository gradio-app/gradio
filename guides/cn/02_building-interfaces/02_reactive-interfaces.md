# 反应式界面 (Reactive Interfaces)

本指南介绍了如何使 Gradio 界面自动刷新或连续流式传输数据。

## 实时界面 (Live Interfaces)

您可以通过在界面中设置 `live=True` 来使界面自动刷新。现在，只要用户输入发生变化，界面就会重新计算。

$code_calculator_live
$demo_calculator_live

注意，因为界面在更改时会自动重新提交，所以没有提交按钮。

## 流式组件 (Streaming Components)

某些组件具有“流式”模式，比如麦克风模式下的 `Audio` 组件或网络摄像头模式下的 `Image` 组件。流式传输意味着数据会持续发送到后端，并且 `Interface` 函数会持续重新运行。

当在 `gr.Interface(live=True)` 中同时使用 `gr.Audio(sources=['microphone'])` 和 `gr.Audio(sources=['microphone'], streaming=True)` 时，两者的区别在于第一个 `Component` 会在用户停止录制时自动提交数据并运行 `Interface` 函数，而第二个 `Component` 会在录制过程中持续发送数据并运行 `Interface` 函数。

以下是从网络摄像头实时流式传输图像的示例代码。

$code_stream_frames
