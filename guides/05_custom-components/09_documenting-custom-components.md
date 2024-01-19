# Documenting Custom Components

In 4.15, a new `gradio cc docs` command was added to the gradio CLI, to generate rich documentation for your custom component. This command will generate documentation for users automatically but in order to get the most out of it, there are a few things you need to do.

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