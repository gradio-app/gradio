# Interface State

## Global State

Your function may use data that persists beyond a single function call. If the data is something accessible to all function calls and all users, you can create a variable outside the function call and access it inside the function. For example, you may load a large model outside the function and use it inside the function so that every function call does not need to reload the model. 

$code_score_tracker

In the code above, the `scores` array is shared between all users. If multiple users are accessing this demo, their scores will all be added to the same list, and the returned top 3 scores will be collected from this shared reference. 

## Session State

Another type of data persistence Gradio supports is session **state**, where data persists across multiple submits within a page session. However, data is *not* shared between different users of your model. To store data in a session state, you need to do three things:

1. Pass in an extra parameter into your function, which represents the state of the interface.
2. At the end of the function, return the updated value of the state as an extra return value.
3. Add the `'state'` input and `'state'` output components when creating your `Interface`

A chatbot is an example where you would need session state - you want access to a users previous submissions, but you cannot store chat history in a global variable, because then chat history would get jumbled between different users. 

$code_chatbot_demo
$demo_chatbot_demo

Notice how the state persists across submits within each page, but if you load this demo in another tab (or refresh the page), the demos will not share chat history. 

The default value of `state` is None. If you pass a default value to the state parameter of the function, it is used as the default value of the state instead. The `Interface` class only supports a single input and outputs state variable, though it can be a list with multiple elements. For more complex use cases, you can use Blocks, [which supports multiple `State` variables](/state_in_blocks/).