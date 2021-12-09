## Working With Machine Learning

We'll take a look at a few examples that dive into how Gradio applications can be built specifically for machine learning models. To run the code for any of these examples, simply click the "open in Colab" button next to the example.

### Image Classification in Tensorflow / Keras [![Colab link](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1NWE_SDgQPI6GIpnhtWeEOHCPejC2FaZc?usp=sharing)

We'll start with the MobileNetV2 image classifier, which we'll load using Tensorflow! Since this is an image classification model, we will use the `Image` input interface. We'll output a dictionary of labels and their corresponding confidence scores with the `Label` output interface.

{{ code["image_classifier"] }}

This code will produce the interface below. The interface gives you a way to test MobileNetV2 by dragging and dropping images, and also allows you to use naturally modify the input image using image editing tools that appear when you click the edit button. Notice here we provided actual `gradio.inputs` and `gradio.outputs` objects to the Interface function instead of using string shortcuts. This lets us use built-in preprocessing (e.g. image resizing) and postprocessing (e.g. choosing the number of labels to display) provided by these interfaces.

Try it out in your device or run it in a [colab notebook](https://colab.research.google.com/drive/1NWE_SDgQPI6GIpnhtWeEOHCPejC2FaZc?usp=sharing)!


#### Add Interpretation

The above code also shows how you can add interpretation to your interface. You can use our out of the box functions for text and image interpretation or use your own interpretation functions. To use the out of the box functions just specify “default” for the interpretation parameter.

```python
gr.Interface(classify_image, image, label, interpretation="default").launch();
```

### Image Classification in Pytorch [![Colab link](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1S6seNoJuU7_-hBX5KbXQV4Fb_bbqdPBk?usp=sharing)


Let's now wrap a very similar model, ResNet, except this time in Pytorch. We'll also use the `Image` to `Label` interface. (The original ResNet architecture [can be found here](https://arxiv.org/abs/1512.03385)

{{ code["image_classifier_2"] }}


### Text Generation with Hugging Face Transformers (GPT-J) [![Colab link](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1o_-QIR8yVphfnbNZGYemyEr111CHHxSv?usp=sharing)

Let's wrap a `Text` to `Text` interface around GPT-J, a text generation model that works on provided starter text. [Click here to learn more about GPT-J](https://towardsdatascience.com/how-you-can-use-gpt-j-9c4299dd8526) and similar language models. We're loading the model directly from the Hugging Face model repo, and providing a few example prompts.

{{ code["hello_world"] }}

### Answering Questions with BERT-QA [![Colab link](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1RuiMJz_7jDXpi59jDgW02NsBnlz1aY1S?usp=sharing)

What if our model takes more than one input? Let's wrap a 2-input to 1-output interface around Roberta-base, a model that can [answer general questions](https://arxiv.org/abs/1909.05017). Like previously, we will load the model from Hugging Face model hub, but this time, we will override the default inputs and outputs so that we can customize the interface (e.g. put placeholder text).

{{ code["question_answer"] }}

As shown in the code, Gradio can wrap functions with multiple inputs or outputs, simply by taking the list ofcomponents needed. The number of input components should match the number of parameters taken by the function or API (in this case 2: the context and question). The number of output components should match the number of values returned by the function (in this case, also 2: the answer and the probability it is correct). 


### A Multilingual Speech Recognition Demo [![Colab link](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1RWmRgoHklrv7r0NqDefX8aFryIojJPT7?usp=sharing)

Gradio can do more than just images, videos, and text. The Audio input component is popular for speech-to-text applications (and the analogous Audio output component is useful for text-to-speech applications).  Click "open in Colab" button to see a complete example of the code needed for a complete speech recognition demo in mutiple languages. The Gradio-relevant part of the code is extracted below. 

```python
import gradio as gr
    
iface = gr.Interface(
    fn=transcribe, 
    inputs=[
        gr.inputs.Audio(source="microphone", type='filepath'),
        gr.inputs.Dropdown(target_language),
    ],
    outputs="text",
    layout="horizontal",
    theme="huggingface",
    title="XLS-R 300M EN-to-15 Speech Translation",
)

iface.launch()
```

### Numerical Interfaces: Titanic Survival Model with Scikit-Learn [![Colab link](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1xOU3sDHs7yZjuBosbQ8Zb2oc4BegfSFX?usp=sharing)

Many models have numeric or categorical inputs, which we support with a variety of interfaces. Let's wrap multiple input to label interface around a [Titanic survival model](https://www.kaggle.com/c/titanic). See the full code include the training step by clicking on "open in Colab" button.

{{ code["titanic_survival"] }}

