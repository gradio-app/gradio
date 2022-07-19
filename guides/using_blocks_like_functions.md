<script type="module" src="https://gradio.s3-us-west-2.amazonaws.com/3.0.24/gradio.js"></script>

# Using Gradio Blocks Like Functions
Tags: TRANSLATION, HUB, SPACES


Docs: Blocks

**Prerequisite**: This Guide builds on the Blocks Introduction. Make sure to [read that guide first](/introduction_to_blocks).

## Introduction

Did you know that apart from being a full-stack machine learning demo, a Gradio Blocks app is also a regular-old python function!?

This means that if you have a gradio Blocks (or Interface) app called `demo`, you can use `demo` like you would any python function.

So doing something like `output = demo("Hello", "friend")` will run the first event defined in `demo` on the inputs "Hello" and "friend" and store it
in the variable `output`.

If I put you to sleep 🥱, please bear with me! By using apps like functions, you can seamlessly compose Gradio apps.
The following section will show how.

## Treating spaces like functions

Let's say we have the following demo that translates english text to german text. 

$code_english_translator

I already went ahead and hosted it in Hugging Face spaces at [freddyaboulton/english-to-german](https://huggingface.co/spaces/freddyaboulton/english-to-german).
You can see the demo below as well:

<gradio-app space="freddyaboulton/english-to-german"> </gradio-app>

Now, let's say you have an app that generates english text, but you wanted to additionally generate german text.

You could either:

1. Copy the source code of my english-to-german translation and paste it in your app.

2. Load my english-to-german translation in your app and treat it like a normal python function.

Option 1 technically always works, but it often introduces unwanted complexity.

Option 2 lets you borrow the functionality you want without tightly coupling our apps.

All you have to do is call the `Blocks.load` class method in your source file.
After that, you can use my translation app like a regular python function!

The following code snippet and demo shows how to use `Blocks.load`.

Note that the variable `english_translator` is my english to german app, but its used in `generate_text` like a regular function.

$code_generate_english_german

<gradio-app space="freddyaboulton/generate-english-german"> </gradio-app>

## How to control which function in the app to use

If the app you are loading defines more than one function, you can specify which function to use with the `fn_index` parameter.
Imagine my app also defined an english to spanish translation function. In order to use it in our text generation app,
we would use the following code:

```python
english_generator(text, fn_index=1)[0]["generated_text"]
```

Functions in gradio spaces are zero-indexed, so since the spanish translator would be the second function in my space,
you would use index 1. 

## Parting Remarks

We showed how treating a Blocks app like a regular python helps you compose functionality across different apps.
Any Blocks app can be treated like a function, but a powerful pattern is to `load` an app hosted on 
[Hugging Face Spaces](https://huggingface.co/spaces) prior to treating it like a function in your own app.
You can also load models hosted on the [Hugging Face Model Hub](https://huggingface.co/models) - see the [Using Hugging Face Integrations](/using_hugging_face_integrations) guide for an example.

### Happy building! ⚒️
