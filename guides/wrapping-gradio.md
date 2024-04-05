# Wrapping Gradio

Tags: API

## Introduction

Gradio offers [Blocks](https://www.gradio.app/docs/blocks) class to easily layout web applications. To use this feature, you have to nest the layout components under each other and build a hierarchy with them. This implementation isn't difficult to implement and maintain for small projects, but after the project gets complex, this component hierarchy becomes difficult to maintain and reusing components become difficult.

In this guide, we are going to explore how we can wrap the layout classes to create more robust, maintainable and easy to read applications.

## Implementations

Our implementation has two important classes. First one is the ```LayoutBase``` class and the other one is ```Application``` class. So let's start this classes' implementations first.

### LayoutBase class

- This class is going to be the base class for layout classes we are going to wrap. For example for ```gradio.layouts.Row``` layout, we are going to wrap it to ```RowLayout``` class and this class is going to inherit from the ```LayoutBase``` class.

- ```LayoutBase``` class has four variables. Let's write them and classes' constructor:
 
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

- You can check the variables definitions below:

|       Variable       | Definition                                                                                                               |
| :------------------: | :----------------------------------------------------------------------------------------------------------------------- |
|     main_layout      | Stores the main layout of this class. For example storing ```gradio.layouts.Row``` layout for the ```RowLayout``` class. |
|         name         | Name of the class. Using to differentiate from other layouts and for debug purposes.                                     |
| global_children_dict | Stores the children components with given name. Its values are accumulating with each parent.                            |
|     renderables      | Stores the renderable elements. Layout and children components are not separated because the order is important.         |

---------------------------------------------

- Now let's write the ```add_component``` function:

```python
    # other LayoutBase implementations

    def add_component(self, name: str, component: Block) -> None:
        self.renderables.append(component)
        self.global_children_dict[name] = component
```

- This component can be Textbox, TextArea, any component from the gradio package.
- If the ```Block``` component confuse you, the components and layouts in the gradio package are inherit from the ```gradio.blocks.Block``` class eventually. Actually, this function is similar to ```gradio.blocks.BlockContext.add``` function.
- You can see from this function, new component is added to ```renderables``` and ```global_children_dict``` variables. In the ```add_layout``` function, you will understand why there are two different variables for the children components.

---------------------------------------------

- Let's implement the ```add_layout``` function:

```python
    # other LayoutBase implementations

    def add_layout(self, layout: LayoutBase) -> None:
            self.renderables.append(layout)
            self.global_children_dict.update(layout.global_children_dict)
```

- As you can see, ```global_children_dict``` variable is updating the dictionary with the added new layout's ```global_children_dict``` variable. With this functionality, the parent class includes all the components that children layouts have. You can see in the ```_attach_event``` function why this is important.

---------------------------------------------

- Now, let's implement the most important part of the class, the ````render``` function:

```python
    # other LayoutBase implementations

    def render(self) -> None:
    with self.main_layout:
        for renderable in self.renderables:
            renderable.render()

    self.main_layout.render()
```

- ```with``` functionality in the ```gradio.blocks.Block``` is setting the ```Context.block``` which is used in the ```render``` function. This syntax is important because we are not rendering as we initialize the component, but we render after with ```render``` function. So we have to set the ```Context.block``` to render the component. If we did not use the ```with``` functionality then the components are rendered with the column style because the default style is the column style.
- We render the ```renderables``` then we render the ```main_layout``` because we have just rendered the children components, or ```renderables``` as their variable name, so we have to render the main ```Context.block``` as well.

---------------------------------------------

- After we create the ```Application``` and render the components we can clear the components because the components is going to be live in the ```app``` variable which is the type of the ```gradio.block.Blocks``` class and in the ```Application``` class. We can check that with the ```app.blocks``` dictionary variable. So let's implement our ```clear``` function:

```python
    # other LayoutBase implementations

    def clear(self) -> None:
        self.global_children_dict.clear()

        for renderable in self.renderables:
            if isinstance(renderable, LayoutBase):
                renderable.clear()

        self.renderables.clear()
```

- We choose the layouts from the renderables list variable and call the ```clear``` function of them. With this we can be sure that all the objects that stored are cleaned.

---------------------------------------------

- Now the last function we have to implement in the ```LayoutBase``` class is the ```attach_event``` function. The function is leaved as not implemented because it is more specific to class, so each class has to implement their ```attach_event``` function.

```python
    # other LayoutBase implementations

    def attach_event(self, block_dict: Dict[str, Block]) -> None:
        raise NotImplementedError
```

- You can see what is the ```block_dict``` variable in the ```_attach_event``` function which is implemented in the ```Application``` class.

---------------------------------------------

- With this function we finished coding the ```LayoutBase``` class.
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
