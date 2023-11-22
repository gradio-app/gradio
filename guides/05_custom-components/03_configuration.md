# Configuring Your Custom Component

The custom components workflow focuses on [convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) to reduce the number of decisions you as a developer need to make when developing your custom component.
That being said, you can still configure some aspects of the custom component package and directory.
This guide will cover how.

## The Package Name

By default, all custom component packages are called `gradio_<component-name>` where `component-name` is the name of the component's python class in lowercase.

As an example, let's walkthrough changing the name of a component from `gradio_mytextbox` to `supertextbox`. 

1. Modify the `name` in the `pyproject.toml` file. 

```bash
[project]
name = "supertextbox"
```

2. Change all occurrences of `gradio_<component-name>` in `pyproject.toml` to `<component-name>`

```bash
[tool.hatch.build]
artifacts = ["/backend/supertextbox/templates", "*.pyi"]

[tool.hatch.build.targets.wheel]
packages = ["/backend/supertextbox"]
```

3. Rename the `gradio_<component-name>` directory in `backend/` to `<component-name>`

```bash
mv backend/gradio_mytextbox backend/supertextbox
```


Tip: Remember to change the import statement in `demo/app.py`!

## Top Level Python Exports

By default, only the custom component python class is a top level export. 
This means that when users type `from gradio_<component-name> import ...`, the only class that will be available is the custom component class.
To add more classes as top level exports, modify the `__all__` property in `__init__.py`

```python
from .mytextbox import MyTextbox
from .mytextbox import AdditionalClass, additional_function

__all__ = ['MyTextbox', 'AdditionalClass', 'additional_function']
```

## Python Dependencies

You can add python dependencies by modifying the `dependencies` key in `pyproject.toml`

```bash
dependencies = ["gradio", "numpy", "PIL"]
```


Tip: Remember to run `gradio cc install` when you add dependencies!

## Javascript Dependencies

You can add JavaScript dependencies by modifying the `"dependencies"` key in `frontend/package.json`

```json
"dependencies": {
    "@gradio/atoms": "0.2.0-beta.4",
    "@gradio/statustracker": "0.3.0-beta.6",
    "@gradio/utils": "0.2.0-beta.4",
    "your-npm-package": "<version>"
}
```

## Directory Structure

By default, the CLI will place the Python code in `backend` and the JavaScript code in `frontend`.
It is not recommended to change this structure since it makes it easy for a potential contributor to look at your source code and know where everything is.
However, if you did want to this is what you would have to do:

1. Place the Python code in the subdirectory of your choosing. Remember to modify the `[tool.hatch.build]` `[tool.hatch.build.targets.wheel]` in the `pyproject.toml` to match!

2. Place the JavaScript code in the subdirectory of your choosing.

2. Add the `FRONTEND_DIR` property on the component python class. It must be the relative path from the file where the class is defined to the location of the JavaScript directory.

```python
class SuperTextbox(Component):
    FRONTEND_DIR = "../../frontend/"
```

The JavaScript and Python directories must be under the same common directory!

## Conclusion


Sticking to the defaults will make it easy for others to understand and contribute to your custom component.
After all, the beauty of open source is that anyone can help improve your code!
But if you ever need to deviate from the defaults, you know how!