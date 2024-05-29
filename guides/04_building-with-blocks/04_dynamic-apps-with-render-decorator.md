# Dynamic Apps with the Render Decorator

The components and event listeners you define in a Blocks so far have been fixed - once the demo was launched, new components and listeners could not be added, and existing one could not be removed. 

The `@gr.render` decorator introduces the ability to dynamically change this. Let's take a look. 

## Dynamic Number of Components

In the example below, we will create a variable number of Textboxes. When the user edits the input Textbox, we create a Textbox for each letter in the input. Try it out below:

$code_render_split_simple
$demo_render_split_simple

See how we can now create a variable number of Textboxes using our custom logic - in this case, a simple `for` loop. The `@gr.render` decorator enables this with the following steps:

1. Create a function and attach the @gr.render decorator to it.
2. Add the input components to the `inputs=` argument of @gr.render, and create a corresponding argument in your function for each component. This function will automatically re-run on any change to a component.
3. Add all components inside the function that you want to render based on the inputs.

Now whenever the inputs change, the funciton re-runs, and replaces the components created from the previous funciton run with the latest run. Pretty straightforward! Let's add a little more complexity to this app:

$code_render_split
$demo_render_split

By default, `@gr.render` re-runs are triggered by the `.load` listener to the app and the `.change` listener to any input component provided. We can override this by explicitly setting the triggers in the decorator, as we have in this app to only trigger on `input_text.submit` instead. 
If you are setting custom triggers, and you also want an automatic render at the start of the app, make sure to add `demo.load` to your list of triggers.

## Dynamic Event Listeners

If you're creating components, you probably want to attach event listeners to them as well. Let's take a look at an example that takes in a variable number of Textbox as input, and merges all the text into a single box.

$code_render_merge_simple
$demo_render_merge_simple

Let's take a look at what's happening here:

1. The state variable `text_count` is keeping track of the number of Textboxes to create. By clicking on the Add button, we increase `text_count` which triggers the render decorator.
2. Note that in every single Textbox we create in the render function, we explicitly set a `key=` argument. This key allows us to preserve the value of this Component between re-renders. If you type in a value in a textbox, and then click the Add button, all the Textboxes re-render, but their values aren't cleared because the `key=` maintains the the value of a Component across a render.
3. We've stored the Textboxes created in a list, and provide this list as input to the merge button event listener. Note that **all event listeners that use Components created inside a render function must also be defined inside that render function**. The event listener can still reference Components outside the render function, as we do here by referencing `merge_btn` and `output` which are both defined outside the render function.

Just as with Components, whenever a function re-renders, the event listeners created from the previous render are cleared and the new event listeners from the latest run are attached. 

This allows us to create highly customizable and complex interactions! Take a look at the example below, which spices up the previous example with a lot more event listeners:

$code_render_merge
$demo_render_merge
