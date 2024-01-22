# Documenting Custom Components

In 4.15, a new `gradio cc docs` command was added to the gradio CLI, to generate rich documentation for your custom component. This command will generate documentation for users automatically but in order to get the most out of it, there are a few things you need to do.

## How do i use it?

The documentation will be generated when running `gradio cc build`. To disable this behaviour you can pass the `--no-generate-docs` argument.

There is also a standlaone `docs` command that allows for greater customisation. If you are running this command manually then it should be run _after_ the `version` in your `pyproject.toml` has been bumped but before building the component.

All arguments are optional.

```bash
gradio cc docs
  path # The directory of the custom component.
  --demo-dir # Path to the demo directory.
  --demo-name # Name of the demo file
  --space-url # URL of the Hugging Face Space to link to
  --generate-space # create a documentation space.
  --no-generate-space # do not create a documentation space
  --readme-path # Path to the README.md file.
  --generate-readme # create a REAMDE.md file
  --no-generate-readme # do not create a README.md file
  --suppress-demo-check # suppress validation checks and warnings
```

## What gets generated?

The `gradio cc docs` command will generate an interactive Gradio app and a static README file with a variety of features. You can see an example here:

- [Gradio app deployed on Hugging face Spaces]()
- [README.md rendered by GitHub]()

The README.md and space both have the following features:

- A description.
- Installation instructions.
- A fully functioning code snippet.
- Optional links to PyPi, GitHub, and Hugging Face Spaces.
- API documentation including:
  - An argument table for component initialisation showing types, defaults, and descriptions.
  - A description of how the component affects the user's predict function.
  - A table of events and their descriptions.
  - Any additional interfaces or classes that may be used during initialisation or in the pre- or post- processors.

Additionally, the Gradio includes:

- A live demo.
- A richer, interactive version of the argument tables.
- Nicer styling!

## What do I need to do?

The documentation generator uses existing standards to extract the necessary information, namely Type Hints and Docstrings. There are no Gradio specific APIs for documentation, following best practices will generally yield the best results.

If you already use type hints and docstrings in your component source code, you don't need to do much to benefit form this feature but there are some details that you should be aware of.

### Python version

In order to get the richest documentation experience, you need to use pythong `3.10` or greater when generating documentation. This is because some of the introspection features that we use to generate the documentation were only added in `3.10`.

### Type hints

Python type hints are used extensively to provide useful information for users. 

<details> 
<summary> What are type hints?</summary>


If you aren't familiar with type hints in python, they are a simple way to express what python types are expect for arguments and return values of functions and methods. They provide a helpful in-editor experience and aid in maintenance, as well as integrating with various other tools. These types can be simple primitives, like `list` `str` `bool`, they could be more compound types like `list[str]`, `str | None` or `tuples[str, float | int]`, of they can be more complex types using utility classed like [`TypedDict`](https://peps.python.org/pep-0589/#abstract).

[Read more about type hints in Python.](https://realpython.com/lessons/type-hinting/)


</details>

#### What do I need to add hints to?

You do not need to add type hints to every part of your code. In order for the documentation to work correctly, you will need to add type hints to the following component methods:

- `__init__` parameters should be typed.
- `postprocess` parameters and return value should be typed.
- `preprocess` parameters and return value should be typed.

If you are using `gradio cc create` then these types should already be provided but you may need to tweak them based on anay changes you make.

##### `__init__`

Here you only need to type the parameters. If you have cloned a temaplte with `gradio cc create` then these should already be in place. You will only need to add new hints for anything you have added or change:

```py
def __init__(
  self,
  value: str | Path | tuple[int, np.ndarray] | Callable | None = None,
  *,
  sources: list[Literal["upload", "microphone"]] | None = None,
  type: Literal["numpy", "filepath"] = "numpy",
  label: str | None = None,
  every: float | None = None,
  ...
):
  ...
```

##### `preprocess` and `postprocess`

The `preprocess` and `postprocess` methods determine the value that is passed to the user function and the value that needs to be returned.

Even if your component has primarily been designed as an input or an output, it is worth adding type hints to both the input parameters and the return values because Gradio has no way of limiting how components can be used.

In this case we specifically care about:

- The return type of `preprocess`.
- The input type of `postprocess`.

```py
def preprocess(
  self, payload: FileData | None # input is optional
) -> tuple[int, np.ndarray] | str | None:

# user function input  is the preprocess return ▲
# user function output is the postprocess input ▼

def postprocess(
  self, value: tuple[int, np.ndarray] | str | Path | bytes | None
) -> FileData | bytes | None: # return is optional
  ...
```

### Docstrings

Docstrings also used extensively to extract more meaningful, human-readable descriptions of certain parts of the API.

<details> 
<summary> What are docstrings?</summary>


If you aren't familiar with docstrings in Python, they are a way to annotate parts of your code with human-readble desciptions and explanations. They offer a rich in-editor experience like type hints but unlike type hints, they don't have any specific syntax requirements. They are simple strings and can take almost any form. The only requirement is where they appear. Docstrings should be "a string literal that occurs as the first statement in a module, function, class, or method definition".

[Read more about Python docstrings.](https://peps.python.org/pep-0257/#what-is-a-docstring)

</details>

While docstrings themselves don't have any syntax requirements, in order to make use of docstrings for documentation purposes we do need a certain structure.

As with typehint the specific information we care about is as follows:

- `__init__` parameter docstrings.
- `preprocess` return docstrings.
- `postprocess` input parameter docstrings.

Everything else is optional.

Doctrings should always take this format in order to be picked up by the documentation generator:

#### Classes

```py
"""
A description of the class.

This can span multiple lines and can _contain_ *markdown*.
"""
```

#### Methods and functions 

Any markdown in these descriptions will not be converted into formatted text.

```py
"""
Parameters:
    param_one: A description for this parameter.
    param_two: A description for this parameter.
Returns:
    A description for this return value.
"""
```

### Events

In custom components, events are expressed as a list stored on the `events` field of the component class. While we do not need types for events, we _do_ need a human-readbale description so users can understand the behaviour of the event.

In order to facilitate this, we have to create the event in a specific way.

There are two way to add events to a custom component.

#### Built-in events

Gradio comes with a variety of built-in event that may be enough for your component. If you are using built-in events, you do not need to do anything as they already have descriptions we can extract:

```py
from gradio.events import Events

class ParamViewer(Component):
  ...

  EVENTS = [
    Events.change,
    Events.upload,
  ]
```

#### Custom events

If the built-in events are not apprioriate for your use-case, then you can define a custom event. This is a straightforward process but it is important that you create the event in this way in order for docstrings to work correctly:

```py
from gradio.events import Events, EventListener

class ParamViewer(Component):
  ...

  EVENTS = [
    Events.change,
    EventListener(
        "bingbong",
        doc="This listener is triggered when the user does a bingbong."
      )
  ]
```

### Demo

Both the live demo and the code snippet are pulled in from `demo/app.py` which is usually used while developing the component. The only strict rule here is that the `demo.launch()` command must be contained with a `__name__ == "__main__"` conditional as below:

```py
if __name__ == "__main__":
  demo.launch()
```

The documentation generator will scan for such a clause and error if it is not present. If you are _not_ launching the demo inside of the `demo/app.py` then you can pass `--suppress-demo-check` to disable this check.

#### Demo recommendations

Although there are no additional rules, there are some best practices you should bear in mind in order to get the best experience from the documentation generator.

These are only guidelines and every situation is unique, but they are good principles to keep in mind.

##### Keep the demo compact

Compact demos look better and make it easier for users to understand what the demo does. Try to remove as many extraneous UI elements as possible in order to focus the users attention on the core use-case. 

In certain cases, it might make sense to have a `demo/app.py` just for the docs and an additional more complex app for your own testing purposes. You can also create additional spaces, showcasing more complex, examples and link to them from the main class docstring or from the `pyproject.toml` description.

#### Keep the code concise

The demo code is used as the example 'getting started' snippet. Keep the code as short as possible in order to keep users engaged and avoid confusion.

It isn't the job of the sample snippet to demonstrate the whole API, this snippet should be the shortest path to success for a new user. It should be easy to type or copy paste and easy to understand. Explanatory comment should be short and to the point.

#### Avoid external dependencies

As mentioned above, users should be able to copy-paste a snippet and have a fully-working app. Try to avoid third-party library dependencies in order to facilitate this.

Examples should be carefully considered, avoiding examples that require additional files or make assumptions about the environment is generally a good idea.

#### Ensure the `demo` directory is self contained

In certain instances only the `demo` directory will be uploaded to Hugging Face spaces, as the component will be installed via PyPi if possible. It is important that this directory is self contained and any files needed for the correct running of the demo are present.

### Additional URLS

The documentation generator will generator a few buttons, providing useful information a links to users. In some cases they are generated automatically but some are pulled from the components `pyproject.toml`. 

- PyPi Version and link - This is generated automatically.
- GitHub Repository - This is populated via the `pyproject.toml`'s `project.urls.repository`.
- Hugging Face Space - This is populated via the `pyproject.toml`'s `project.urls.space`.

An example `pyproject.toml` urls section might look like this:

```toml
[project.urls]
repository = "https://github.com/user/repo-name"
space = "https://huggingface.co/spaces/user/space-name"
```