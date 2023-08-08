import ast
import os
import re


def get_param_descriptions(function_docs, functions):
    # Filter out any None values from function_docs
    function_docs = [doc for doc in function_docs if doc]

    if not function_docs:
        raise ValueError("No valid function documentation found.")

    arg_types = {}

    for docstring in function_docs:
        param_section = re.search(r"Parameters:(.*?)(?:\n\n|$)", docstring, re.DOTALL)
        if param_section:
            lines = param_section.group(1).strip().split("\n")
            for line in lines:
                if line.startswith("    "):
                    param, description = line.strip().split(": ", 1)
                    description = description.replace('"', r'\"')
                    arg_types[param] = description

    return arg_types

    # example output
    # {'variant': "'primary' for main call-to-action, 'secondary' for a more subdued style, 'stop' for a stop button.", 'size': 'Size of the button. Can be \\"sm\\" or \\"lg\\".', 'visible': 'If False, component will be hidden.', 'interactive': 'If False, the Button will be in a disabled state.', 'elem_id': 'An optional string that is assigned as the id of this component in the HTML DOM. Can be used for targeting CSS styles.', 'elem_classes': 'An optional list of strings that are assigned as the classes of this component in the HTML DOM. Can be used for targeting CSS styles.', 'scale': 'relative width compared to adjacent Components in a Row. For example, if Component A has scale=2, and Component B has scale=1, A will be twice as wide as B. Should be an integer.', 'min_width': 'minimum pixel width, will wrap if not sufficient screen space to satisfy this value. If a certain scale value results in this Component being narrower than min_width, the min_width parameter will be respected first.'}


def get_param_types(file_path):
    with open(file_path) as f:
        content = f.read()

    try:
        parsed_code = ast.parse(content)
    except SyntaxError:
        raise ValueError("Error parsing the Python code in the file.") from None

    button_class_definition = next((node for node in ast.walk(parsed_code) if isinstance(node, ast.ClassDef) and node.name == "Button"), None)

    if not button_class_definition:
        raise ValueError("Could not find the Button class definition.")
    
    button_constructor = next((node for node in ast.walk(button_class_definition) if isinstance(node, ast.FunctionDef) and node.name == "__init__"), None)

    if not button_constructor:
        raise ValueError("Could not find the Button constructor (__init__) definition.")

    args = {}

    for arg in button_constructor.args.args + button_constructor.args.kwonlyargs:
        arg_name = arg.arg
        if arg.annotation:
            arg_type = ast.get_source_segment(content, arg.annotation).strip()
            args[arg_name] = arg_type

    return args
    # example output
    # {'value': 'str | Callable', 'variant': 'Literal["primary", "secondary", "stop"]', 'size': 'Literal["sm", "lg"] | None', 'visible': 'bool', 'interactive': 'bool', 'elem_id': 'str | None', 'elem_classes': 'list[str] | str | None', 'scale': 'int | None', 'min_width': 'int | None'}


def extract_component_info(file_path):
    get_param_types(file_path)

    with open(file_path) as f:
        content = f.read()

    try:
        parsed_code = ast.parse(content)
    except SyntaxError:
        raise ValueError("Error parsing the Python code in the file.") from None

    class_definition = next((node for node in ast.walk(parsed_code) if isinstance(node, ast.ClassDef)), None)

    if not class_definition:
        raise ValueError("Could not find the component class definition.")

    docstring = ast.get_docstring(class_definition)
    if not docstring:
        raise ValueError("Could not find a docstring for the component.")

    component_name = class_definition.name

    tree = ast.parse(content)
    functions = [f for f in ast.walk(tree) if isinstance(f, ast.FunctionDef)]
    function_docs = [ast.get_docstring(f) for f in functions]

    args = get_param_descriptions(function_docs, functions)

    print(args)

    return component_name, args


def generate_svelte_story(component_name, args, existing_content=None):
    svelte_content = "<Meta\n"
    svelte_content += f'    title="Components/{component_name}"\n'
    svelte_content += f'    component={{{component_name}}}\n'
    svelte_content += "    argTypes={{\n"

    for arg_name, arg_description in args.items():
        svelte_content += f'    {arg_name}: {{description: "{arg_description}", name: "{arg_name}", }},\n'

    svelte_content += "  }}\n/>\n\n"

    if existing_content:
        meta_start = existing_content.find("<Meta")
        meta_end = existing_content.find("/>\n\n", meta_start)
        if meta_start != -1 and meta_end != -1:
            new_content = existing_content[:meta_start]
            new_content += svelte_content
            new_content += existing_content[meta_end + 4 :]
            return new_content

    new_content = existing_content + svelte_content if existing_content else svelte_content

    return new_content

if __name__ == "__main__":
    component_file_paths = [
        "gradio/components/button.py", # change to components with stories
    ]

    output_directory = "js/app/src/components/"
    os.makedirs(output_directory, exist_ok=True)

    for file_path in component_file_paths:
        component_name, args = extract_component_info(file_path)
        output_file_name = f"{component_name}/{component_name.capitalize()}.stories.svelte"
        output_file_path = os.path.join(output_directory, output_file_name)

        existing_content = None
        if os.path.exists(output_file_path):
            with open(output_file_path) as f:
                existing_content = f.read()

        svelte_content = generate_svelte_story(component_name, args, existing_content)

        with open(output_file_path, "w") as f:
            f.write(svelte_content)