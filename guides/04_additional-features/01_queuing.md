# Queuing

Every Gradio app comes with a built-in queuing system that can scale to thousands of concurrent users. Because many of your event listeners may involve heavy processing, Gradio automatically creates a queue to handle every event listener in the backend. Every event listener in your app automatically has a queue to process incoming events.

## Configuring the Queue

By default, each event listener has its own queue, which handles one request at a time. This can be configured via two arguments:

- `concurrency_limit`: This sets the maximum number of concurrent executions for an event listener. By default, the limit is 1 unless configured otherwise in `Blocks.queue()`. You can also set it to `None` for no limit (i.e., an unlimited number of concurrent executions). For example:

```python
import gradio as gr

with gr.Blocks() as demo:
    prompt = gr.Textbox()
    image = gr.Image()
    generate_btn = gr.Button("Generate Image")
    generate_btn.click(image_gen, prompt, image, concurrency_limit=5)
```

In the code above, up to 5 requests can be processed simultaneously for this event listener. Additional requests will be queued until a slot becomes available.

If you want to manage multiple event listeners using a shared queue, you can use the `concurrency_id` argument:

- `concurrency_id`: This allows event listeners to share a queue by assigning them the same ID. For example, if your setup has only 2 GPUs but multiple functions require GPU access, you can create a shared queue for all those functions. Here's how that might look:

```python
import gradio as gr

with gr.Blocks() as demo:
    prompt = gr.Textbox()
    image = gr.Image()
    generate_btn_1 = gr.Button("Generate Image via model 1")
    generate_btn_2 = gr.Button("Generate Image via model 2")
    generate_btn_3 = gr.Button("Generate Image via model 3")
    generate_btn_1.click(image_gen_1, prompt, image, concurrency_limit=2, concurrency_id="gpu_queue")
    generate_btn_2.click(image_gen_2, prompt, image, concurrency_id="gpu_queue")
    generate_btn_3.click(image_gen_3, prompt, image, concurrency_id="gpu_queue")
```

In this example, all three event listeners share a queue identified by `"gpu_queue"`. The queue can handle up to 2 concurrent requests at a time, as defined by the `concurrency_limit`.

### Notes

- To ensure unlimited concurrency for an event listener, set `concurrency_limit=None`.  This is useful if your function is calling e.g. an external API which handles the rate limiting of requests itself.
- The default concurrency limit for all queues can be set globally using the `default_concurrency_limit` parameter in `Blocks.queue()`. 

These configurations make it easy to manage the queuing behavior of your Gradio app.

## Estimating Wait Times

While an event waits in the queue, Gradio shows the user an estimated time until it finishes. By default, this estimate is the average run time of the function's past runs. This doesn't work well when there is no history yet (for example, right after your app starts), or when the run time depends heavily on the inputs, like the number of steps in an image generation.

You can give the queue a better estimate with the `eta` argument of any event listener. It can be a fixed number of seconds:

```python
generate_btn.click(image_gen, prompt, image, eta=8)
```

Or a function that receives the input values and returns the expected number of seconds:

```python
import gradio as gr

def image_gen(prompt, steps):
    ...

with gr.Blocks() as demo:
    prompt = gr.Textbox()
    steps = gr.Slider(1, 50, value=20, step=1)
    image = gr.Image()
    generate_btn = gr.Button("Generate Image")
    generate_btn.click(image_gen, [prompt, steps], image, eta=lambda prompt, steps: steps * 0.5)
```

Here, a request with 30 steps is estimated to take 15 seconds, and the users queued behind it see their ETAs grow accordingly.

A few things to keep in mind when `eta` is a function:

- It runs when a user joins the queue, before your function's inputs are preprocessed. So it receives the raw values the client sent: a `gr.Slider` gives a number, but a `gr.File` or `gr.Image` gives a dictionary describing the file (with its `path`) rather than a file path string or a numpy array, and a `gr.State` input arrives as `None`. It always gets one positional argument per input, in order.
- File inputs are checked first: if a file wasn't uploaded by a user, the `eta` function isn't called at all.
- It should be fast and must be a regular (not `async`) function. If it takes longer than 1 second, returns `None`, raises an error, or returns something that isn't a non-negative number, Gradio falls back to the average of past runs.
- Since the estimate is computed from user input, Gradio caps it at one day.
