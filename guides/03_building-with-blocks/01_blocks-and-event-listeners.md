# Blocks and Event Listeners

We briefly described the Blocks class in the [Quickstart](/main/guides/quickstart#custom-demos-with-gr-blocks) as a way to build custom demos. Let's dive deeper. 


## Blocks Structure

Take a look at the demo below.

$code_hello_blocks
$demo_hello_blocks

- First, note the `with gr.Blocks() as demo:` clause. The Blocks app code will be contained within this clause.
- Next come the Components. These are the same Components used in `Interface`. However, instead of being passed to some constructor, Components are automatically added to the Blocks as they are created within the `with` clause.
- Finally, the `click()` event listener. Event listeners define the data flow within the app. In the example above, the listener ties the two Textboxes together. The Textbox `name` acts as the input and Textbox `output` acts as the output to the `greet` method. This dataflow is triggered when the Button `greet_btn` is clicked. Like an Interface, an event listener can take multiple inputs or outputs.

You can also attach event listeners using decorators - skip the `fn` argument and assign `inputs` and `outputs` directly:

$code_hello_blocks_decorator

## Event Listeners and Interactivity

In the example above, you'll notice that you are able to edit Textbox `name`, but not Textbox `output`. This is because any Component that acts as an input to an event listener is made interactive. However, since Textbox `output` acts only as an output, Gradio determines that it should not be made interactive. You can override the default behavior and directly configure the interactivity of a Component with the boolean `interactive` keyword argument, e.g. `gr.Textbox(interactive=True)`.

```python
output = gr.Textbox(label="Output", interactive=True)
```

_Note_: What happens if a Gradio component is neither an input nor an output? If a component is constructed with a default value, then it is presumed to be displaying content and is rendered non-interactive. Otherwise, it is rendered interactive. Again, this behavior can be overridden by specifying a value for the `interactive` argument.

## Types of Event Listeners

Take a look at the demo below:

$code_blocks_hello
$demo_blocks_hello

Instead of being triggered by a click, the `welcome` function is triggered by typing in the Textbox `inp`. This is due to the `change()` event listener. Different Components support different event listeners. For example, the `Video` Component supports a `play()` event listener, triggered when a user presses play. See the [Docs](http://gradio.app/docs#components) for the event listeners for each Component.

## Multiple Data Flows

A Blocks app is not limited to a single data flow the way Interfaces are. Take a look at the demo below:

$code_reversible_flow
$demo_reversible_flow

Note that `num1` can act as input to `num2`, and also vice-versa! As your apps get more complex, you will have many data flows connecting various Components.

Here's an example of a "multi-step" demo, where the output of one model (a speech-to-text model) gets fed into the next model (a sentiment classifier).

$code_blocks_speech_text_sentiment
$demo_blocks_speech_text_sentiment

## Function Input List vs Dict

The event listeners you've seen so far have a single input component. If you'd like to have multiple input components pass data to the function, you have two options on how the function can accept input component values:

1. as a list of arguments, or
2. as a single dictionary of values, keyed by the component

Let's see an example of each:
$code_calculator_list_and_dict

Both `add()` and `sub()` take `a` and `b` as inputs. However, the syntax is different between these listeners.

1. To the `add_btn` listener, we pass the inputs as a list. The function `add()` takes each of these inputs as arguments. The value of `a` maps to the argument `num1`, and the value of `b` maps to the argument `num2`.
2. To the `sub_btn` listener, we pass the inputs as a set (note the curly brackets!). The function `sub()` takes a single dictionary argument `data`, where the keys are the input components, and the values are the values of those components.

It is a matter of preference which syntax you prefer! For functions with many input components, option 2 may be easier to manage.

$demo_calculator_list_and_dict

## Function Return List vs Dict

Similarly, you may return values for multiple output components either as:

1. a list of values, or
2. a dictionary keyed by the component

Let's first see an example of (1), where we set the values of two output components by returning two values:

```python
with gr.Blocks() as demo:
    food_box = gr.Number(value=10, label="Food Count")
    status_box = gr.Textbox()

    def eat(food):
        if food > 0:
            return food - 1, "full"
        else:
            return 0, "hungry"

    gr.Button("Eat").click(
        fn=eat,
        inputs=food_box,
        outputs=[food_box, status_box]
    )
```

Above, each return statement returns two values corresponding to `food_box` and `status_box`, respectively.

**Note:** if your event listener has a single output component, you should **not** return it as a single-item list. This will not work, since Gradio does not know whether to interpret that outer list as part of your return value. You should instead just return that value directly.

Now, let's see option (2). Instead of returning a list of values corresponding to each output component in order, you can also return a dictionary, with the key corresponding to the output component and the value as the new value. This also allows you to skip updating some output components.

```python
with gr.Blocks() as demo:
    food_box = gr.Number(value=10, label="Food Count")
    status_box = gr.Textbox()

    def eat(food):
        if food > 0:
            return {food_box: food - 1, status_box: "full"}
        else:
            return {status_box: "hungry"}

    gr.Button("Eat").click(
        fn=eat,
        inputs=food_box,
        outputs=[food_box, status_box]
    )
```

Notice how when there is no food, we only update the `status_box` element. We skipped updating the `food_box` component.

Dictionary returns are helpful when an event listener affects many components on return, or conditionally affects outputs and not others.

Keep in mind that with dictionary returns, we still need to specify the possible outputs in the event listener.

## Updating Component Configurations

The return value of an event listener function is usually the updated value of the corresponding output Component. Sometimes we want to update the configuration of the Component as well, such as the visibility. In this case, we return a new Component, setting the properties we want to change.

$code_blocks_essay_simple
$demo_blocks_essay_simple

See how we can configure the Textbox itself through a new `gr.Textbox()` method. The `value=` argument can still be used to update the value along with Component configuration. Any arguments we do not set will preserve their previous values.

## Not Changing a Component's Value

In some cases, you may want to leave a component's value unchanged. Gradio includes a special function, `gr.skip()`, which can be returned from your function. Returning this function will keep the output component (or components') values as is. Let us illustrate with an example:

$code_skip
$demo_skip

Note the difference between returning `None` (which generally resets a component's value to an empty state) versus returning `gr.skip()`, which leaves the component value unchanged.

Tip: if you have multiple output components, and you want to leave all of their values unchanged, you can just return a single `gr.skip()` instead of returning a tuple of skips, one for each element.

## Running Events Consecutively

You can also run events consecutively by using the `then` method of an event listener. This will run an event after the previous event has finished running. This is useful for running events that update components in multiple steps.

For example, in the chatbot example below, we first update the chatbot with the user message immediately, and then update the chatbot with the computer response after a simulated delay.

$code_chatbot_consecutive
$demo_chatbot_consecutive

The `.then()` method of an event listener executes the subsequent event regardless of whether the previous event raised any errors. If you'd like to only run subsequent events if the previous event executed successfully, use the `.success()` method, which takes the same arguments as `.then()`.

## Binding Multiple Triggers to a Function

Often times, you may want to bind multiple triggers to the same function. For example, you may want to allow a user to click a submit button, or press enter to submit a form. You can do this using the `gr.on` method and passing a list of triggers to the `trigger`.

$code_on_listener_basic
$demo_on_listener_basic

You can use decorator syntax as well:

$code_on_listener_decorator

You can use `gr.on` to create "live" events by binding to the `change` event of components that implement it. If you do not specify any triggers, the function will automatically bind to all `change` event of all input components that include a `change` event (for example `gr.Textbox` has a `change` event whereas `gr.Button` does not).

$code_on_listener_live
$demo_on_listener_live

You can follow `gr.on` with `.then`, just like any regular event listener. This handy method should save you from having to write a lot of repetitive code!

## Binding a Component Value Directly to a Function of Other Components

If you want to set a Component's value to always be a function of the value of other Components, you can use the following shorthand:

```python
with gr.Blocks() as demo:
  num1 = gr.Number()
  num2 = gr.Number()
  product = gr.Number(lambda a, b: a * b, inputs=[num1, num2])
```

This functionally the same as:
```python
with gr.Blocks() as demo:
  num1 = gr.Number()
  num2 = gr.Number()
  product = gr.Number()

  gr.on(
    [num1.change, num2.change, demo.load], 
    lambda a, b: a * b, 
    inputs=[num1, num2], 
    outputs=product
  )
```
