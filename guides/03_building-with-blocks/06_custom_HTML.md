# Creating new components with gr.HTML

If you wish to create custom HTML in your app, use the `gr.HTML` component. Here's a basic "HTML-only" example:

```python
gr.HTML("<h1>Hello World!</h1>")
```

You can also use html-templates to organize your HTML. Take a look at the example below:

```python
gr.HTML("John", "<h1>Hello, {{ value }}!</h1><p>${value.length} letters</p>")
```

"John" becomes `value` when injected into the template, resulting in:

```html
<h1>Hello, John!</h1><p>4 letters</p>
```

Notice how we support two types of templating syntaxes: `${}` for custom JavaScript expressions, and `{{ }}` and `{% %}` for Nunjucks templating. You can use either or both in your templates - `${}` allows for completely custom JS logic, while Nunjucks allows for cleaner python-like organization for loops and conditionals.

Let's look at another example for displaying a list of items:

```python
gr.HTML(["apple", "banana", "cherry"], """
    <h1>${value.length} fruits:</h1>
    <ul>
      {% for item in value %}
        <li>{{ item }}</li>
      {% endfor %}
    </ul>
""")
```

Let's build a simple star rating component using `gr.HTML`, and then extend it with more features.

$code_star_rating_simple
$demo_star_rating_simple

Note how we used the `css_template` argument to add custom CSS that styles the HTML inside the `gr.HTML` component.

Let's see how the template automatically updates when we update the value.

$code_star_rating_templates
$demo_star_rating_templates

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

Keep in mind that event listeners attached in `js_on_load` are only attached once when the component is first rendered. If your component creates new elements dynamically that need event listeners, attach the event listener to a parent element that exists when the component loads, and check for the target. For example:

```js
element.addEventListener('click', (e) =>
    if (e.target && e.target.matches('.child-element')) {
        props.value = e.target.dataset.value;
    }
);
```

## Component Classes

If you are reusing the same HTML component in multiple places, you can create a custom component class by subclassing `gr.HTML` and setting default values for the templates and other arguments. Here's an example of creating a reusable StarRating component.

$code_star_rating_component
$demo_star_rating_component
