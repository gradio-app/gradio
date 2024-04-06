# Wrapping Gradio Layouts

Tags: API

## Introduction

Gradio features [blocks](https://www.gradio.app/docs/blocks) to easily layout applications. To use this feature, you have to nest the layout components under each other and build a hierarchy with them. This implementation isn't difficult to implement and maintain for small projects, but after the project gets complex, this component hierarchy becomes difficult to maintain and reusing layouts becomes difficult.

In this guide, we are going to explore how we can wrap the layout classes to create more maintainable and easy-to-read applications without sacrificing flexibility.

## Implementation

- The wrapping utility has two important classes. The first one is the ```LayoutBase``` class and the other one is the ```Application``` class. Let's start with these classes' implementations first. Then we can look at how we can wrap the layouts from the gradio package with the ```LayoutBase``` class.
- [x] As a note, this implementation is for demonstration purposes. The purpose here is to draw attention to the benefits gained by wrapping and provide a simple example to show how this can be implemented.

### LayoutBase class

- This class is going to be the base class for the layout classes we are going to wrap. For example for ```gradio.layouts.Row``` layout, we are going to wrap it to the `RowLayout` class and this class is going to inherit from the ```LayoutBase``` class.
- The `LayoutBase` class has four variables. Let's write them and the constructor:
 
```python
class LayoutBase:
    main_layout: Block
    name: str
    global_children_dict: Dict[str, Block]
    renderables: list

    def __init__(self) -> None:
        self.main_layout = None
        self.name = "Layout Base"
        self.global_children_dict = {}
        self.renderables = []
```

- Here are the variables' definitions:

|       Variable       |              Type              | Definition                                                                                                                                       |
| :------------------: | :----------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------- |
|     main_layout      |      gradio.blocks.Block       | Stores the main layout from the gradio package of this class. For example storing ```gradio.layouts.Row``` layout for the ```RowLayout``` class. |
|         name         |              str               | Name of the class. Using to differentiate from other layouts and for debug purposes.                                                             |
| global_children_dict | Dict[str, gradio.blocks.Block] | Stores the children components with given name.                                                                                                  |
|     renderables      |              list              | Stores the renderable elements. Layout and components are not separated because the order is important.                                          |

---------------------------------------------

- Now let's write the ```add_component``` function:

```python
    # other LayoutBase implementations

    def add_component(self, name: str, component: Block) -> None:
        self.renderables.append(component)
        self.global_children_dict[name] = component
```

- The ```component``` parameter can be Textbox, TextArea, or any component from the gradio package.
- If the `Block` component confuses you, the components and layouts in the gradio package are inherited from the ```gradio.blocks.Block``` class eventually. This function is similar to ```gradio.blocks.BlockContext.add``` function.
- The new component is added to ```renderables``` and ```global_children_dict``` variables. In the ```add_layout``` function, you will understand why there are two different variables for the children components.

---------------------------------------------

- Let's implement the ```add_layout``` function:

```python
    # other LayoutBase implementations

    def add_layout(self, layout: LayoutBase) -> None:
            self.renderables.append(layout)
            self.global_children_dict.update(layout.global_children_dict)
```

- As you can see, the ```global_children_dict``` variable is updating the dictionary with the added new layout's ```global_children_dict``` variable. With this functionality, the parent class includes all the components that children layouts have. You can see in the ```_attach_event``` function why this is important.

---------------------------------------------

- Now, let's implement the most important function of the class, the ```render``` function:

```python
    # other LayoutBase implementations

    def render(self) -> None:
        with self.main_layout:
            for renderable in self.renderables:
                renderable.render()

        self.main_layout.render()
```

- ```with``` functionality in the ```gradio.blocks.Block``` is setting the ```Context.block``` which is used in the `render` function. When rendering the ```renderables```, we are adding the components to ```main_layout```. 
- When rendering the ```main_layout```, we are adding the ```main_layout``` to the component which is calling the ```render``` function with the ```with``` syntax.
- This is a little confusing at first but if you think with the default implementation you can understand it easily. Let's look at an example:

In the default implementation, we are doing this:

```python
with Row():
    first_textbox = Textbox(value="first_textbox")
    second_textbox = Textbox(value="second_textbox")
```

- Now let's pay attention to the textbox variables. These variables' render parameter is true by default. So as we use ```with``` syntax and create these variables, they are calling the render function under the ```with``` syntax. We know that from the constructor implementation of the ```gradio.blocks.Block``` class:

```python
# other assign functions 

if render:
    self.render()
```

- In the ```render``` function of the ```LayoutBase``` class, we are simulating it. We are calling the render functions under the ```with``` syntax.
- Now let's expand the above example to understand why we have to call the ```main_layout``` variable's render function:

```python
with Tab():
    with Row():
        first_textbox = Textbox(value="first_textbox")
        second_textbox = Textbox(value="second_textbox")
```

- Pay attention to the Row and Tab this time. We created the textbox variables above and added them to Row with ```with``` syntax. Now we need to add the Row to the Tab. You can see that Row is created with default parameters, so its render parameter is true, so the render function is going to be executed under the Tabs ```with``` syntax. As we know from the above example, it is going to be added in the Tab because the Tab is calling the render function under the ```with``` syntax.
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

- The default and our implementations are the same, but we are using the render function ourselves. So it requires a little work.

---------------------------------------------

- After we create the ```Application``` and render the components we can clear the components because the components are going to be live in the ```app``` variable which is the type of the ```gradio.block.Blocks``` class and in the ```Application``` class. You can check this with the ```app.blocks``` variable.
- So let's implement our ```clear``` function:

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

- Now the last function we have to implement in the ```LayoutBase``` class is the ```attach_event``` function. The function is left as not implemented because it is more specific to the class, so each class has to implement its `attach_event` function.

```python
    # other LayoutBase implementations

    def attach_event(self, block_dict: Dict[str, Block]) -> None:
        raise NotImplementedError
```

- You can see what is the ```block_dict``` variable in the ```_attach_event``` function which is implemented in the ```Application``` class.
- With this function, we finished implementing the ```LayoutBase``` class.
- As for completeness, here is the full implementation:

```python
class LayoutBase:
    main_layout: Block
    name: str
    global_children_dict: Dict[str, Block]
    renderables: list

    def __init__(self) -> None:
        self.main_layout = None
        self.name = "Layout Base"
        self.global_children_dict = {}
        self.renderables = []

    def add_component(self, name: str, component: Block) -> None:
        self.renderables.append(component)
        self.global_children_dict[name] = component

    def add_layout(self, layout: LayoutBase) -> None:
        self.renderables.append(layout)
        self.global_children_dict.update(layout.global_children_dict)

    def render(self) -> None:
        with self.main_layout:
            for renderable in self.renderables:
                renderable.render()

        self.main_layout.render()

    def clear(self) -> None:
        self.global_children_dict.clear()

        for renderable in self.renderables:
            if isinstance(renderable, LayoutBase):
                renderable.clear()

        self.renderables.clear()

    def attach_event(self, block_dict: Dict[str, Block]) -> None:
        raise NotImplementedError
```

### Application Class

- Now we are going to implement the ```Application``` class which is responsible for giving the global components to children layouts for the ```attach_event``` function, rendering the components and launching the application.

- Let's start the implementation with the constructor and variable definitions:

```python
class Application:
    app: Blocks
    children: list[LayoutBase]

    # Blocks constructor parameters are omitted for brevity
    def __init__(self) -> None:
        self.app = Blocks()

        self.children = []
```

- Here are the variables' definitions:

| Variable |       Type       | Definition                                          |
| :------: | :--------------: | :-------------------------------------------------- |
|   app    |  gradio.Blocks   | Base application component from the gradio package. |
| children | list[LayoutBase] | Stores the layouts                                  |

---------------------------------------------

- Let's implement the ```add``` function:

```python
    # other Application implementations

    def add(self, child: LayoutBase):
        self.children.append(child)
```

- It has a straightforward implementation. We are just adding the given layout to the children variable.

---------------------------------------------

- Now let's implement the ```_render``` function which is important for the structure of the application:

```python
    # other Application implementations

    def _render(self):
        with self.app:
            for child in self.children:
                child.render()

        self.app.render()
```

- This ```_render``` function is implemented as same as the ```render``` function.
- From the explanation of the ```LayoutBase``` class's ```render``` function, we can understand the ```child.render``` part.
- So let's look at the below part, why we are calling the ```app```'s ```render``` function? We are calling this render function because if we look at the implementation of this function in the ```gradio.blocks.Blocks``` class, it is adding the components and event functions into the root component. With another saying it is creating the gradio application. So it is important to call this function.

---------------------------------------------

- Let's see how we can attach events to components with new classes that we have implemented:

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

- You can see why the ```global_children_list``` is used in the ```LayoutBase``` class. With this, all the components in the application are gathered into one dictionary, so the component can access all the components with names that are used to insert into the dictionary variable.
- If the layout does not implement the ```attach_event``` function, the class prints a message with the name that is assigned in the class to inform the developer.
- ```with``` syntax is used here again because we need the ```Context.block``` variable to be assigned to attach events to components.

---------------------------------------------

- We render components and attach events to them. As we did these functions our events are stored in the ```app.fns``` variable and our components are stored in ```app.blocks``` variable, so we don't need them anymore. We can clear them with ```_clear``` function:

```python
    def _clear(self):
        from gc import collect

        for child in self.children:
            child.clear()

        self.children.clear()

        collect()
```

- We call all the children with their ```clear``` function then clear the ```children``` variable. Then call ```gc.collect``` for memory saving.

---------------------------------------------

- At this point, the application setup is finished. In the ```launch``` function, we can call these functions and launch the application:

```python
    # other Application implementations

    # launch function parameters are omitted for the brevity
    def launch(self) -> tuple[FastAPI, str, str]:
        self._render()
        self._attach_event()
        self._clear()

        return self.app.launch()
```

---------------------------------------------

- With this function, we finished implementing the ```Application``` class.
- As for completeness, here is the full implementation:

```python
class Application:
    app: Blocks
    children: list[LayoutBase]

    # Blocks constructor parameters are omitted for brevity
    def __init__(self) -> None:
        self.app = Blocks()
        self.children = []

    def add(self, child: LayoutBase):
        self.children.append(child)

    def _render(self):
        with self.app:
            for child in self.children:
                child.render()

        self.app.render()

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

    def _clear(self):
        from gc import collect

        for child in self.children:
            child.clear()

        self.children.clear()

        collect()

    # launch function parameters are omitted for the brevity
    def launch(self) -> tuple[FastAPI, str, str]:
        self._render()
        self._attach_event()
        self._clear()

        return self.app.launch()
```

### Wrapped Layouts

- As we implemented the main classes, we can implement the wrap layout classes. The implementations are straightforward:

```python
# the parameters for the layouts are omitted for the brevity

class RowLayout(LayoutBase):
    def __init__(self, name: str) -> None:
        super().__init__()

        self.main_layout = Row()

        self.global_children_dict[name] = self.main_layout


class ColumnLayout(LayoutBase):
    def __init__(self, name: str) -> None:
        super().__init__()

        self.main_layout = Column()

        self.global_children_dict[name] = self.main_layout


class TabLayout(LayoutBase):
    def __init__(self, name: str) -> None:
        super().__init__()

        self.main_layout = Tab(label=name)

        self.global_children_dict[name] = self.main_layout
```

- We are adding the ```main_layout``` variables to ```global_children_dict``` because we may want to reach them in the ```attach_event``` functions.
- We are not using the ```add_component``` function because we don't want them to be rendered in the ```render``` function, we are handling it already.

## Example

- Let's write a simple example to show how we can use the classes that we have created.
- In this example, we are going to use two tabs, one row and one column layouts.
- Row and column layouts are going to have two textboxes.
- Row's and column's second textboxes are going to be attached to the row's first textbox's value.
- Let's start to write the example!

### RowExample class

```python
def change_text(new_str: str):
    return Textbox(value=new_str)

class RowExample(RowLayout):
    def __init__(self, name: str) -> None:
        super().__init__(name=name)

        self.left_textbox = Textbox(
            value="Left Textbox", interactive=True, render=False
        )
        self.right_textbox = Textbox(value="Right Textbox", render=False)

        self.add_component("left_textbox", self.left_textbox)
        self.add_component("right_textbox", self.right_textbox)

    def attach_event(self, block_dict: Dict[str, Block]) -> None:
        self.left_textbox.change(
            change_text,
            inputs=self.left_textbox,
            outputs=self.right_textbox,
        )
```
- As you can see from the constructor of the ```RowExample``` class, we added the ```render=False``` argument when creating the Textbox variable. This is an important parameter to add because we are calling the render function ourselves, so we don't want it to be called in the constructor of the component.

### FirstTab class

```python
class FirstTab(TabLayout):
    def __init__(self, name: str) -> None:
        super().__init__(name)

        self.row = RowExample(name="first tab row layout")

        self.add_layout(self.row)

    def attach_event(self, block_dict: Dict[str, Block]) -> None:
        self.row.attach_event(block_dict)
```
- Here you can see that the parent class is calling the children layout's ```attach_event``` function in its ```attach_event``` function. This has to be done if the parent class has children layouts otherwise the children ```attach_event``` functions are not called.

### SecondTab class

```python
class SecondTab(TabLayout):
    def __init__(self, name: str) -> None:
        super().__init__(name)

        self.column = ColumnLayout(name="second tab column layout")

        self.top_textbox = Textbox(value="Top Textbox", interactive=True)
        self.bottom_textbox = Textbox(value="Bottom Textbox")

        self.column.add_component("top_textbox", self.top_textbox)
        self.column.add_component("bottom_textbox", self.bottom_textbox)

        self.add_layout(self.column)

    def attach_event(self, block_dict: Dict[str, Block]) -> None:
        block_dict["left_textbox"].change(
            change_text,
            inputs=block_dict["left_textbox"],
            outputs=self.bottom_textbox,
        )
```
- We can see that we can use the wrapped layout classes without defining another class. We can use them as they are.
- In the ```attach_event``` function, we can get the row's first textbox component with the name string. With this functionality, we don't have to deal with giving the required components to the ```attach_event``` function problem.

### Main function

```python
if __name__ == "__main__":
    gui = Application(title="Wrap Gradio")

    first_tab = FirstTab(name="First Tab")
    second_tab = SecondTab(name="Second Tab")

    gui.add(first_tab)
    gui.add(second_tab)

    gui.launch()
```

- Main function is straightforward. We create our application first. Then we create our tab variables and add them to the application with the ```add``` function. At last, we launch the application.
-  In the example, when changing the ```Left Textbox``` component's text value, the ```Right Textbox``` and ```Bottom Textbox``` components' values are changing according to the ```Left Textbox```'s text value.