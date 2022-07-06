import inspect

classes_to_document = {}
documentation_group = None


def set_documentation_group(m):
    global documentation_group
    documentation_group = m
    if m not in classes_to_document:
        classes_to_document[m] = []


def document(*fns):
    def inner_doc(cls):
        global documentation_group
        classes_to_document[documentation_group].append((cls, fns))
        return cls

    return inner_doc


def document_fn(fn):
    doc_str = inspect.getdoc(fn)
    doc_lines = doc_str.split("\n")
    signature = inspect.signature(fn)
    description, parameters, returns, examples = [], {}, [], []
    mode = "description"
    for line in doc_lines:
        if line == "Parameters:":
            mode = "parameter"
        elif line == "Example:":
            mode = "example"
        elif line == "Returns:":
            mode = "return"
        else:
            if mode == "description":
                description.append(line if line.strip() else "<br>")
                continue
            if line.startswith("    "):
                line = line[4:]
            if mode == "parameter":
                colon_index = line.index(": ")
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
        if param_name.startswith("_") or param_name == "kwargs":
            continue
        parameter_doc = {
            "name": param_name,
            "annotation": param.annotation,
            "kind": param.kind.description,
            "doc": parameters.get(param_name),
        }
        if param.default != inspect.Parameter.empty:
            default = param.default
            if type(default) == str:
                default = '"' + default + '"'
            parameter_doc["default"] = default
        parameter_docs.append(parameter_doc)
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
        return "", {}
    tags = {}
    description_lines = []
    mode = "description"
    for line in doc_str.split("\n"):
        if line.endswith(":") and " " not in line:
            mode = line[:-1].lower()
            tags[mode] = []
        elif line.split(" ")[0].endswith(":") and not line.startswith("    "):
            tag = line[: line.index(":")].lower()
            value = line[line.index(":") + 2 :]
            tags[tag] = value
        else:
            if mode == "description":
                description_lines.append(line if line.strip() else "<br>")
            else:
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
            _, parameter_doc, return_doc, _ = document_fn(cls.__init__)
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
            for fn_name in fns:
                fn = getattr(cls, fn_name)
                (
                    description_doc,
                    parameter_docs,
                    return_docs,
                    examples_doc,
                ) = document_fn(fn)
                cls_documentation["fns"].append(
                    {
                        "fn": fn,
                        "name": fn_name,
                        "description": description_doc,
                        "tags": {},
                        "parameters": parameter_docs,
                        "returns": return_docs,
                        "example": examples_doc,
                    }
                )
            documentation[mode].append(cls_documentation)
    return documentation
