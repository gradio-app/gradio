"""The process executor: `launch(executor="process")`.

The process that built the app keeps running every event (its models, globals
and closures are the live objects the app's functions use), while a gateway
subprocess owns HTTP, the queue, SSE and files. The gateway never imports the
app and runs none of its components: it serves the config the app's process
made, and forwards each event to that process.
"""
