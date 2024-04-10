"""Contains methods that generate documentation for Gradio functions and classes."""

from __future__ import annotations

import inspect
import warnings
from collections import defaultdict
from functools import lru_cache
from typing import Callable

classes_to_document = defaultdict(list)
classes_inherit_documentation = {}


def set_documentation_group(m):  # noqa: ARG001
    """A no-op for backwards compatibility of custom components published prior to 4.16.0"""
    pass


def extract_instance_attr_doc(cls, attr):
    code = inspect.getsource(cls.__init__)
    lines = [line.strip() for line in code.split("\n")]
    i = None
    for i, line in enumerate(lines):  # noqa: B007
        if line.startswith("self." + attr + ":") or line.startswith(
            "self." + attr + " ="
        ):
            break
    if i is None:
        raise NameError(f"Could not find {attr} in {cls.__name__}")
    start_line = lines.index('"""', i)
    end_line = lines.index('"""', start_line + 1)
    for j in range(i + 1, start_line):
        if lines[j].startswith("self."):
            raise ValueError(
                f"Found another attribute before docstring for {attr} in {cls.__name__}: "
                + lines[j]
                + "\n start:"
                + lines[i]
            )
    doc_string = " ".join(lines[start_line + 1 : end_line])
    return doc_string


_module_prefixes = [
    ("gradio._simple_templates", "component"),
    ("gradio.block", "block"),
    ("gradio.chat", "chatinterface"),
    ("gradio.component", "component"),
    ("gradio.events", "helpers"),
    ("gradio.exceptions", "helpers"),
    ("gradio.external", "helpers"),
    ("gradio.flag", "flagging"),
    ("gradio.helpers", "helpers"),
    ("gradio.interface", "interface"),
    ("gradio.layout", "layout"),
    ("gradio.route", "routes"),
    ("gradio.theme", "themes"),
    ("gradio_client.", "py-client"),
    ("gradio.utils", "helpers"),
]


@lru_cache(maxsize=10)
def _get_module_documentation_group(modname) -> str:
    for prefix, group in _module_prefixes:
        if modname.startswith(prefix):
            return group
    raise ValueError(f"No known documentation group for module {modname!r}")


def document(*fns, inherit=False, documentation_group=None):
    """
    Defines the @document decorator which adds classes or functions to the Gradio
    documentation at www.gradio.app/docs.

    Usage examples:
    - Put @document() above a class to document the class and its constructor.
    - Put @document("fn1", "fn2") above a class to also document methods fn1 and fn2.
    - Put @document("*fn3") with an asterisk above a class to document the instance attribute methods f3.
    """
    _documentation_group = documentation_group

    def inner_doc(cls):
        functions = list(fns)
        if hasattr(cls, "EVENTS"):
            functions += cls.EVENTS
        if inherit:
            classes_inherit_documentation[cls] = None

        documentation_group = _documentation_group  # avoid `nonlocal` reassignment
        if _documentation_group is None:
            try:
                modname = inspect.getmodule(cls).__name__  # type: ignore
                if modname.startswith("gradio.") or modname.startswith(
                    "gradio_client."
                ):
                    documentation_group = _get_module_documentation_group(modname)
                else:
                    # Then this is likely a custom Gradio component that we do not include in the documentation
                    pass
            except Exception as exc:
                warnings.warn(f"Could not get documentation group for {cls}: {exc}")
        classes_to_document[documentation_group].append((cls, functions))
        return cls

    return inner_doc


def document_fn(fn: Callable, cls) -> tuple[str, list[dict], dict, str | None]:
    """
    Generates documentation for any function.
    Parameters:
        fn: Function to document
    Returns:
        description: General description of fn
        parameters: A list of dicts for each parameter, storing data for the parameter name, annotation and doc
        return: A dict storing data for the returned annotation and doc
        example: Code for an example use of the fn
    """
    doc_str = inspect.getdoc(fn) or ""
    doc_lines = doc_str.split("\n")
    signature = inspect.signature(fn)
    description, parameters, returns, examples = [], {}, [], []
    mode = "description"
    for line in doc_lines:
        line = line.rstrip()
        if line == "Parameters:":
            mode = "parameter"
        elif line.startswith("Example:"):
            mode = "example"
            if "(" in line and ")" in line:
                c = line.split("(")[1].split(")")[0]
                if c != cls.__name__:
                    mode = "ignore"
        elif line == "Returns:":
            mode = "return"
        else:
            if mode == "description":
                description.append(line if line.strip() else "<br>")
                continue
            if not (line.startswith("    ") or line.strip() == ""):
                print(line)
            if not (line.startswith("    ") or line.strip() == ""):
                raise SyntaxError(
                    f"Documentation format for {fn.__name__} has format error in line: {line}"
                )
            line = line[4:]
            if mode == "parameter":
                colon_index = line.index(": ")
                if colon_index < -1:
                    raise SyntaxError(
                        f"Documentation format for {fn.__name__} has format error in line: {line}"
                    )
                parameter = line[:colon_index]
                parameter_doc = line[colon_index + 2 :]
                parameters[parameter] = parameter_doc
            elif mode == "return":
                returns.append(line)
            elif mode == "example":
                examples.append(line)
    description_doc = " ".join(description)
    parameter_docs = []
    for param_name, param in signature.parameters.items():
        if param_name.startswith("_"):
            continue
        if param_name == "self":
            continue
        if param_name in ["kwargs", "args"] and param_name not in parameters:
            continue
        parameter_doc = {
            "name": param_name,
            "annotation": param.annotation,
            "doc": parameters.get(param_name),
        }
        if param_name in parameters:
            del parameters[param_name]
        if param.default != inspect.Parameter.empty:
            default = param.default
            if isinstance(default, str):
                default = '"' + default + '"'
            if default.__class__.__module__ != "builtins":
                default = f"{default.__class__.__name__}()"
            parameter_doc["default"] = default
        elif parameter_doc["doc"] is not None:
            if "kwargs" in parameter_doc["doc"]:
                parameter_doc["kwargs"] = True
            if "args" in parameter_doc["doc"]:
                parameter_doc["args"] = True
        parameter_docs.append(parameter_doc)
    if parameters:
        raise ValueError(
            f"Documentation format for {fn.__name__} documents "
            f"nonexistent parameters: {', '.join(parameters.keys())}. "
            f"Valid parameters: {', '.join(signature.parameters.keys())}"
        )
    if len(returns) == 0:
        return_docs = {}
    elif len(returns) == 1:
        return_docs = {"annotation": signature.return_annotation, "doc": returns[0]}
    else:
        return_docs = {}
        # raise ValueError("Does not support multiple returns yet.")
    examples_doc = "\n".join(examples) if len(examples) > 0 else None
    return description_doc, parameter_docs, return_docs, examples_doc


def document_cls(cls):
    doc_str = inspect.getdoc(cls)
    if doc_str is None:
        return "", {}, ""
    tags = {}
    description_lines = []
    mode = "description"
    for line in doc_str.split("\n"):
        line = line.rstrip()
        if line.endswith(":") and " " not in line:
            mode = line[:-1].lower()
            tags[mode] = []
        elif line.split(" ")[0].endswith(":") and not line.startswith("    "):
            tag = line[: line.index(":")].lower()
            value = line[line.index(":") + 2 :]
            tags[tag] = value
        elif mode == "description":
            description_lines.append(line if line.strip() else "<br>")
        else:
            if not (line.startswith("    ") or not line.strip()):
                raise SyntaxError(
                    f"Documentation format for {cls.__name__} has format error in line: {line}"
                )
            tags[mode].append(line[4:])
    if "example" in tags:
        example = "\n".join(tags["example"])
        del tags["example"]
    else:
        example = None
    for key, val in tags.items():
        if isinstance(val, list):
            tags[key] = "<br>".join(val)
    description = " ".join(description_lines).replace("\n", "<br>")
    return description, tags, example


def generate_documentation():
    documentation = {}
    for mode, class_list in classes_to_document.items():
        documentation[mode] = []
        for cls, fns in class_list:
            fn_to_document = cls if inspect.isfunction(cls) else cls.__init__
            _, parameter_doc, return_doc, _ = document_fn(fn_to_document, cls)
            if (
                hasattr(cls, "preprocess")
                and callable(cls.preprocess)  # type: ignore
                and hasattr(cls, "postprocess")
                and callable(cls.postprocess)  # type: ignore
            ):
                preprocess_doc = document_fn(cls.preprocess, cls)  # type: ignore
                postprocess_doc = document_fn(cls.postprocess, cls)  # type: ignore
                preprocess_doc, postprocess_doc = (
                    {
                        "parameter_doc": preprocess_doc[1],
                        "return_doc": preprocess_doc[2],
                    },
                    {
                        "parameter_doc": postprocess_doc[1],
                        "return_doc": postprocess_doc[2],
                    },
                )
            cls_description, cls_tags, cls_example = document_cls(cls)
            cls_documentation = {
                "class": cls,
                "name": cls.__name__,
                "description": cls_description,
                "tags": cls_tags,
                "parameters": parameter_doc,
                "returns": return_doc,
                "example": cls_example,
                "fns": [],
            }
            if (
                hasattr(cls, "preprocess")
                and callable(cls.preprocess)  # type: ignore
                and hasattr(cls, "postprocess")
                and callable(cls.postprocess)  # type: ignore
            ):
                cls_documentation["preprocess"] = preprocess_doc  # type: ignore
                cls_documentation["postprocess"] = postprocess_doc  # type: ignore
            for fn_name in fns:
                instance_attribute_fn = fn_name.startswith("*")
                if instance_attribute_fn:
                    fn_name = fn_name[1:]
                    # Instance attribute fns are classes
                    # whose __call__ method determines their behavior
                    fn = getattr(cls(), fn_name).__call__
                else:
                    fn = getattr(cls, fn_name)
                if not callable(fn):
                    description_doc = str(fn)
                    parameter_docs = {}
                    return_docs = {}
                    examples_doc = ""
                    override_signature = f"gr.{cls.__name__}.{fn_name}"
                else:
                    (
                        description_doc,
                        parameter_docs,
                        return_docs,
                        examples_doc,
                    ) = document_fn(fn, cls)
                    if fn_name in getattr(cls, "EVENTS", []):
                        parameter_docs = parameter_docs[1:]
                    override_signature = None
                if instance_attribute_fn:
                    description_doc = extract_instance_attr_doc(cls, fn_name)
                cls_documentation["fns"].append(
                    {
                        "fn": fn,
                        "name": fn_name,
                        "description": description_doc,
                        "tags": {},
                        "parameters": parameter_docs,
                        "returns": return_docs,
                        "example": examples_doc,
                        "override_signature": override_signature,
                    }
                )
            documentation[mode].append(cls_documentation)
            if cls in classes_inherit_documentation:
                classes_inherit_documentation[cls] = cls_documentation["fns"]
    for mode, class_list in classes_to_document.items():
        for i, (cls, _) in enumerate(class_list):
            for super_class in classes_inherit_documentation:
                if (
                    inspect.isclass(cls)
                    and issubclass(cls, super_class)
                    and cls != super_class
                ):
                    for inherited_fn in classes_inherit_documentation[super_class]:
                        inherited_fn = dict(inherited_fn)
                        try:
                            inherited_fn["description"] = extract_instance_attr_doc(
                                cls, inherited_fn["name"]
                            )
                        except ValueError:
                            pass
                        documentation[mode][i]["fns"].append(inherited_fn)
    return documentation
