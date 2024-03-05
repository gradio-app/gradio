from __future__ import annotations

import inspect
import re
import types
import typing
from subprocess import PIPE, Popen


def find_first_non_return_key(some_dict):
    """Finds the first key in a dictionary that is not "return"."""
    for key, value in some_dict.items():
        if key != "return":
            return value
    return None


def format(code: str, type: str):
    """Formats code using ruff."""
    if type == "value":
        code = f"value = {code}"

    ruff_args = ["ruff", "format", "-", "--line-length=60"]

    process = Popen(
        ruff_args,
        stdin=PIPE,
        stdout=PIPE,
        stderr=PIPE,
        universal_newlines=True,
    )

    formatted_code, err = process.communicate(input=str(code))

    if type == "value":
        formatted_code = re.sub(
            r"^\s*value =\s*", "", formatted_code, flags=re.MULTILINE
        )

    stripped_source = re.search(r"^\s*\((.*)\)\s*$", formatted_code, re.DOTALL)

    if stripped_source:
        return stripped_source.group(1).strip()
    elif formatted_code.strip() == "":
        return code
    else:
        return formatted_code.strip()


def get_param_name(param):
    """Gets the name of a parameter."""

    if isinstance(param, str):
        return f'"{param}"'
    if inspect.isclass(param) and param.__module__ == "builtins":
        p = getattr(param, "__name__", None)
        if p is None and inspect.isclass(param):
            p = f"{param.__module__}.{param.__name__}"
        return p

    if inspect.isclass(param):
        return f"{param.__module__}.{param.__name__}"

    param_name = getattr(param, "__name__", None)

    if param_name is None:
        param_name = str(param)

    return param_name


def format_none(value):
    """Formats None and NonType values."""
    if value is None or value is type(None) or value == "None" or value == "NoneType":
        return "None"
    return value


def format_value(value):
    """Formats a value."""
    if value is None:
        return "None"
    if isinstance(value, str):
        return f'"{value}"'
    return str(value)


def get_parameter_docstring(docstring: str, parameter_name: str):
    """Gets the docstring for a parameter."""
    pattern = rf"\b{parameter_name}\b:[ \t]*(.*?)(?=\n|$)"

    match = re.search(pattern, docstring, flags=re.DOTALL)
    if match:
        return match.group(1).strip()

    return None


def get_return_docstring(docstring: str):
    """Gets the docstring for a return value."""
    pattern = r"\bReturn(?:s){0,1}\b:[ \t\n]*(.*?)(?=\n|$)"

    match = re.search(pattern, docstring, flags=re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()

    return None


def add_value(obj: dict, key: str, value: typing.Any):
    """Adds a value to a dictionary."""
    type = "value" if key == "default" else "type"

    obj[key] = format(value, type)

    return obj


def set_deep(dictionary: dict, keys: list[str], value: typing.Any):
    """Sets a value in a nested dictionary for a key path that may not exist"""
    for key in keys[:-1]:
        dictionary = dictionary.setdefault(key, {})
    dictionary[keys[-1]] = value


def get_deep(dictionary: dict, keys: list[str], default=None):
    """Gets a value from a nested dictionary without erroring if the key doesn't exist."""
    try:
        for key in keys:
            dictionary = dictionary[key]
        return dictionary
    except KeyError:
        return default


def get_type_arguments(type_hint) -> tuple:
    """Gets the type arguments for a type hint."""
    if hasattr(type_hint, "__args__"):
        return type_hint.__args__
    elif hasattr(type_hint, "__extra__"):
        return type_hint.__extra__.__args__
    else:
        return typing.get_args(type_hint)


def get_container_name(arg):
    """Gets a human readable name for a type."""

    # This is a bit of a hack to get the generic type for python 3.8
    typing_genericalias = getattr(typing, "_GenericAlias", None)
    types_genericalias = getattr(types, "GenericAlias", None)
    types_uniontype = getattr(types, "UnionType", None)
    if types_genericalias is None:
        raise ValueError(
            """Unable to find GenericAlias type. This is likely because you are using an older version of python. Please upgrade to python 3.10 or higher."""
        )

    generic_type_tuple = (
        (types_genericalias,)
        if typing_genericalias is None
        else (types_genericalias, typing_genericalias)
    )

    if inspect.isclass(arg):
        return arg.__name__
    if isinstance(arg, (generic_type_tuple)):
        return arg.__origin__.__name__
    elif types_uniontype and isinstance(arg, types_uniontype):
        return "Union"
    elif getattr(arg, "__origin__", None) is typing.Literal:
        return "Literal"

    else:
        return str(arg)


def format_type(_type: list[typing.Any]):
    """Pretty formats a possibly nested type hint."""

    s = []
    _current = None
    for t in _type:
        if isinstance(t, str):
            _current = format_none(t)
            continue

        elif isinstance(t, list):
            if len(t) == 0:
                continue
            s.append(f"{format_type(t)}")
        else:
            s.append(t)
    if len(s) == 0:
        return _current
    elif _current in ("Literal", "Union"):
        return "| ".join(s)
    else:
        return f"{_current}[{','.join(s)}]"


def get_type_hints(param, module):
    """Gets the type hints for a parameter."""

    def extract_args(
        arg,
        module_name_prefix,
        additional_interfaces,
        user_fn_refs: list[str],
        append=True,
        arg_of=None,
    ):
        """Recursively extracts the arguments from a type hint."""
        arg_names = []
        args = get_type_arguments(arg)

        # These are local classes that are used in types
        if inspect.isclass(arg) and arg.__module__.startswith(module_name_prefix):
            # get sourcecode for the class

            source_code = inspect.getsource(arg)
            source_code = format(
                re.sub(r"(\"\"\".*?\"\"\")", "", source_code, flags=re.DOTALL), "other"
            )

            if arg_of is not None:
                refs = get_deep(additional_interfaces, [arg_of, "refs"])

                if refs is None:
                    refs = [arg.__name__]
                elif isinstance(refs, list) and arg.__name__ not in refs:
                    refs.append(arg.__name__)

                set_deep(additional_interfaces, [arg_of, "refs"], refs)

            if get_deep(additional_interfaces, [arg.__name__, "source"]) is None:
                set_deep(additional_interfaces, [arg.__name__, "source"], source_code)

            for field_type in typing.get_type_hints(arg).values():
                # We want to recursively extract the source code for the fields but we don't want to add them to the list of arguments
                new_args = extract_args(
                    field_type,
                    module_name_prefix,
                    additional_interfaces,
                    user_fn_refs,
                    False,
                    arg.__name__,
                )

                if len(new_args) > 0:
                    arg_names.append(new_args)

            if append:
                arg_names.append(arg.__name__)
                if arg.__name__ not in user_fn_refs:
                    user_fn_refs.append(arg.__name__)
        elif len(args) > 0:
            if append:
                arg_names.append(get_container_name(arg))
            for inner_arg in list(args):
                new_args = extract_args(
                    inner_arg,
                    module_name_prefix,
                    additional_interfaces,
                    user_fn_refs,
                    append,
                    arg_of,
                )

                if len(new_args) > 0:
                    arg_names.append(new_args)
        else:  # noqa: PLR5501
            if append:
                arg_names.append(get_param_name(arg))
        return arg_names

    module_name_prefix = module.__name__ + "."
    additional_interfaces = {}
    user_fn_refs = []

    args = extract_args(
        param,
        module_name_prefix,
        additional_interfaces,
        user_fn_refs,
        True,
    )

    formatted_type = format_type(args)

    return (formatted_type, additional_interfaces, user_fn_refs)


def extract_docstrings(module):
    docs = {}
    global_type_mode = "complex"
    for name, obj in inspect.getmembers(module):
        # filter out the builtins etc
        if name.startswith("_"):
            continue
        #  this could be expanded but i think is ok for now
        if inspect.isfunction(obj) or inspect.isclass(obj):
            docs[name] = {}

            main_docstring = inspect.getdoc(obj) or ""
            cleaned_docstring = str.join(
                "\n",
                [s for s in main_docstring.split("\n") if not re.match(r"^\S+:", s)],
            )

            docs[name]["description"] = cleaned_docstring
            docs[name]["members"] = {}
            docs["__meta__"] = {"additional_interfaces": {}}
            for member_name, member in inspect.getmembers(obj):
                if inspect.ismethod(member) or inspect.isfunction(member):
                    # we are are only interested in these methods
                    if member_name not in ("__init__", "preprocess", "postprocess"):
                        continue

                    docs[name]["members"][member_name] = {}

                    member_docstring = inspect.getdoc(member) or ""
                    type_mode = "complex"
                    try:
                        hints = typing.get_type_hints(member)
                    except Exception:
                        type_mode = "simple"
                        hints = member.__annotations__
                        global_type_mode = "simple"

                    signature = inspect.signature(member)

                    #  we iterate over the parameters and get the type information
                    for param_name, param in hints.items():
                        if (
                            param_name == "return" and member_name == "postprocess"
                        ) or (param_name != "return" and member_name == "preprocess"):
                            continue

                        if type_mode == "simple":
                            arg_names = hints.get(param_name, "")
                            additional_interfaces = {}
                            user_fn_refs = []
                        else:
                            (
                                arg_names,
                                additional_interfaces,
                                user_fn_refs,
                            ) = get_type_hints(param, module)

                        #  These interfaces belong to the whole module, so we add them 'globally' for later
                        docs["__meta__"]["additional_interfaces"].update(
                            additional_interfaces
                        )

                        docs[name]["members"][member_name][param_name] = {}

                        if param_name == "return":
                            docstring = get_return_docstring(member_docstring)
                        else:
                            docstring = get_parameter_docstring(
                                member_docstring, param_name
                            )

                        add_value(
                            docs[name]["members"][member_name][param_name],
                            "type",
                            arg_names,
                        )

                        if signature.parameters.get(param_name, None) is not None:
                            default_value = signature.parameters[param_name].default
                            if default_value is not inspect._empty:
                                add_value(
                                    docs[name]["members"][member_name][param_name],
                                    "default",
                                    format_value(default_value),
                                )

                        docs[name]["members"][member_name][param_name][
                            "description"
                        ] = docstring

                        # We just want to normalise the arg name to 'value' for the preprocess and postprocess methods
                        if member_name in ("postprocess", "preprocess"):
                            docs[name]["members"][member_name][
                                "value"
                            ] = find_first_non_return_key(
                                docs[name]["members"][member_name]
                            )
                            additional_refs = get_deep(
                                docs, ["__meta__", "user_fn_refs", name]
                            )
                            if additional_refs is None:
                                set_deep(
                                    docs,
                                    ["__meta__", "user_fn_refs", name],
                                    set(user_fn_refs),
                                )
                            else:
                                additional_refs = set(additional_refs)
                                additional_refs.update(user_fn_refs)
                                set_deep(
                                    docs,
                                    ["__meta__", "user_fn_refs", name],
                                    additional_refs,
                                )
                if member_name == "EVENTS":
                    docs[name]["events"] = {}
                    if isinstance(member, list):
                        for event in member:
                            docs[name]["events"][str(event)] = {
                                "type": None,
                                "default": None,
                                "description": event.doc.replace(
                                    "{{ component }}", name
                                ),
                            }
        final_user_fn_refs = get_deep(docs, ["__meta__", "user_fn_refs", name])
        if final_user_fn_refs is not None:
            set_deep(docs, ["__meta__", "user_fn_refs", name], list(final_user_fn_refs))

    return (docs, global_type_mode)


class AdditionalInterface(typing.TypedDict):
    refs: list[str]
    source: str


def make_js(
    interfaces: dict[str, AdditionalInterface] | None = None,
    user_fn_refs: dict[str, list[str]] | None = None,
):
    """Makes the javascript code for the additional interfaces."""
    js_obj_interfaces = "{"
    if interfaces is not None:
        for interface_name, interface in interfaces.items():
            js_obj_interfaces += f"""
            {interface_name}: {interface.get("refs", None) or "[]"}, """
    js_obj_interfaces += "}"

    js_obj_user_fn_refs = "{"
    if user_fn_refs is not None:
        for class_name, refs in user_fn_refs.items():
            js_obj_user_fn_refs += f"""
          {class_name}: {refs}, """

    js_obj_user_fn_refs += "}"

    return rf"""function() {{
    const refs = {js_obj_interfaces};
    const user_fn_refs = {js_obj_user_fn_refs};
    requestAnimationFrame(() => {{

        Object.entries(user_fn_refs).forEach(([key, refs]) => {{
            if (refs.length > 0) {{
                const el = document.querySelector(`.${{key}}-user-fn`);
                if (!el) return;
                refs.forEach(ref => {{
                    el.innerHTML = el.innerHTML.replace(
                        new RegExp("\\b"+ref+"\\b", "g"),
                        `<a href="#h-${{ref.toLowerCase()}}">${{ref}}</a>`
                    );
                }})
            }}
        }})

        Object.entries(refs).forEach(([key, refs]) => {{
            if (refs.length > 0) {{
                const el = document.querySelector(`.${{key}}`);
                if (!el) return;
                refs.forEach(ref => {{
                    el.innerHTML = el.innerHTML.replace(
                        new RegExp("\\b"+ref+"\\b", "g"),
                        `<a href="#h-${{ref.toLowerCase()}}">${{ref}}</a>`
                    );
                }})
            }}
        }})
    }})
}}
"""


def render_additional_interfaces(interfaces):
    """Renders additional helper classes or types that were extracted earlier."""

    source = ""
    for interface_name, interface in interfaces.items():
        source += f"""
    code_{interface_name} = gr.Markdown(\"\"\"
## `{interface_name}`
```python
{interface["source"]}
```\"\"\", elem_classes=["md-custom", "{interface_name}"], header_links=True)
"""
    return source


def render_additional_interfaces_markdown(interfaces):
    """Renders additional helper classes or types that were extracted earlier."""

    source = ""
    for interface_name, interface in interfaces.items():
        source += f"""
## `{interface_name}`
```python
{interface["source"]}
```
"""
    return source


def render_version_badge(pypi_exists, local_version, name):
    """Renders a version badge for the package. PyPi badge if it exists, otherwise a static badge."""
    if pypi_exists:
        return f"""<a href="https://pypi.org/project/{name}/" target="_blank"><img alt="PyPI - Version" src="https://img.shields.io/pypi/v/{name}"></a>"""
    else:
        return f"""<img alt="Static Badge" src="https://img.shields.io/badge/version%20-%20{local_version}%20-%20orange">"""


def render_github_badge(repo):
    """Renders a github badge for the package if a repo is specified."""
    if repo is None:
        return ""
    else:
        return f"""<a href="{repo}/issues" target="_blank"><img alt="Static Badge" src="https://img.shields.io/badge/Issues-white?logo=github&logoColor=black"></a>"""


def render_discuss_badge(space):
    """Renders a discuss badge for the package if a space is specified."""
    if space is None:
        return ""
    else:
        return f"""<a href="{space}/discussions" target="_blank"><img alt="Static Badge" src="https://img.shields.io/badge/%F0%9F%A4%97%20Discuss-%23097EFF?style=flat&logoColor=black"></a>"""


def render_class_events(events: dict, name):
    """Renders the events for a class."""
    if len(events) == 0:
        return ""

    else:
        return f"""
    gr.Markdown("### Events")
    gr.ParamViewer(value=_docs["{name}"]["events"], linkify={["Event"]})

"""


def make_user_fn(
    class_name,
    user_fn_input_type,
    user_fn_input_description,
    user_fn_output_type,
    user_fn_output_description,
):
    """Makes the user function for the class."""
    if (
        user_fn_input_type is None
        and user_fn_output_type is None
        and user_fn_input_description is None
        and user_fn_output_description is None
    ):
        return ""

    md = """
    gr.Markdown(\"\"\"

### User function

The impact on the users predict function varies depending on whether the component is used as an input or output for an event (or both).

- When used as an Input, the component only impacts the input signature of the user function.
- When used as an output, the component only impacts the return signature of the user function.

The code snippet below is accurate in cases where the component is used as both an input and an output.

"""

    md += (
        f"- **As input:** Is passed, {format_description(user_fn_input_description)}\n"
        if user_fn_input_description
        else ""
    )

    md += (
        f"- **As output:** Should return, {format_description(user_fn_output_description)}"
        if user_fn_output_description
        else ""
    )

    if user_fn_input_type is not None or user_fn_output_type is not None:
        md += f"""

 ```python
def predict(
    value: {user_fn_input_type or "Unknown"}
) -> {user_fn_output_type or "Unknown"}:
    return value
```"""
    return f"""{md}
\"\"\", elem_classes=["md-custom", "{class_name}-user-fn"], header_links=True)
"""


def format_description(description):
    description = description[0].lower() + description[1:]
    description = description.rstrip(".") + "."
    return description


def make_user_fn_markdown(
    user_fn_input_type,
    user_fn_input_description,
    user_fn_output_type,
    user_fn_output_description,
):
    """Makes the user function for the class."""
    if (
        user_fn_input_type is None
        and user_fn_output_type is None
        and user_fn_input_description is None
        and user_fn_output_description is None
    ):
        return ""

    md = """
### User function

The impact on the users predict function varies depending on whether the component is used as an input or output for an event (or both).

- When used as an Input, the component only impacts the input signature of the user function.
- When used as an output, the component only impacts the return signature of the user function.

The code snippet below is accurate in cases where the component is used as both an input and an output.

"""

    md += (
        f"- **As output:** Is passed, {format_description(user_fn_input_description)}\n"
        if user_fn_input_description
        else ""
    )

    md += (
        f"- **As input:** Should return, {format_description(user_fn_output_description)}"
        if user_fn_output_description
        else ""
    )

    if user_fn_input_type is not None or user_fn_output_type is not None:
        md += f"""

 ```python
 def predict(
     value: {user_fn_input_type or "Unknown"}
 ) -> {user_fn_output_type or "Unknown"}:
     return value
 ```
 """
    return md


def render_class_events_markdown(events):
    """Renders the events for a class."""
    if len(events) == 0:
        return ""

    event_table = """
### Events

| name | description |
|:-----|:------------|
"""

    for event_name, event in events.items():
        event_table += f"| `{event_name}` | {event['description']} |\n"

    return event_table


def render_class_docs(exports, docs):
    """Renders the class documentation for the package."""
    docs_classes = ""
    for class_name in exports:
        user_fn_input_type = get_deep(
            docs, [class_name, "members", "preprocess", "return", "type"]
        )
        user_fn_input_description = get_deep(
            docs, [class_name, "members", "preprocess", "return", "description"]
        )
        user_fn_output_type = get_deep(
            docs, [class_name, "members", "postprocess", "value", "type"]
        )
        user_fn_output_description = get_deep(
            docs, [class_name, "members", "postprocess", "value", "description"]
        )

        linkify = get_deep(docs, ["__meta__", "additional_interfaces"], {}) or {}

        docs_classes += f"""
    gr.Markdown(\"\"\"
## `{class_name}`

### Initialization
\"\"\", elem_classes=["md-custom"], header_links=True)

    gr.ParamViewer(value=_docs["{class_name}"]["members"]["__init__"], linkify={list(linkify.keys())})

{render_class_events(docs[class_name].get("events", None), class_name)}

{make_user_fn(
    class_name,
    user_fn_input_type,
    user_fn_input_description,
    user_fn_output_type,
    user_fn_output_description,
)}
"""
    return docs_classes


html = """
<table>
<thead>
<tr>
<th align="left">name</th>
<th align="left">type</th>
<th align="left">default</th>
<th align="left">description</th>
</tr>
</thead>
<tbody><tr>
<td align="left"><code>value</code></td>
<td align="left"><code>list[Parameter] | None</code></td>
<td align="left"><code>None</code></td>
<td align="left">A list of dictionaries with keys "type", "description", and "default" for each parameter.</td>
</tr>
</tbody></table>
"""


def render_param_table(params):
    """Renders the parameter table for the package."""
    table = """<table>
<thead>
<tr>
<th align="left">name</th>
<th align="left" style="width: 25%;">type</th>
<th align="left">default</th>
<th align="left">description</th>
</tr>
</thead>
<tbody>"""

    # for class_name in exports:
    #     docs_classes += f"""
    #     """
    for param_name, param in params.items():
        table += f"""
<tr>
<td align="left"><code>{param_name}</code></td>
<td align="left" style="width: 25%;">

```python
{param["type"]}
```

</td>
<td align="left"><code>{param["default"]}</code></td>
<td align="left">{param['description']}</td>
</tr>
"""
    return table + "</tbody></table>"


def render_class_docs_markdown(exports, docs):
    """Renders the class documentation for the package."""
    docs_classes = ""
    for class_name in exports:
        user_fn_input_type = get_deep(
            docs, [class_name, "members", "preprocess", "return", "type"]
        )
        user_fn_input_description = get_deep(
            docs, [class_name, "members", "preprocess", "return", "description"]
        )
        user_fn_output_type = get_deep(
            docs, [class_name, "members", "postprocess", "value", "type"]
        )
        user_fn_output_description = get_deep(
            docs, [class_name, "members", "postprocess", "value", "description"]
        )
        docs_classes += f"""
## `{class_name}`

### Initialization

{render_param_table(docs[class_name]["members"]["__init__"])}

{render_class_events_markdown(docs[class_name].get("events", None))}

{make_user_fn_markdown(
    user_fn_input_type,
    user_fn_input_description,
    user_fn_output_type,
    user_fn_output_description,
)}
"""
    return docs_classes


def make_space(
    docs: dict,
    name: str,
    description: str,
    local_version: str | None,
    demo: str,
    space: str | None,
    repo: str | None,
    pypi_exists: bool,
    suppress_demo_check: bool = False,
):
    filtered_keys = [key for key in docs if key != "__meta__"]

    if not suppress_demo_check and (
        demo.find("if __name__ == '__main__'") == -1
        and demo.find('if __name__ == "__main__"') == -1
    ):
        raise ValueError(
            """The demo must be launched using `if __name__ == '__main__'`, otherwise the docs page will not function correctly.

To fix this error, launch the demo inside of an if statement like this:

if __name__ == '__main__':
    demo.launch()

To ignore this error pass `--suppress-demo-check` to the docs command."""
        )
    demo = demo.replace('"""', '\\"\\"\\"')

    source = """
import gradio as gr
from app import demo as app
import os
"""

    docs_classes = render_class_docs(filtered_keys, docs)

    source += f"""
_docs = {docs}

abs_path = os.path.join(os.path.dirname(__file__), "css.css")

with gr.Blocks(
    css=abs_path,
    theme=gr.themes.Default(
        font_mono=[
            gr.themes.GoogleFont("Inconsolata"),
            "monospace",
        ],
    ),
) as demo:
    gr.Markdown(
\"\"\"
# `{name}`

<div style="display: flex; gap: 7px;">
{render_version_badge(pypi_exists, local_version, name)} {render_github_badge(repo)} {render_discuss_badge(space)}
</div>

{description}
\"\"\", elem_classes=["md-custom"], header_links=True)
    app.render()
    gr.Markdown(
\"\"\"
## Installation

```bash
pip install {name}
```

## Usage

```python
{demo}
```
\"\"\", elem_classes=["md-custom"], header_links=True)

{docs_classes}

{render_additional_interfaces(docs["__meta__"]["additional_interfaces"])}
    demo.load(None, js=r\"\"\"{make_js(get_deep(docs, ["__meta__", "additional_interfaces"]),get_deep( docs, ["__meta__", "user_fn_refs"]))}
\"\"\")

demo.launch()
"""

    return source


def make_markdown(
    docs, name, description, local_version, demo, space, repo, pypi_exists
):
    filtered_keys = [key for key in docs if key != "__meta__"]

    source = f"""
# `{name}`
{render_version_badge(pypi_exists, local_version, name)} {render_github_badge(repo)} {render_discuss_badge(space)}

{description}

## Installation

```bash
pip install {name}
```

## Usage

```python
{demo}
```
"""

    docs_classes = render_class_docs_markdown(filtered_keys, docs)

    source += docs_classes

    source += render_additional_interfaces_markdown(
        docs["__meta__"]["additional_interfaces"]
    )

    return source
