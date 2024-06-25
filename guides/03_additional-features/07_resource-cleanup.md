# Resource Cleanup

Your Gradio application may create resources during its lifetime.
Examples of resources are `gr.State` variables, any variables you create and explicitly hold in memory, or files you save to disk. 
Over time, these resources can use up all of your server's RAM or disk space and crash your application.

Gradio provides some tools for you to clean up the resources created by your app:

1. Automatic deletion of `gr.State` variables.
2. Automatic cache cleanup with the `delete_cache` parameter.
2. The `Blocks.unload` event.

Let's take a look at each of them individually.

## Automatic deletion of `gr.State`

When a user closes their browser tab, Gradio will automatically delete any `gr.State` variables associated with that user session after 60 minutes. If the user connects again within those 60 minutes, no state will be deleted.

You can control the deletion behavior further with the following two parameters of `gr.State`:

1. `delete_callback` - An arbitrary function that will be called when the variable is deleted. This function must take the state value as input. This function is useful for deleting variables from GPU memory.
2. `time_to_live` - The number of seconds the state should be stored for after it is created or updated. This will delete variables before the session is closed, so it's useful for clearing state for potentially long running sessions.

## Automatic cache cleanup via `delete_cache`

Your Gradio application will save uploaded and generated files to a special directory called the cache directory. Gradio uses a hashing scheme to ensure that duplicate files are not saved to the cache but over time the size of the cache will grow (especially if your app goes viral 😉).

Gradio can periodically clean up the cache for you if you specify the `delete_cache` parameter of `gr.Blocks()`, `gr.Interface()`, or `gr.ChatInterface()`. 
This parameter is a tuple of the form `[frequency, age]` both expressed in number of seconds.
Every `frequency` seconds, the temporary files created by this Blocks instance will be deleted if more than `age` seconds have passed since the file was created. 
For example, setting this to (86400, 86400) will delete temporary files every day if they are older than a day old.
Additionally, the cache will be deleted entirely when the server restarts.

## The `unload` event

Additionally, Gradio now includes a `Blocks.unload()` event, allowing you to run arbitrary cleanup functions when users disconnect (this does not have a 60 minute delay).
Unlike other gradio events, this event does not accept inputs or outptus.
You can think of the `unload` event as the opposite of the `load` event.

## Putting it all together

The following demo uses all of these features. When a user visits the page, a special unique directory is created for that user.
As the user interacts with the app, images are saved to disk in that special directory.
When the user closes the page, the images created in that session are deleted via the `unload` event.
The state and files in the cache are cleaned up automatically as well.

$code_state_cleanup
$demo_state_cleanup