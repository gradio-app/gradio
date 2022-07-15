<script type="module" src="https://gradio.s3-us-west-2.amazonaws.com/3.0.24/gradio.js"></script>

# Treating Gradio Apps Like Functions

Docs: Blocks

**Prerequisite**: This Guide builds on the Blocks Introduction. Make sure to [read that guide first](/introduction_to_blocks).

## Introduction

Did you know that apart from being a full-stack machine learning demo, a Gradio app is also a regular-old python function!?

This means that if you have a gradio app called `demo`, you can use `demo` like you would any python function.

So doing something like `output = demo("Hello", "friend")` will run the first event defined in `demo` on the inputs "Hello" and "friend" and store it
in the variable `output`.

If I put you to sleep 🥱, please bear with me! By using apps like functions, you can seamlessly compose Gradio apps.
The following section will show how.

## Treating spaces like functions

Let's say we have the following simple demo that defines two functions, one that concatenates strings and one that returns its input image without modification.

$code_blocks_inputs

I already went ahead and hosted it in Hugging Face spaces at [freddyaboulton/blocks_inputs](https://huggingface.co/spaces/freddyaboulton/blocks_inputs).
You can see the demo below as well:

<gradio-app space="freddyaboulton/blocks_inputs"> </gradio-app>

Now, let's pretend that you were very impressed with my string concatenation function and wanted to use it in your own app.

You could either:

1. Copy the source code of my implementation and paste it in your app.

2. Load my space in your app and treat it like a normal python function.

Option 1 technically always works.
However, if the feature you were interested in using from my app was more complicated than a simple function,
then copy-pasting code could introduce unneeded complexity to your app and detract from your primary goal.

Option 2 lets you borrow the functionality you want without tightly coupling our apps.
All you have to do is call the `Blocks.load` class method in your source file.

Let's see an example where we use option 2 to leverage my string concatenation function to create a ⚡powerful⚡ greeting app.

$code_load_from_space
$demo_load_from_space

## How to control which function in the app to use

In the above example, we saw how doing `string_concat(..,..)` concatenated two strings.
But remember that my original app defined two functions, the string concatenation and the image identity.
If you were instead interested in the image identity function, you can call it by specifying `fn_index=1`:

```python
string_concat("./cheetah1.jpg", fn_index=1)
```

Functions in gradio spaces are zero-indexed, so since the image identity is the second function registered in my space,
you need to use index 1. 

## Parting Remarks

We showed how treating a Blocks app like a regular python helps you compose functionality across different apps.
Any Blocks app can be treated like a function, but a powerful pattern is to `load` an app hosted on 
[Hugging Face Spaces](https://huggingface.co/spaces) prior to treating it like a function in your own app.
You can also load models hosted on the [Hugging Face Model Hub](https://huggingface.co/models) - see the [Using Hugging Face Integrations](/using_hugging_face_integrations) guide for an example.

### Happy building! ⚒️
