# More Blocks Features

## Examples

Just like with `gr.Interface`, you can also add examples for your functions when you are working with `gr.Blocks`. In this case, instantiate a `gr.Examples` similar to how you would instantiate any other component. The constructor of `gr.Examples` takes two required arguments:

- `examples`: a nested list of examples, in which the outer list consists of examples and each inner list consists of an input corresponding to each input component
- `inputs`: the component or list of components that should be populated when the examples are clicked

You can also set `cache_examples=True` or `cache_examples='lazy'`, similar to [the caching API in `gr.Interface`](https://www.gradio.app/guides/more-on-examples), in which case two additional arguments must be provided:

- `outputs`: the component or list of components corresponding to the output of the examples
- `fn`: the function to run to generate the outputs corresponding to the examples

Here's an example showing how to use `gr.Examples` in a `gr.Blocks` app:

```python
import gradio as gr

def calculator(num1, operation, num2):
    if operation == "add":
        return num1 + num2
    elif operation == "subtract":
        return num1 - num2
    elif operation == "multiply":
        return num1 * num2
    elif operation == "divide":
        return num1 / num2

with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            num_1 = gr.Number(value=4)
            operation = gr.Radio(["add", "subtract", "multiply", "divide"])
            num_2 = gr.Number(value=0)
            submit_btn = gr.Button(value="Calculate")
        with gr.Column():
            result = gr.Number()

    submit_btn.click(
        calculator, inputs=[num_1, operation, num_2], outputs=[result], api_visibility="private"
    )
    examples = gr.Examples(
        examples=[
            [5, "add", 3],
            [4, "divide", 2],
            [-4, "multiply", 2.5],
            [0, "subtract", 1.2],
        ],
        inputs=[num_1, operation, num_2],
    )

if __name__ == "__main__":
    demo.launch(footer_links=["gradio"])

```

**Note**: When you click on examples, not only does the value of the input component update to the example value, but the component's configuration also reverts to the properties with which you constructed the component. This ensures that the examples are compatible with the component even if its configuration has been changed.

## Running Events Continuously

You can run events on a fixed schedule using `gr.Timer()` object. This will run the event when the timer's `tick` event fires. See the code below:

```python
with gr.Blocks as demo:
    timer = gr.Timer(5)
    textbox = gr.Textbox()
    textbox2 = gr.Textbox()
    timer.tick(set_textbox_fn, textbox, textbox2)
```

This can also be used directly with a Component's `every=` parameter, if the value of the Component is a function:

```python
with gr.Blocks as demo:
    timer = gr.Timer(5)
    textbox = gr.Textbox()
    textbox2 = gr.Textbox(set_textbox_fn, inputs=[textbox], every=timer)
```

Here is an example of a demo that print the current timestamp, and also prints random numbers regularly!

```python
import gradio as gr
import random
import time

with gr.Blocks() as demo:
  timer = gr.Timer(1)
  timestamp = gr.Number(label="Time")
  timer.tick(lambda: round(time.time()), outputs=timestamp, api_name="timestamp")

  number = gr.Number(lambda: random.randint(1, 10), every=timer, label="Random Number")
  with gr.Row():
    gr.Button("Start").click(lambda: gr.Timer(active=True), None, timer)
    gr.Button("Stop").click(lambda: gr.Timer(active=False), None, timer)
    gr.Button("Go Fast").click(lambda: 0.2, None, timer)

if __name__ == "__main__":
  demo.launch()

```

## Gathering Event Data

You can gather specific data about an event by adding the associated event data class as a type hint to an argument in the event listener function.

For example, event data for `.select()` can be type hinted by a `gradio.SelectData` argument. This event is triggered when a user selects some part of the triggering component, and the event data includes information about what the user specifically selected. For example, if a user selected a specific word in a `Textbox`, a specific pixel in an `Image`, a specific image in a `Gallery`, or a specific cell in a `DataFrame`, the event data argument would contain information about the specific selection.

The `SelectData` includes the value that was selected, and the index where the selection occurred. A simple example that shows what text was selected in a `Textbox`.

```python
import gradio as gr

with gr.Blocks() as demo:
    textbox = gr.Textbox("The quick brown fox jumped.")
    selection = gr.Textbox()

    def get_selection(select_evt: gr.SelectData):
        return select_evt.value

    textbox.select(get_selection, None, selection)
```

In the 2 player tic-tac-toe demo below, a user can select a cell in the `DataFrame` to make a move. The event data argument contains information about the specific cell that was selected. We can first check to see if the cell is empty, and then update the cell with the user's move.

```python
import gradio as gr

with gr.Blocks() as demo:
    turn = gr.Textbox("X", interactive=False, label="Turn")
    board = gr.Dataframe(value=[["", "", ""]] * 3, interactive=False, type="array")

    def place(board: list[list[int]], turn, evt: gr.SelectData):  
        if evt.value:
            return board, turn
        board[evt.index[0]][evt.index[1]] = turn
        turn = "O" if turn == "X" else "X"
        return board, turn

    board.select(place, [board, turn], [board, turn], show_progress="hidden")

demo.launch()

```

## Validation

For certain apps, it is important to validate inputs prior to using them. While this can be done in the main event function, events also support a `validator` function dedicated to this task.

This feature allows for a far better user experience than placing this logic in your main function for the following reasons:

- Input validation is performed immediately, bypassing the queue, giving the end user almost instant feedback.
- Validation errors returned from the `validator` function are displayed differently in the UI.
- The validator function allows for greater granularity. Rather than raising a generic exception, you can return a validation message and status for each input individually.

The `validator` kwarg should be a function that returns a `gr.validate` object for each input. `gr.validate` takes two arguments:

- `is_valid` - whether or not the input is valid
- `message` - the message to display if validation fails.

In the demo below you can see that by returning a validation status for each input, we have more granular information that we can display to the user.

```python
import gradio as gr

def validate_input(age, location):
    return [
        gr.validate(not age or age > 3, "Age must be at least 3"),
        gr.validate("london" not in location.lower(), "Location must not be in London"),
    ]

def process_text(age, location):
    return f"Processed: {age} -- {location.upper()}"

with gr.Blocks() as demo:
    gr.Markdown("# Validator Parameter Test Demo")

    with gr.Row():
        with gr.Column():
            age = gr.Number(
                label="Enter age",
                placeholder="Enter age",
            )
            location = gr.Textbox(
                max_lines=3,
                label="Enter location",
                placeholder="Enter location",
            )

    validate_btn = gr.Button("Process with Validation", variant="primary")

    output_with_validation = gr.Textbox(
        label="Output (with validation)", interactive=False
    )

    validate_btn.click(
        fn=process_text,
        validator=validate_input,
        inputs=[age, location],
        outputs=output_with_validation,
    )

demo.launch()

```