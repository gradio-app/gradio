# Adding Examples To Your App

Docs: examples

## Introduction

As we saw in the [Quickstart](/getting_started#example-inputs), providing example inputs to your app are a helpful way
to let your audience explore the functionality of your app without having them specify all of your app's expected inputs.

In this guide we'll go into greater depth on how you can provide example inputs to your apps.

## Adding examples to an Interface

As covered in the Quickstart, adding examples to an Interface is as easy as providing a list of lists to the `examples`
keyword argument. 
Each sublist is a data sample, where each element corresponds to an input of the prediction function.
The inputs must be ordered in the same order as the prediction function expects them.

We can see the `examples` parameter in action in this calculator demo:

$code_calculator
$demo_calculator

## Adding examples to a Blocks app

In order to add examples to an app written with the Blocks API, you need to use the `gr.Examples` component helper.
This class is a wrapper over the `gr.Dataset` component.

During class creation, `gr.Examples` will instantiate a `gr.Dataset` and attach an event listener on the dataset click event
that will populate all the inputs with the values of that row of the dataset. 

To show this in practice, we will build the same calculator but with Blocks instead of an Interface.

$code_calculator_blocks
$demo_calculator_blocks

By the way, Interface uses `gr.Examples` under the hood too!
So if you know how this example works you also know how the Interface examples work! 🥳

## Caching examples

Both `gr.Examples` and `Interface` have a `cache_examples` parameter.
The default in the previous demos is to not cache examples, but if `cache_examples=True`, the `gr.Examples` component will
run all of your examples through your app and save the outputs during start up.
Whenever someone clicks on an example, the output will automatically be populated in the app. 

We can see this in the following demo.
It's the same as the previous calculator with only the changes needed to cache examples.

$code_calculator_blocks_cached
$demo_calculator_blocks_cached

Note that when using `gr.Examples` and with `cache_examples=True`, you must specify the output component and the function
to run.

## Providing examples for only a subset of inputs

Sometimes your app has many possible inputs, but you would only like to provide examples for a subset of them.

For example, consider an app showcasing an image classification algorithm.
The app inputs are a sample image to classify with some additional sliders to control the algorithm. 
In this case, you may want to only provide examples for the image and let your users control the sliders themselves.

In order to exclude some inputs from the examples, pass `None` for all data samples corresponding to that particular input.

In the following example, we have an app demoing a GAN. Note how the last three examples do not show up in the examples
dataset.

$code_fake_gan
$demo_fake_gan

## Next Steps

Now that you know all about adding examples to your apps, here are some good next steps:

* Check out [the free Gradio course](https://huggingface.co/course/chapter9/1) for a step-by-step walkthrough of everything Gradio-related with lots of examples of how to build your own machine learning demos 📖
* If you just want to explore what demos other people have built with Gradio, [browse public Hugging Face Spaces](http://hf.space/), view the underlying Python code, and be inspired 🤗
