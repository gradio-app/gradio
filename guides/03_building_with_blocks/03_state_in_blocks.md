# State in Blocks

## Global State

Global state in Blocks works the same as in Interface. Any variable created outside a function call is a reference shared between all users.

## Session State

Gradio supports session **state**, where data persists across multiple submits within a page session, in Blocks apps as well. To reiterate, session data is *not* shared between different users of your model. To store data in a session state, you need to do three things:

1. Create a `gr.State()` object. If there is a default value to this stateful object, pass that into the constructor.
2. In the event listener, put the `State` object as an input and output.
3. In the event listener function, add the variable to the input parameters and the return value.

Let's take a look at a game of hangman. 

$code_hangman
$demo_hangman

Let's see how we do each of the 3 steps listed above in this game:

1. We store the used letters in `used_letters_var`. In the constructor of `State`, we set the initial value of this to `[]`, an empty list. 
2. In `btn.click()`, we have a reference to `used_letters_var` in both the inputs and outputs.
3. In `guess_letter`, we pass the value of this `State` to `used_letters`, and then return an updated value of this `State` in the return statement.

With more complex apps, you will likely have many State variables storing session state in a single Blocks app.



