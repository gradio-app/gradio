# Creating new components with gr.HTML

If you wish to create custom HTML in your app, use the `gr.HTML` component. Here's a very basic usecase to display a 3 star rating visually.

$code_star_rating_simple
$demo_star_rating_simple

Note how we used the `css_template` argument to add custom CSS that styles the HTML inside the `gr.HTML` component.

If we wanted to update the HTML dynamically based on user input, it would be messy to update the entire HTML. Instead, we can use the `html_template` argument to update the component automatically when the `value` changes.

$code_star_rating_templates
$demo_star_rating_templates

In this example, we used the `html_template` argument to create a star rating component that can be updated easily by changing the `value` variable in the template. The `html_template` accepts any JS template string where the `value` variable corresponds to the current value of the component.

We may wish to pass additional props beyond just `value` to the `html_template`. Simply add these props to your templates and pass them as kwargs to the `gr.HTML` component. For example, lets add `size` and `max_stars` props to the star rating component.

$code_star_rating_props
$demo_star_rating_props

Note how both `html_template` and `css_template` can format these extra props. Note also how any of these props can be updated via Gradio event listeners.

## Triggering Events and Custom Input Components

The `gr.HTML` component can also be used to create custom input components by triggering events. You will provide `js_on_load`, javascript code that runs when the component loads. The code has access to the `trigger` function to trigger events that Gradio can listen to, and the object `props` which has access to all the props of the component, including `value`.

$code_star_rating_events
$demo_star_rating_events

Take a look at the `js_on_load` code above. We add click event listeners to each star image to update the value via `props.value` when a star is clicked. This also re-renders the template to show the updated value. We also add a click event listener to the submit button that triggers the `submit` event. In our app, we listen to this trigger to run a function that outputs the `value` of the star rating.

You can update any other props of the component via `props.<prop_name>`, and trigger events via `trigger('<event_name>')`. The trigger event can also be send event data, e.g.

```js
trigger('event_name', { key: value, count: 123 });
```

This event data will be accessible the Python event listener functions via gr.EventData.

```python
def handle_event(evt: gr.EventData):
    print(evt.key)
    print(evt.count)

star_rating.event(fn=handle_event, inputs=[], outputs=[])
```

## Component Classes

If you are reusing the same HTML component in multiple places, you can create a custom component class by subclassing `gr.HTML` and setting default values for the templates and other arguments. Here's an example of creating a reusable StarRating component.

$code_star_rating_component
$demo_star_rating_component
