# Streaming outputs

In some cases, you may want to stream a sequence of outputs rather than show a single output at once. For example, you might have an image generation model and you want to show the image that is generated at each step, leading up to the final image. Or you might have a chatbot which streams its response one token at a time instead of returning it all at once.

In such cases, you can supply a **generator** function into Gradio instead of a regular function. Creating generators in Python is very simple: instead of a single `return` value, a function should `yield` a series of values instead. Usually the `yield` statement is put in some kind of loop. Here's an example of an generator that simply counts up to a given number:

```python
def my_generator(x):
    for i in range(x):
        yield i
```

You supply a generator into Gradio the same way as you would a regular function. For example, here's a a (fake) image generation model that generates noise for several steps before outputting an image using the `gr.Interface` class:

$code_fake_diffusion
$demo_fake_diffusion

Note that we've added a `time.sleep(1)` in the iterator to create an artificial pause between steps so that you are able to observe the steps of the iterator (in a real image generation model, this probably wouldn't be necessary).

Similarly, Gradio can handle streaming inputs, e.g. an image generation model that reruns every time a user types a letter in a textbox. This is covered in more details in our guide on building [reactive Interfaces](/guides/reactive-interfaces). 
