# State in Blocks

We covered [State in Interfaces](https://gradio.app/interface-state), this guide takes a look at state in Blocks, which works mostly the same.

## Global State

Global state in Blocks works the same as in Interface. Any variable created outside a function call is a reference shared between all users.

## Session State

Gradio supports session **state**, where data persists across multiple submits within a page session, in Blocks apps as well. To reiterate, session data is _not_ shared between different users of your model. To store data in a session state, you need to do three things:

1. Create a `gr.State()` object. If there is a default value to this stateful object, pass that into the constructor.
2. In the event listener, put the `State` object as an input and output as needed.
3. In the event listener function, add the variable to the input parameters and the return value.

Let's take a look at a simple example. We have a simple checkout app below where you add items to a cart. You can also check the size of the cart.

$code_simple_state
$demo_simple_state

Notice how we do this with state:
1. We store the cart items in a `gr.State()` object, initialized here to be an empty list.
2. When adding items to the cart, the event listener uses the cart as both input and output - it returns the updated cart with all the items inside. 
3. When calculating the cart size, we pass the cart as input.

You can think of `gr.State` as an invisible Component that can store any kind of value. Here, `cart` is not visible in the frontend but is used for calculations. 

Learn more about `State` in the [docs](https://gradio.app/docs/state).
