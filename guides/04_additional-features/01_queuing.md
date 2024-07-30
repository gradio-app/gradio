# Queuing

Every Gradio app comes with a built-in queuing system that can scale to thousands of concurrent users. Because many of your event listeners may involve heavy processing, Gradio automatically creates a queue to handle every event listener in the backend. Every event listener in your app automatically has a queue to process incoming events.

## Configuring the Queue

By default, each event listener has its own queue, which handles one request at a time. This can be configured via two arguments:

- `concurrency_count`: this sets the number of requests that will be processed simultaneously. Take a look at the example below:

```python
import gradio as gr

with gr.Blocks() as demo:
    prompt = gr.Textbox()
    image = gr.Image()
    generate_btn = gr.Button("Generate Image")
    generate_btn.click(image_gen, prompt, image, concurrency_count=5)
```

In the code above, there would be 5 workers processing requests simultaneously - all other requests would be queued until a worker freed up.

- `concurrency_id`: this allows event listeners to share a queue by having the same id. Imagine that your setup has only 2 GPUs, and your app has three functions, all of which require GPUs. Between your three functions, you'd want to have a single queue that has 2 workers. This is what that would look like:

```python
import gradio as gr

with gr.Blocks() as demo:
    prompt = gr.Textbox()
    image = gr.Image()
    generate_btn_1 = gr.Button("Generate Image via model 1")
    generate_btn_2 = gr.Button("Generate Image via model 2")
    generate_btn_3 = gr.Button("Generate Image via model 3")
    generate_btn_1.click(image_gen_1, prompt, image, concurrency_count=2, concurrency_id="gpu_queue")
    generate_btn_2.click(image_gen_2, prompt, image, concurrency_id="gpu_queue")
    generate_btn_3.click(image_gen_3, prompt, image, concurrency_id="gpu_queue")
```

Now all the event listeners have the same queue by setting the same string for `concurrency_id`. We also set the `concurrency_count` for the queue to be 2. These two variables make it very easy to manage the queue!

If you want an unlimited number of requests processed simultaneously for an event, then you can also set `concurrency_count=None`.

