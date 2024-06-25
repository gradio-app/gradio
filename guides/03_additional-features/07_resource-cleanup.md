# Resource Cleanup

Your Gradio application may create resources during its lifetime.
Examples of resources are `gr.State` variables, any variables you create and explicitly hold in memory, or files you save to disk. 
Over time, these resources can use up all of your server's RAM or disk space and crash your application.

Gradio provides two tools for your to clean up the resources created by your app:

1. Automatic deletion of `gr.State` variables.
2. The `unload` event.

Let's take a look at each of them individually.

## Automatic deletion of `gr.State`

When a user closes their browser tab, Gradio will automatically delete any `gr.State` variables associated with that user session after 60 minutes. The 60 minute lag is in place so that users can reconnect without losing their data if their connection momentarily breaks.

You can control the deletion behavior further with the following two parameters of `gr.State`:

1. `delete_callback` - An arbitrary function that will be called when the variable is deleted. This function must take the state value as input. This function is useful for deleting variables from GPU memory.
2. `time_to_live` - The number of seconds the state should be stored for after it is created or updated. This will delete variables before the session is closed, so it's useful for clearing state for potentially long running sessions.

## The `unload` event

Similar to the `load` event, this listener is triggered when the user closes or refreshes the tab.
