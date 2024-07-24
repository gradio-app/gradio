# Queuing

Every Gradio app comes with a built-in queuing system that can scale to thousands of concurrent users. You can configure the queue by using `queue()` method which is supported by the `gr.Interface`, `gr.Blocks`, and `gr.ChatInterface` classes. 

For example, you can control the number of requests processed at a single time by setting the `default_concurrency_limit` parameter of `queue()`, e.g.

```python
demo = gr.Interface(...).queue(default_concurrency_limit=5)
demo.launch()
```

This limits the number of requests processed for this event listener at a single time to 5. By default, the `default_concurrency_limit` is actually set to `1`, which means that when many users are using your app, only a single user's request will be processed at a time. This is because many machine learning functions consume a significant amount of memory and so it is only suitable to have a single user using the demo at a time. However, you can change this parameter in your demo easily.

See the [docs on queueing](/docs/gradio/interface#interface-queue) for more details on configuring the queuing parameters.

You can see analytics on the number and status of all requests processed by the queue by visiting the `/monitoring` endpoint of your app. This endpoint will print a secret URL to your console that links to the full analytics dashboard.