# Setting Up a Demo for Maximum Performance

Tags: QUEUE, PERFORMANCE


Let's say that your Gradio demo goes *viral* on social media -- you have lots of users trying it out simultaneously, and you want to provide your users with the best possible experience or, in other words, minimize the amount of time that each user has to wait in the queue to see their prediction.

How can you configure your Gradio demo to handle the most traffic? In this Guide, we dive into some of the parameters of Gradio's `.queue()` method as well as some other related configurations, and discuss how to set these parameters in a way that allows you to serve lots of users simultaneously with minimal latency.

This is an advanced guide, so make sure you know the basics of Gradio already, such as [how to create and launch a Gradio Interface](https://gradio.app/quickstart/). Most of the information in this Guide is relevant whether you are hosting your demo on [Hugging Face Spaces](https://hf.space) or on your own server.

## Enabling Gradio's Queueing System

By default, a Gradio demo does not use queueing and instead sends prediction requests via a POST request to the server where your Gradio server and Python code are running. However, regular POST requests have two big limitations:

(1) They time out -- most browsers raise a timeout error
if they do not get a response to a POST request after a short period of time (e.g. 1 min).
This can be a problem if your inference function takes longer than 1 minute to run or
if many people are trying out your demo at the same time, resulting in increased latency.

(2) They do not allow bi-directional communication between the Gradio demo and the Gradio server. This means, for example, that you cannot get a real-time ETA of how long your prediction will take to complete.

To address these limitations, any Gradio app can be converted to use **websockets** instead, simply by adding `.queue()` before launching an Interface or a Blocks. Here's an example:

```py
app = gr.Interface(lambda x:x, "image", "image")
app.queue()  # <-- Sets up a queue with default parameters
app.launch()
```

In the demo `app` above, predictions will now be sent over a websocket instead.
Unlike POST requests, websockets do not timeout and they allow bidirectional traffic. On the Gradio server, a **queue** is set up, which adds each request that comes to a list. When a worker is free, the first available request is passed into the worker for inference. When the inference is complete, the queue sends the prediction back through the websocket to the particular Gradio user who called that prediction. 

Note: If you host your Gradio app on [Hugging Face Spaces](https://hf.space), the queue is already **enabled by default**. You can still call the `.queue()` method manually in order to configure the queue parameters described below.

## Queuing Parameters

There are several parameters that can be used to configure the queue and help reduce latency. Let's go through them one-by-one.

### The `concurrency_count` parameter

The first parameter we will explore is the `concurrency_count` parameter of `queue()`. This parameter is used to set the number of worker threads in the Gradio server that will be processing your requests in parallel. By default, this parameter is set to `1` but increasing this can **linearly multiply the capacity of your server to handle requests**.

So why not set this parameter much higher? Keep in mind that since requests are processed in parallel, each request will consume memory to store the data and weights for processing. This means that you might get out-of-memory errors if you increase the `concurrency_count` too high. You may also start to get diminishing returns if the `concurrency_count` is too high because of costs of switching between different worker threads.

**Recommendation**: Increase the `concurrency_count` parameter as high as you can while you continue to see performance gains or until you hit memory limits on your machine. You can [read about Hugging Face Spaces machine specs here](https://huggingface.co/docs/hub/spaces-overview). 

*Note*: there is a second parameter which controls the *total* number of threads that Gradio can generate, whether or not queuing is enabled. This is the `max_threads` parameter in the `launch()` method. When you increase the `concurrency_count` parameter in `queue()`, this is automatically increased as well. However, in some cases, you may want to manually increase this, e.g. if queuing is not enabled. 

### The `max_size` parameter

A more blunt way to reduce the wait times is simply to prevent too many people from joining the queue in the first place. You can set the maximum number of requests that the queue processes using the `max_size` parameter of `queue()`. If a request arrives when the queue is already of the maximum size, it will not be allowed to join the queue and instead, the user will receive an error saying that the queue is full and to try again. By default, `max_size=None`, meaning that there is no limit to the number of users that can join the queue.

Paradoxically, setting a `max_size` can often improve user experience because it prevents users from being dissuaded by very long queue wait times. Users who are more interested and invested in your demo will keep trying to join the queue, and will be able to get their results faster. 

**Recommendation**: For a better user experience, set a `max_size` that is reasonable given your expectations of how long users might be willing to wait for a prediction. 

### The `max_batch_size` parameter

Another way to increase the parallelism of your Gradio demo is to write your function so that it can accept **batches** of inputs. Most deep learning models can process batches of samples more efficiently than processing individual samples. 

If you write your function to process a batch of samples, Gradio will automatically batch incoming requests together and pass them into your function as a batch of samples. You need to set `batch` to `True` (by default it is `False`) and set a `max_batch_size` (by default it is `4`) based on the maximum number of samples your function is able to handle. These two parameters can be passed into `gr.Interface()` or to an event in Blocks such as `.click()`. 

While setting a batch is conceptually similar to having workers process requests in parallel, it is often *faster* than setting the `concurrency_count` for deep learning models. The downside is that you might need to adapt your function a little bit to accept batches of samples instead of individual samples. 

Here's an example of a function that does *not* accept a batch of inputs -- it processes a single input at a time:

```py
import time

def trim_words(word, length):
    return w[:int(length)]

```

Here's the same function rewritten to take in a batch of samples:

```py
import time

def trim_words(words, lengths):
    trimmed_words = []
    for w, l in zip(words, lengths):
        trimmed_words.append(w[:int(l)])        
    return [trimmed_words]

```

The second function can be used with `batch=True` and an appropriate `max_batch_size` parameter.

**Recommendation**: If possible, write your function to accept batches of samples, and then set `batch` to `True` and the `max_batch_size` as high as possible based on your machine's memory limits. If you set `max_batch_size` as high as possible, you will most likely need to set `concurrency_count` back to `1` since you will no longer have the memory to have multiple workers running in parallel. 

### The `api_open` parameter

When creating a Gradio demo, you may want to restrict all traffic to happen through the user interface as opposed to the [programmatic API](/sharing_your_app/#api-page) that is automatically created for your Gradio demo. This is important because when people make requests through the programmatic API, they can potentially bypass users who are waiting in the queue and degrade the experience of these users. 

**Recommendation**: set the `api_open` parameter in `queue()` to `False` in your demo to prevent programmatic requests.



### Upgrading your Hardware (GPUs, TPUs, etc.)

If you have done everything above, and your demo is still not fast enough, you can upgrade the hardware that your model is running on. Changing the model from running on CPUs to running on GPUs will usually provide a 10x-50x increase in inference time for deep learning models.

It is particularly straightforward to upgrade your Hardware on Hugging Face Spaces. Simply click on the "Settings" tab in your Space and choose the Space Hardware you'd like.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/hub/spaces-gpu-settings.png)

While you might need to adapt portions of your machine learning inference code to run on a GPU (here's a [handy guide](https://cnvrg.io/pytorch-cuda/) if you are using PyTorch), Gradio is completely agnostic to the choice of hardware and will work completely fine if you use it with CPUs, GPUs, TPUs, or any other hardware!

Note: your GPU memory is different than your CPU memory, so if you upgrade your hardware,
you might need to adjust the value of the `concurrency_count` parameter described above.

## Conclusion

Congratulations! You know how to set up a Gradio demo for maximum performance. Good luck on your next viral demo! 

