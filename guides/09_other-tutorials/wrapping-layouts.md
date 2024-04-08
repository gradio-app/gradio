# Wrapping Layouts

Tags: LAYOUTS

## Introduction

Gradio features [blocks](https://www.gradio.app/docs/blocks) to easily layout applications. To use this feature, you need to stack or nest layout components and create a hierarchy with them. This implementation isn't difficult to implement and maintain for small projects, but after the project gets complex, this component hierarchy becomes difficult to maintain and reusing layouts becomes difficult.

In this guide, we are going to explore how we can wrap the layout classes to create more maintainable and easy-to-read applications without sacrificing flexibility.

## Example 
- We are going to follow the implementation from this Huggingface Space example:

<gradio-app 
space="WoWoWoWololo/wrapping-layouts">
</gradio-app>

## Implementation

- The wrapping utility has two important classes. The first one is the ```LayoutBase``` class and the other one is the ```Application``` class. 
- We are going to look at the render and attach_event functions of them for brevity. You can look at their full implementation from [the example code](https://huggingface.co/spaces/WoWoWoWololo/wrapping-layouts/blob/main/app.py).
- So let's start with the ```LayoutBase``` class.

### LayoutBase Class

1. Render Function

```python
# other LayoutBase implementations

def render(self) -> None:
    with self.main_layout:
        for renderable in self.renderables:
            renderable.render()

    self.main_layout.render()
```

- This is a little confusing at first but if you think with the default implementation you can understand it easily. Let's look at an example:

In the default implementation, we are doing this:

```python
with Row():
    left_textbox = Textbox(value="left_textbox")
    right_textbox = Textbox(value="right_textbox")
```

- Pay attention to the textbox variables. These variables' render parameter is true by default. So as we use ```with``` syntax and create these variables, they are calling the render function under the ```with``` syntax. 
- We know the render function is called in the constructor with the implementation from the ```gradio.blocks.Block``` class:

```python
class Block:
    # constructor parameters are omitted for brevity
    def __init__(self, ...):
        # other assign functions 

        if render:
            self.render()
```

- So our implementation looks like this:

```python
# self.main_layout -> Row()
with self.main_layout:
    left_textbox.render()
    right_textbox.render()
```

- So with calling the components' render functions under the ```with``` syntax, we are simulating the default implementation actually.
- If we understand the below ```with``` syntax, let's move on the upper ```with``` syntax. For this, let's expand our example with ```Tab``` component:

```python
with Tab():
    with Row():
        first_textbox = Textbox(value="first_textbox")
        second_textbox = Textbox(value="second_textbox")
```

- Pay attention to the Row and Tab this time. We created the textbox variables above and added them to Row with ```with``` syntax. Now we need to add the Row to the Tab. You can see that Row is created with default parameters, so its render parameter is true, that's why the render function is going to be executed under the Tabs ```with``` syntax. As we know from the above example, it is going to be added in the Tab because the Tab is calling the render function under the ```with``` syntax.
- To mimic this implementation we need to call the ```render``` function of the ```main_layout``` variable after the ```with``` syntax of the ```main_layout``` variable.

- So the implementation looks like this:

```python
with tab_main_layout:
    with row_main_layout:
        first_textbox.render()
        second_textbox.render()

    row_main_layout.render()

tab_main_layout.render()
```

- The default implementation and our implementation are the same, but we are using the render function ourselves. So it requires a little work.

1. Attach Event Function

- After we create the ```Application``` and render the components, we can clear the components because the components are going to be live in the ```app``` variable which is a variable of the ```Application``` class. You can check this with the ```app.blocks``` variable.
- So let's implement the ```clear``` function:

```python
    # other LayoutBase implementations

    def clear(self) -> None:
        self.global_children_dict.clear()

        for renderable in self.renderables:
            if isinstance(renderable, LayoutBase):
                renderable.clear()

        self.renderables.clear()
```

- We choose the layouts from the renderables list variable and call the ```clear``` function of them. With this, we can be sure that all the objects that are stored are cleaned.

---------------------------------------------

- Now the last function we have to implement in the ```LayoutBase``` class is the ```attach_event``` function. The function is left as not implemented because it is specific to the class, so each class has to implement its `attach_event` function.

```python
    # other LayoutBase implementations

    def attach_event(self, block_dict: Dict[str, Block]) -> None:
        raise NotImplementedError
```

- You can see what is the ```block_dict``` variable in the ```_attach_event``` function which is implemented in the ```Application``` class.

### Application Class

1. Render Function

```python
    # other Application implementations

    def _render(self):
        with self.app:
            for child in self.children:
                child.render()

        self.app.render()
```

- From the explanation of the ```LayoutBase``` class's ```render``` function, we can understand the ```child.render``` part.
- So let's look at the below part, why we are calling the ```app``` variable's ```render``` function? We are calling this render function because if we look at the implementation of this function in the ```gradio.blocks.Blocks``` class, we can see that it is adding the components and event functions into the root component. With another saying, it is creating and structuring the gradio application. So it is important to call this function.

2. Attach Event Function

- Let's see how we can attach events to components with new classes that we have implemented with the ```_attach_event``` function:

```python
    # other Application implementations

    def _attach_event(self):
        block_dict: Dict[str, Block] = {}

        for child in self.children:
            block_dict.update(child.global_children_dict)

        with self.app:
            for child in self.children:
                try:
                    child.attach_event(block_dict=block_dict)
                except NotImplementedError:
                    print(f"{child.name}'s attach_event is not implemented")
```

- You can see why the ```global_children_list``` is used in the ```LayoutBase``` class. With this, all the components in the application are gathered into one dictionary, so the component can access all the components with their names.
- If the layout does not implement the ```attach_event``` function, the class prints a message with the name that is assigned in the class to inform the developer.
- ```with``` syntax is used here again to attach events to components.

## Conclusion
- In this guide, we have learned
    - How we can wrap the layouts
    - How components are rendered
    - How we can structure our application with wrapped layout classes

- Because the classes used in this guide are used for demonstration purposes, they may lack optimizations or useful functionality. But this is the subject of another guide.
- I hope this guide helps you to gain another view to look at the layout classes and gives you an idea about how you can use them for your needs.
