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

Now whenever the inputs change, the function re-runs, and replaces the components created from the previous function run with the latest run. Pretty straightforward! Let's add a little more complexity to this app:

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

This allows us to create highly customizable and complex interactions! 

## Closer Look at `keys=` parameter

The `key=` argument is used to let Gradio know that the same component is being generated when your render function re-runs. This does two things:

1. The same element in the browser is re-used from the previous render for this Component. This gives browser performance gains - as there's no need to destroy and rebuild a component on a render - and preserves any browser attributes that the Component may have had. If your Component is nested within layout items like `gr.Row`, make sure they are keyed as well because the keys of the parents must also match.
2. Properties that may be changed by the user or by other event listeners are preserved. By default, only the "value" of Component is preserved, but you can specify any list of properties to preserve using the `preserved_by_key=` kwarg.

See the example below:

$code_render_preserve_key
$demo_render_preserve_key

You'll see in this example, when you change the `number_of_boxes` slider, there's a new re-render to update the number of box rows. If you click the "Change Label" buttons, they change the `label` and `info` properties of the corresponding textbox. You can also enter text in any textbox to change its value. If you change number of boxes after this, the re-renders "reset" the `info`, but the `label` and any entered `value` is still preserved.

## Putting it Together

Let's look at two examples that use all the features above. First, try out the to-do list app below: 

$code_todo_list
$demo_todo_list

Note that almost the entire app is inside a single `gr.render` that reacts to the tasks `gr.State` variable. This variable is a nested list, which presents some complexity. If you design a `gr.render` to react to a list or dict structure, ensure you do the following:

1. Any event listener that modifies a state variable in a manner that should trigger a re-render must set the state variable as an output. This lets Gradio know to check if the variable has changed behind the scenes. 
2. In a `gr.render`, if a variable in a loop is used inside an event listener function, that variable should be "frozen" via setting it to itself as a default argument in the function header. See how we have `task=task` in both `mark_done` and `delete`. This freezes the variable to its "loop-time" value.

Let's take a look at one last example that uses everything we learned. Below is an audio mixer. Provide multiple audio tracks and mix them together.

$code_audio_mixer
$demo_audio_mixer

Two things to note in this app:
1. Here we provide `key=` to all the components! We need to do this so that if we add another track after setting the values for an existing track, our input values to the existing track do not get reset on re-render.
2. When there are lots of components of different types and arbitrary counts passed to an event listener, it is easier to use the set and dictionary notation for inputs rather than list notation. Above, we make one large set of all the input `gr.Audio` and `gr.Slider` components when we pass the inputs to the `merge` function. In the function body we query the component values as a dict.

The `gr.render` expands gradio capabilities extensively - see what you can make out of it! 
