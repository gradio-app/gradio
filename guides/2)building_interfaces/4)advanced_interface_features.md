# Advanced Interface Features

## Interpreting your Predictions

Most models are black boxes such that the internal logic of the function is hidden from the end user. To encourage transparency, we've made it very easy to add interpretation to your model by  simply setting the `interpretation` keyword in the `Interface` class to `default`. This allows your users to understand what parts of the input are responsible for the output. Take a look at the simple interface below which shows an image classifier that also includes interpretation:

$code_image_classifier_interpretation


In addition to `default`, Gradio also includes [Shapley-based interpretation](https://christophm.github.io/interpretable-ml-book/shap.html), which provides more accurate interpretations, albeit usually with a slower runtime. To use this, simply set the `interpretation` parameter to `"shap"` (note: also make sure the python package `shap` is installed). Optionally, you can modify the the `num_shap` parameter, which controls the tradeoff between accuracy and runtime (increasing this value generally increases accuracy). Here is an example:

```python
gr.Interface(fn=classify_image, inputs=image, outputs=label, interpretation="shap", num_shap=5).launch()
```

This will work for any function, even if internally, the model is a complex neural network or some other black box. If you use Gradio's `default` or `shap` interpretation, the output component must be a `Label`. All common input components are supported. Here is an example with text input.

$code_gender_sentence_default_interpretation

So what is happening under the hood? With these interpretation methods, Gradio runs the prediction multiple times with modified versions of the input. Based on the results, you'll see that the interface automatically highlights the parts of the text (or image, etc.) that contributed increased the likelihood of the class as red. The intensity of color corresponds to the importance of that part of the input. The parts that decrease the class confidence are highlighted blue.

You can also write your own interpretation function. The demo below adds custom interpretation to the previous demo. This function will take the same inputs as the main wrapped function. The output of this interpretation function will be used to highlight the input of each input component - therefore the function must return a list where the number of elements corresponds to the number of input components. To see the format for interpretation for each input component, check the Docs.

$code_gender_sentence_custom_interpretation

## Custom Styling

If you'd like to have more fine-grained control over any aspect of your demo, you can also write your own css or pass in a filepath to a css file, with the `css` parameter of the `Interface` class.

```python
gr.Interface(..., css="body {background-color: red}")
```

If you'd like to reference external files in your css, preface the file path (which can be a relative or absolute path) with "file=", for example:

```python
gr.Interface(..., css="body {background-image: url('file=clouds.jpg')}")
```

## Loading Hugging Face Models and Spaces

Gradio integrates nicely with the Hugging Face Hub, allowing you to load models and Spaces with just one line of code. To use this, simply use the `load()` method in the `Interface` class. So:

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
gr.Interface.load("spaces/eugenesiow/remove-bg", inputs="webcam", title="Remove your webcam background!").launch()
```

One of the great things about loading Hugging Face models or spaces using Gradio is that you can then immediately use the resulting `Interface` object just like function in your Python code (this works for every type of model/space: text, images, audio, video, and even multimodal models):

```python
io = gr.Interface.load("models/EleutherAI/gpt-neo-2.7B")
io("It was the best of times")  # outputs model completion
```

## Putting Interfaces in Parallel and Series

Gradio also lets you mix interfaces very easily using the `gradio.Parallel` and `gradio.Series` classes. `Parallel` lets you put two similar models (if they have the same input type) in parallel to compare model predictions:

```python
generator1 = gr.Interface.load("huggingface/gpt2")
generator2 = gr.Interface.load("huggingface/EleutherAI/gpt-neo-2.7B")
generator3 = gr.Interface.load("huggingface/EleutherAI/gpt-j-6B")

gr.Parallel(generator1, generator2, generator3).launch()
```

`Series` lets you put models and spaces in series, piping the output of one model into the input of the next model. 

```python
generator = gr.Interface.load("huggingface/gpt2")
translator = gr.Interface.load("huggingface/t5-small")

gr.Series(generator, translator).launch()  # this demo generates text, then translates it to German, and outputs the final result.
```

And of course, you can also mix `Parallel` and `Series` together whenever that makes sense!
