# Custom Machine Learning Interpretations with Blocks
Tags: INTERPRETATION, SENTIMENT ANALYSIS

**Prerequisite**: This Guide requires you to know about Blocks and the interpretation feature of Interfaces.
Make sure to [read the Guide to Blocks first](/introduction_to_blocks) as well as the
interpretation section of the [Advanced Interface Features Guide](/advanced_interface_features#interpreting-your-predictions).

## Introduction

If you have experience working with the Interface class, then you know that interpreting the prediction of your machine learning model
is as easy as setting the `interpretation` parameter to either "default" or "shap".

You may be wondering if it is possible to add the same interpretation functionality to an app built with the Blocks API.
Not only is it possible, but the flexibility of Blocks lets you display the interpretation output in ways that are
impossible to do with Interfaces!

This guide will show how to:

1. Recreate the behavior of Interfaces's interpretation feature in a Blocks app.
2. Customize how interpretations are displayed in a Blocks app.

Let's get started!

## Setting up the Blocks app

Let's build a sentiment classification app with the Blocks API.
This app will take text as input and output the probability that this text expresses either negative or positive sentiment.
We'll have a single input `Textbox` and a single output `Label` component.
Below is the code for the app as well as the app itself.

```python
import gradio as gr 
from transformers import pipeline

sentiment_classifier = pipeline("text-classification", return_all_scores=True)

def classifier(text):
    pred = sentiment_classifier(text)
    return {p["label"]: p["score"] for p in pred[0]}

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            with gr.Row():
                classify = gr.Button("Classify Sentiment")
        with gr.Column():
            label = gr.Label(label="Predicted Sentiment")

    classify.click(classifier, input_text, label)
demo.launch()
```

<gradio-app space="freddyaboulton/sentiment-classification"> </gradio-app>

## Adding interpretations to the app

Our goal is to present to our users how the words in the input contribute to the model's prediction.
This will help our users understand how the model works and also evaluate its effectiveness.
For example, we should expect our model to identify the words "happy" and "love" with positive sentiment - if not it's a sign we made a mistake in training it!

For each word in the input, we will compute a score of how much the model's prediction of positive sentiment is changed by that word.
Once we have those `(word, score)` pairs we can use gradio to visualize them to the user.

The [shap](https://shap.readthedocs.io/en/stable/index.html) library will help us compute the `(word, score)` pairs and
gradio will take care of displaying the output to the user.

The following code computes the `(word, score)` pairs:

```python
def interpretation_function(text):
    explainer = shap.Explainer(sentiment_classifier)
    shap_values = explainer([text])
    
    # Dimensions are (batch size, text size, number of classes)
    # Since we care about positive sentiment, use index 1
    scores = list(zip(shap_values.data[0], shap_values.values[0, :, 1]))
    # Scores contains (word, score) pairs
    
    
    # Format expected by gr.components.Interpretation
    return {"original": text, "interpretation": scores}
```

Now, all we have to do is add a button that runs this function when clicked.
To display the interpretation, we will use `gr.components.Interpretation`.
This will color each word in the input either red or blue.
Red if it contributes to positive sentiment and blue if it contributes to negative sentiment.
This is how `Interface` displays the interpretation output for text.

```python
with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            with gr.Row():
                classify = gr.Button("Classify Sentiment")
                interpret = gr.Button("Interpret")
        with gr.Column():
            label = gr.Label(label="Predicted Sentiment")
        with gr.Column():
            interpretation = gr.components.Interpretation(input_text)
    classify.click(classifier, input_text, label)
    interpret.click(interpretation_function, input_text, interpretation)

demo.launch()
```

<gradio-app space="freddyaboulton/sentiment-classification-interpretation"> </gradio-app>


## Customizing how the interpretation is displayed

The `gr.components.Interpretation` component does a good job of showing how individual words contribute to the sentiment prediction,
but what if we also wanted to display the score themselves along with the words?

One way to do this would be to generate a bar plot where the words are on the horizontal axis and the bar height corresponds
to the shap score.

We can do this by modifying our `interpretation_function` to additionally return a matplotlib bar plot.
We will display it with the `gr.Plot` component in a separate tab.

This is how the interpretation function will look:
```python
def interpretation_function(text):
    explainer = shap.Explainer(sentiment_classifier)
    shap_values = explainer([text])
    # Dimensions are (batch size, text size, number of classes)
    # Since we care about positive sentiment, use index 1
    scores = list(zip(shap_values.data[0], shap_values.values[0, :, 1]))

    scores_desc = sorted(scores, key=lambda t: t[1])[::-1]

    # Filter out empty string added by shap
    scores_desc = [t for t in scores_desc if t[0] != ""]

    fig_m = plt.figure()
    
    # Select top 5 words that contribute to positive sentiment
    plt.bar(x=[s[0] for s in scores_desc[:5]],
            height=[s[1] for s in scores_desc[:5]])
    plt.title("Top words contributing to positive sentiment")
    plt.ylabel("Shap Value")
    plt.xlabel("Word")
    return {"original": text, "interpretation": scores}, fig_m
```

And this is how the app code will look:
```python
with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(label="Input Text")
            with gr.Row():
                classify = gr.Button("Classify Sentiment")
                interpret = gr.Button("Interpret")
        with gr.Column():
            label = gr.Label(label="Predicted Sentiment")
        with gr.Column():
            with gr.Tabs():
                with gr.TabItem("Display interpretation with built-in component"):
                    interpretation = gr.components.Interpretation(input_text)
                with gr.TabItem("Display interpretation with plot"):
                    interpretation_plot = gr.Plot()

    classify.click(classifier, input_text, label)
    interpret.click(interpretation_function, input_text, [interpretation, interpretation_plot])

demo.launch()
```

You can see the demo below!

<gradio-app space="freddyaboulton/sentiment-classification-interpretation-tabs"> </gradio-app>

## Beyond Sentiment Classification
Although we have focused on sentiment classification so far, you can add interpretations to almost any machine learning model.
The output must be an `gr.Image` or `gr.Label` but the input can be almost anything (`gr.Number`, `gr.Slider`, `gr.Radio`, `gr.Image`).

Here is a demo built with blocks of interpretations for an image classification model:

<gradio-app space="freddyaboulton/image-classification-interpretation-blocks"> </gradio-app>


## Closing remarks

We did a deep dive 🤿 into how interpretations work and how you can add them to your Blocks app.

We also showed how the Blocks API gives you the power to control how the interpretation is visualized in your app.

Adding interpretations is a helpful way to make your users understand and gain trust in your model.
Now you have all the tools you need to add them to all of your apps!
