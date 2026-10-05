# Managing State

When building a Gradio application with `gr.Blocks()`, you may want to share certain values between users (e.g. a count of visitors to your page), or persist values for a single user across certain interactions (e.g. a chat history). This referred to as **state** and there are three general ways to manage state in a Gradio application:

* **Global state**: persist and share values among all users of your Gradio application while your Gradio application is running
* **Session state**: persist values for each user of your Gradio application while they are using your Gradio application in a single session. If they refresh the page, session state will be reset.
* **Browser state**: persist values for each user of your Gradio application in the browser's localStorage, allowing data to persist even after the page is refreshed or closed.

## Global State

Global state in Gradio apps is very simple: any variable created outside of a function is shared globally between all users.

This makes managing global state very simple and without the need for external services. For example, in this application, the `visitor_count` variable is shared between all users

```py
import gradio as gr

# Shared between all users
visitor_count = 0

def increment_counter():
    global visitor_count
    visitor_count += 1
    return visitor_count

with gr.Blocks() as demo:    
    number = gr.Textbox(label="Total Visitors", value="Counting...")
    demo.load(increment_counter, inputs=None, outputs=number)

demo.launch()
```

This means that any time you do _not_ want to share a value between users, you should declare it _within_ a function. But what if you need to share values between function calls, e.g. a chat history? In that case, you should use one of the subsequent approaches to manage state.

## Session State

Gradio supports session state, where data persists across multiple submits within a page session. To reiterate, session data is _not_ shared between different users of your model, and does _not_ persist if a user refreshes the page to reload the Gradio app. To store data in a session state, you need to do three things:

1. Create a `gr.State()` object. If there is a default value to this stateful object, pass that into the constructor. Note that the value of a `gr.State` is serialized so that it can be stored in the user's browser (see [where state is stored](#where-state-is-stored) below).
2. In the event listener, put the `State` object as an input and output as needed.
3. In the event listener function, add the variable to the input parameters and the return value.

Let's take a look at a simple example. We have a simple checkout app below where you add items to a cart. You can also see the size of the cart.

$code_simple_state

Notice how we do this with state:

1. We store the cart items in a `gr.State()` object, initialized here to be an empty list.
2. When adding items to the cart, the event listener uses the cart as both input and output - it returns the updated cart with all the items inside. 
3. We can attach a `.change` listener to cart, that uses the state variable as input as well.

You can think of `gr.State` as an invisible Gradio component that can store any kind of value. Here, `cart` is not visible in the frontend but is used for calculations.

The `.change` listener for a state variable triggers after any event listener changes the value of a state variable. If the state variable holds a sequence (like a `list`, `set`, or `dict`), a change is triggered if any of the elements inside change. If it holds an object or primitive, a change is triggered if the **hash** of the  value changes. So if you define a custom class and create a `gr.State` variable that is an instance of that class, make sure that the the class includes a sensible `__hash__` implementation.

Learn more about `State` in the [docs](https://gradio.app/docs/gradio/state).

### Where state is stored

By default, the value of a `gr.State` is kept in the user's browser. After an event changes it, the server sends the browser an encrypted copy of the new value, and the browser sends it back with the next event that needs it. The server also caches recent values in memory, so in the usual case the browser only sends a short reference rather than the whole value. This means that:

* State keeps working if your app runs on several servers (replicas) behind a load balancer, or if the server restarts, as long as every server process shares the same secret key. Set the `GRADIO_SECRET_KEY` environment variable to the same random string for every replica. Without it, each process generates its own key, which works for a single server but not across replicas or restarts.
* The value is encrypted and authenticated, so users can neither read nor modify it. They can, however, send back a value they were given earlier (for example by replaying an old request). Don't rely on `gr.State` for values that must never go backwards, such as a remaining credit balance; store those in a database.
* The value must be serializable. JSON types, tuples, sets, `bytes`, dates, `Decimal`, `UUID`, paths, NumPy arrays, pandas DataFrames and Series, PIL images, dataclasses, pydantic models, enums, named tuples, and classes defined in your own app's code are all supported. If a value cannot be serialized (for example, a database connection or an object holding a lock), Gradio keeps it in the server's memory instead and prints a warning, since that value will be lost if the user's next request reaches a different server.
* If several events run at the same time and change the same `gr.State`, the change from the event that finishes last wins.
* Changing a value in place (e.g. `history.append(message)`) is saved even if the `gr.State` is only an input to the event.

If you want a value to be kept in the server's memory, for example a model loaded for each user, pass `storage="server"`:

```py
model = gr.State(storage="server")
```

Server-side state is cleared an hour after the user closes the tab, and is not shared between replicas. It is the only storage that supports a `delete_callback`, which is called when the value is deleted. With either storage, `time_to_live` resets the state to its initial value once that many seconds have passed since it was last changed.

Clients that don't hold state themselves, like the Python client, the `/call` HTTP API, and MCP, always use server-side storage.

**What about objects that cannot be serialized?**

The simplest option is `gr.State(storage="server")`, described above. If you need more control over the object's lifetime, you can instead read the user's `session_hash` and store a global `dictionary` with instances of your object for each user. Here's how you would do that:

```py
import gradio as gr

class NonDeepCopyable:
    def __init__(self):
        from threading import Lock
        self.counter = 0
        self.lock = Lock()  # Lock objects cannot be deepcopied
    
    def increment(self):
        with self.lock:
            self.counter += 1
            return self.counter

# Global dictionary to store user-specific instances
instances = {}

def initialize_instance(request: gr.Request):
    instances[request.session_hash] = NonDeepCopyable()
    return "Session initialized!"

def cleanup_instance(request: gr.Request):
    if request.session_hash in instances:
        del instances[request.session_hash]

def increment_counter(request: gr.Request):
    if request.session_hash in instances:
        instance = instances[request.session_hash]
        return instance.increment()
    return "Error: Session not initialized"

with gr.Blocks() as demo:
    output = gr.Textbox(label="Status")
    counter = gr.Number(label="Counter Value")
    increment_btn = gr.Button("Increment Counter")
    increment_btn.click(increment_counter, inputs=None, outputs=counter)
    
    # Initialize instance when page loads
    demo.load(initialize_instance, inputs=None, outputs=output)    
    # Clean up instance when page is closed/refreshed
    demo.unload(cleanup_instance)    

demo.launch()
```

## Browser State

Gradio also supports browser state, where data persists in the browser's localStorage even after the page is refreshed or closed. This is useful for storing user preferences, settings, API keys, or other data that should persist across sessions. To use local state:

1. Create a `gr.BrowserState` object. You can optionally provide an initial default value and a key to identify the data in the browser's localStorage.
2. Use it like a regular `gr.State` component in event listeners as inputs and outputs.

Here's a simple example that saves a user's username and password across sessions:

$code_browserstate

Note: The value stored in `gr.BrowserState` does not persist if the Grado app is restarted. To persist it, you can hardcode specific values of `storage_key` and `secret` in the `gr.BrowserState` component and restart the Gradio app on the same server name and server port. However, this should only be done if you are running trusted Gradio apps, as in principle, this can allow one Gradio app to access localStorage data that was created by a different Gradio app.
