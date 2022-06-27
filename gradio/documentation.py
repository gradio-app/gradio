import inspect

classes_to_document = {}
gl = {"mode": None}


def document_mode(m):
    gl["mode"] = m
    if m not in classes_to_document:
        classes_to_document[m] = []


def document(*fns):
    def inner_doc(cls):
        classes_to_document[gl["mode"]].append((cls, fns))
        return cls

    return inner_doc


def document_fn(fn):
    doc_str = inspect.getdoc(fn)
    doc_lines = doc_str.split("\n")
    signature = inspect.signature(fn)
    parameters, returns = {}, []
    mode = None
    for line in doc_lines:
        line = line.strip()
        if line == "Parameters:":
            mode = "parameter"
        elif line == "Returns:":
            mode = "return"
        else:
            if mode == "parameter":
                colon_index = line.index(": ")
                parameter = line[:colon_index]
                parameter_doc = line[colon_index + 2 :]
                parameters[parameter] = parameter_doc
            elif mode == "return":
                returns.append(line)
    parameter_docs = []
    for param_name, param in signature.parameters.items():
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
        raise ValueError("Does not support multiple returns yet.")
    return parameter_docs, return_docs

def document_cls(cls):
    doc_str = inspect.getdoc(cls)
    if doc_str is None:
        return "", {}
    tags = {}
    description_lines = []
    for line in doc_str.split("\n"):
        if line.split(" ")[0].endswith(":"):
            tag = line[:line.index(":")].lower()
            value = line[line.index(":") + 2:]
            tags[tag] = value
        else:
            description_lines.append(line)
    description = " ".join(description_lines).replace("\n", "<br>")
    return description, tags

def generate_documentation():
    documentation = {}
    for mode, class_list in classes_to_document.items():
        documentation[mode] = []
        for cls, _ in class_list:
            parameter_doc, return_doc = document_fn(cls.__init__)
            cls_description, cls_tags = document_cls(cls)
            documentation[mode].append(
                {
                    "class": cls,
                    "name": cls.__name__,
                    "description": cls_description,
                    "tags": cls_tags,
                    "parameters": parameter_doc,
                    "returns": return_doc,
                }
            )
    return documentation
