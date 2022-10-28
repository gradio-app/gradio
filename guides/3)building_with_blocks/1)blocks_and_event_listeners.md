# Blocks and Event Listeners

We took a quick look at Blocks in the Quickstart. Let's dive deeper.

## Blocks Structure

Take a look at the demo below.

$code_hello_blocks
$demo_hello_blocks

- First, note the `with gr.Blocks() as demo:` clause. The Blocks app code will be contained within this clause.
- Next come the Components. These are the same Components used in `Interface`. However, instead of being passed to some constructor, Components are automatically added to the Blocks as they are created within the `with` clause.
- Finally, the `click()` event listener. Event listeners define the data flows within the app. In the example above, the listener ties the two Textboxes together. The Textbox `name` acts as the input and Textbox `output` acts as the output to the `greet` method. This dataflow is triggered when the Button `greet_btn` is clicked. Like an Interface, an event listener can take multiple inputs or outputs.

## Event Listeners and Interactivity

In the example above, you'll notice that you are able to edit Textbox `name`, but not Textbox `output`. This is because any Component that acts as an input to an event listener is made interactive. However, since Textbox `output` acts only as an output, it is not interactive. You can directly configure the interactivity of a Component with the `interactive=` keyword argument. 

```python
output = gr.Textbox(label="Output", interactive=True)
```

## Types of Event Listeners

Take a look at the demo below:

$code_blocks_hello
$demo_blocks_hello

Instead of being triggered by a click, the `welcome` function is triggered by typing in the Textbox `inp`. This is due to the `change()` event listener. Different Components support different event listeners. For example, the `Video` Commponent supports a `play()` event listener, triggered when a user presses play. See the [Docs](http://gradio.app/docs) for the event listeners for each Component.

## Running Events Continuously

You can run events on a fixed schedule using the `every` parameter of the event listener. This will run the event
`every` number of seconds. Note that this does not take into account the runtime of the event itself. So a function
with a 1 second runtime running with `every=5`, would actually run every 6 seconds.

Here is an example of a sine curve that updates every second!

$code_sine_curve
$demo_sine_curve

## Multiple Data Flows

A Blocks app is not limited to a single data flow the way Interfaces are. Take a look at the demo below:

$code_reversible_flow
$demo_reversible_flow

Note that `num1` can act as input to `num2`, and also vice-versa! As your apps get more complex, you will have many data flows connecting various Components. 

Here's an example of a "multi-step" demo, where the output of one model (a speech-to-text model) gets fed into the next model (a sentiment classifier).

$code_blocks_speech_text_sentiment
$demo_blocks_speech_text_sentiment

## Function Return List vs Dict

So far, you have seen event listener functions with multiple outputs return a single value for each output component, in the order listed by the event listener. For example:

```python
with gr.Blocks() as demo:
    food_box = gr.Number(value=10, label="Food Count")
    status_box = gr.Textbox()
    def eat(food):
        if food > 0:
            return food - 1, "full"
        else:
            return 0, "hungry"
    gr.Button("EAT").click(
        fn=eat, 
        inputs=food_box,
        outputs=[food_box, status_box]
    )
```

Above, each return statement returns two values corresponding to `food_box` and `status_box`, respectively.

Instead of returning a list of values corresponing to each output component in order, you can also return a dictionary, with the key corresponding to the output component and the value as the new value. This also allows you to skip updating some output components. 

```python
with gr.Blocks() as demo:
    food_box = gr.Number(value=10, label="Food Count")
    status_box = gr.Textbox()
    def eat(food):
        if food > 0:
            return {food_box: food - 1, status_box: "full"}
        else:
            return {status_box: "hungry"}
    gr.Button("EAT").click(
        fn=eat, 
        inputs=food_box,
        outputs=[food_box, status_box]
    )
```

Notice how when there is no food, we only update the `status_box` element. We skipped updating the `food_box` component.

Dictionary returns are helpful when an event listener affects many components on return, or conditionally affects outputs and not others.

Keep in mind that with dictionary returns, we still need to specify the possible outputs in the event listener.

## Updating Component Configurations

The return value of an event listener function is usually the updated value of the corresponding output Component. Sometimes we want to update the configuration of the Component as well, such as the visibility. In this case, we return a `gr.update()` object instead of just the update Component value.

$code_blocks_essay_update
$demo_blocks_essay_update

See how we can configure the Textbox itself through the `gr.update()` method. The `value=` argument can still be used to update the value along with Component configuration.

