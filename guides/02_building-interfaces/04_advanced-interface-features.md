# Advanced Interface Features

## Loading Hugging Face Models and Spaces

Gradio integrates nicely with the [Hugging Face Hub](https://hf.co), allowing you to load models and Spaces with just one line of code. To use this, simply use the `load()` method in the `Interface` class. So:

- To load any model from the Hugging Face Hub and create an interface around it, you pass `"model/"` or `"huggingface/"` followed by the model name, like these examples:

```python
gr.Interface.load("huggingface/gpt2").launch();
```

```python
gr.Interface.load("huggingface/EleutherAI/gpt-j-6B",
    inputs=gr.Textbox(lines=5, label="Input Text")  # customizes the input component
).launch()
```

- To load any Space from the Hugging Face Hub and recreate it locally (so that you can customize the inputs and outputs for example), you pass `"spaces/"` followed by the model name:

```python
gr.Interface.load("spaces/eugenesiow/remove-bg",
                  inputs="webcam",
                  title="Remove your webcam background!").launch()
```

One of the great things about loading Hugging Face models or spaces using Gradio is that you can then immediately use the resulting `Interface` object just like function in your Python code (this works for every type of model/space: text, images, audio, video, and even multimodal models):

```python
io = gr.Interface.load("models/EleutherAI/gpt-neo-2.7B")
io("It was the best of times")  # outputs model completion
```
