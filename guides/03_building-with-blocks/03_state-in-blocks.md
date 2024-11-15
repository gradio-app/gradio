# State in Blocks

We covered [State in Interfaces](https://gradio.app/interface-state), this guide takes a look at state in Blocks, which works mostly the same.

## Global State

Global state in Blocks works the same as in Interface. Any variable created outside a function call is a reference shared between all users.

## Session State

Gradio supports session **state**, where data persists across multiple submits within a page session, in Blocks apps as well. To reiterate, session data is _not_ shared between different users of your model. To store data in a session state, you need to do three things:

1. Create a `gr.State()` object. If there is a default value to this stateful object, pass that into the constructor.
2. In the event listener, put the `State` object as an input and output as needed.
3. In the event listener function, add the variable to the input parameters and the return value.

Let's take a look at a simple example. We have a simple checkout app below where you add items to a cart. You can also see the size of the cart.

$code_simple_state
$demo_simple_state

Notice how we do this with state:
1. We store the cart items in a `gr.State()` object, initialized here to be an empty list.
2. When adding items to the cart, the event listener uses the cart as both input and output - it returns the updated cart with all the items inside. 
3. We can attach a `.change` listener to cart, that uses the state variable as input as well.

You can think of `gr.State` as an invisible Component that can store any kind of value. Here, `cart` is not visible in the frontend but is used for calculations.

The `.change` listener for a state variable triggers after any event listener changes the value of a state variable. If the state variable holds a sequence (like a list, set, or dict), a change is triggered if any of the elements inside change. If it holds an object or primitive, a change is triggered if the **hash** of the  value changes. So if you define a custom class and create a `gr.State` variable that is an instance of that class, make sure that the the class includes a sensible `__hash__` implementation.

The value of a session State variable is cleared when the user refreshes the page. The value is stored on in the app backend for 60 minutes after the user closes the tab (this can be configured by the `delete_cache` parameter in `gr.Blocks`).

Learn more about `State` in the [docs](https://gradio.app/docs/gradio/state).

## Local State

Gradio also supports **local state**, where data persists in the browser's localStorage even after the page is refreshed or closed. This is useful for storing user preferences, settings, API keys, or other data that should persist across sessions. To use local state:

1. Create a `gr.BrowserState()` object. You can optionally provide an initial default value and a key to identify the data in the browser's localStorage.
2. Use it like a regular `gr.State` component in event listeners as inputs and outputs.

Here's a simple example that saves a user's username and password across sessions:

$code_browserstate

