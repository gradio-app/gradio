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

1. Create a `gr.State()` object. If there is a default value to this stateful object, pass that into the constructor. Note that `gr.State` objects must be [deepcopy-able](https://docs.python.org/3/library/copy.html), otherwise you will need to use a different approach as described below.
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

The value of a session State variable is cleared when the user refreshes the page. The value is stored on in the app backend for 60 minutes after the user closes the tab (this can be configured by the `delete_cache` parameter in `gr.Blocks`).

Learn more about `State` in the [docs](https://gradio.app/docs/gradio/state).

**What about objects that cannot be deepcopied?**

As mentioned earlier, the value stored in `gr.State` must be [deepcopy-able](https://docs.python.org/3/library/copy.html). If you are working with a complex object that cannot be deepcopied, you can take a different approach to manually read the user's `session_hash` and store a global `dictionary` with instances of your object for each user. Here's how you would do that:

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
    demo.close(cleanup_instance)    

demo.launch()
```

## Browser State

Gradio also supports browser state, where data persists in the browser's localStorage even after the page is refreshed or closed. This is useful for storing user preferences, settings, API keys, or other data that should persist across sessions. To use local state:

1. Create a `gr.BrowserState` object. You can optionally provide an initial default value and a key to identify the data in the browser's localStorage.
2. Use it like a regular `gr.State` component in event listeners as inputs and outputs.

Here's a simple example that saves a user's username and password across sessions:

$code_browserstate

