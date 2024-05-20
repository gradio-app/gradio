# Batch functions

Gradio supports the ability to pass _batch_ functions. Batch functions are just
functions which take in a list of inputs and return a list of predictions.

For example, here is a batched function that takes in two lists of inputs (a list of
words and a list of ints), and returns a list of trimmed words as output:

```py
import time

def trim_words(words, lens):
    trimmed_words = []
    time.sleep(5)
    for w, l in zip(words, lens):
        trimmed_words.append(w[:int(l)])
    return [trimmed_words]
```

The advantage of using batched functions is that if you enable queuing, the Gradio server can automatically _batch_ incoming requests and process them in parallel,
potentially speeding up your demo. Here's what the Gradio code looks like (notice the `batch=True` and `max_batch_size=16`)

With the `gr.Interface` class:

```python
demo = gr.Interface(
    fn=trim_words, 
    inputs=["textbox", "number"], 
    outputs=["output"],
    batch=True, 
    max_batch_size=16
)

demo.launch()
```

With the `gr.Blocks` class:

```py
import gradio as gr

with gr.Blocks() as demo:
    with gr.Row():
        word = gr.Textbox(label="word")
        leng = gr.Number(label="leng")
        output = gr.Textbox(label="Output")
    with gr.Row():
        run = gr.Button()

    event = run.click(trim_words, [word, leng], output, batch=True, max_batch_size=16)

demo.launch()
```

In the example above, 16 requests could be processed in parallel (for a total inference time of 5 seconds), instead of each request being processed separately (for a total
inference time of 80 seconds). Many Hugging Face `transformers` and `diffusers` models work very naturally with Gradio's batch mode: here's [an example demo using diffusers to
generate images in batches](https://github.com/gradio-app/gradio/blob/main/demo/diffusers_with_batching/run.py)


