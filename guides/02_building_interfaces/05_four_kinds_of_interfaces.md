# The 4 Kinds of Gradio Interfaces

So far, we've always assumed that in order to build an Gradio demo, you need both inputs and outputs. But this isn't always the case for machine learning demos: for example, *unconditional image generation models* don't take any input but produce an image as the output. 

It turns out that the `gradio.Interface` class can actually handle 4 different kinds of demos: 

1. **Standard demos**: which have both separate inputs and outputs (e.g. an image classifier or speech-to-text model)
2. **Output-only demos**: which don't take any input but produce on output (e.g. an unconditional image generation model)
3. **Input-only demos**: which don't produce any output but do take in some sort of input (e.g. imagine a demo that saves images that you upload to a persistent external database)
4. **Unified demos**: which have both input and output components, but the input and output components *are the same*. This means that the output produced overrides the input (e.g. think of an autocomplete model)

Depending on the kind of demo, the user interface (UI) looks slightly different:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/interfaces4.png)


Let's see to build each kind of demo using the `Interface` class, along with examples:


## Standard demos

## Output-only demos

What about demos that only contain outputs? In order to build such a demo, you simply set the value of the `inputs` parameter in `Interface()` to `None`. Here's an example:

$code_fake_gan_no_input
$demo_fake_gan_no_input

## Input-only demos

## Unified demos
