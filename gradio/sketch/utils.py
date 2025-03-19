import ast
import inspect
from collections.abc import Callable
from typing import Union

import huggingface_hub

code_model = "Qwen/Qwen2.5-Coder-32B-Instruct"


def is_number(s: str) -> bool:
    try:
        float(s)
        return True
    except ValueError:
        return False


def set_kwarg(obj: dict, key: str, value: str) -> None:
    if value == "":
        obj.pop(key, None)
    elif value.lower() in ("true", "false"):
        obj[key] = value.lower() == "true"
    elif is_number(value):
        obj[key] = float(value)
    elif (value.startswith("'") and value.endswith("'")) or (
        value.startswith('"') and value.endswith('"')
    ):
        obj[key] = value[1:-1]
    elif (value.startswith("[") and value.endswith("]")) or (
        value.startswith("{") and value.endswith("}")
    ):
        obj[key] = ast.literal_eval(value)
    else:
        obj[key] = value


def get_header(fn_name: str, inputs: list[str]):
    return f"def {fn_name}({', '.join(inputs)}):"


def ai(
    history: list[tuple[str, str]],
    hf_token: str,
    fn_name: str,
    inputs: list[tuple[str, type, dict]],
    output_types: list[tuple[type, dict]],
):
    full_prompt = f"""Create a python function with the following header:
`{get_header(fn_name, [i[0] for i in inputs])}`\n"""
    if len(inputs) > 0:
        if len(inputs) == 1:
            full_prompt += f"""The value of '{inputs[0][0]}' is passed as: {get_value_description(inputs[0][1], inputs[0][2])}.\n"""
        else:
            full_prompt += "The inputs are passed as follows:\n"
            for i in inputs:
                full_prompt += f"""- '{i[0]}' is passed as: {get_value_description(i[1], i[2])}.\n"""
    if len(output_types) > 0:
        if len(output_types) == 1:
            full_prompt += f"""The function should return a value as: {get_value_description(output_types[0][0], output_types[0][1])}.\n"""
        else:
            full_prompt += (
                "The function should return a tuple of the following values:\n"
            )
            for index, o in enumerate(output_types):
                full_prompt += f"""- index {index} should be: {get_value_description(o[0], o[1])}.\n"""
    full_prompt += (
        f"""The function should perform the following task: {history[0][0]}\n"""
    )
    full_prompt += "Return only the python code of the function in your response. Do not wrap the code in backticks or include any description before the response. Return ONLY the function code. Start your response with the header provided. Include any imports inside the function.\n"
    full_prompt += """If using an LLM would help with the task, use the huggingface_hub library. For example:
```python
import huggingface_hub
client = huggingface_hub.InferenceClient()

# For OpenAI style chat API
response = client.chat_completion([{"role": "user", "content": "What is 12*2320?"}], stream=False)
output = response.choices[0].message.content  # a string

# For text completion
output = client.text_generation("What is 12*2320?")  # a string

# For image generation
response = client.text_to_image("A picture of a cat")  # a PIL image
```
If an LLM is not helpful for the task, there is no need to use huggingface_hub. Avoid using other 3rd party libraries (other than numpy, pandas, pydub, pillow if useful) unless necessary.
"""

    prompt_history = [[full_prompt, history[0][1]]] + history[1:]
    chat_history = []

    for user_msg, bot_msg in prompt_history:
        chat_history.append({"role": "user", "content": user_msg})
        if bot_msg is not None:
            chat_history.append({"role": "assistant", "content": bot_msg})

    client = huggingface_hub.InferenceClient(token=hf_token)
    content = ""
    for token in client.chat_completion(chat_history, stream=True, model=code_model):
        content += token.choices[0].delta.content or ""
        if "```python\n" in content:
            start = content.index("```python\n") + len("```python\n")
            end = content.find("\n```", start)
            yield content[start:end] if end != -1 else content[start:]
        else:
            yield content


def get_value_description(component_class, config):
    component = component_class(render=False, **config)
    value_description = getattr(component, "_value_description", None)
    if value_description is not None:
        return value_description

    value_type_hint = extract_value_type_hint(component_class.__init__)
    all_hints = value_type_hint.split(" | ")
    if "None" in all_hints:
        all_hints.remove("None")
    if "Callable" in all_hints:
        all_hints.remove("Callable")
    return " | ".join(all_hints)


def extract_value_type_hint(func: Callable) -> str:
    sig = inspect.signature(func)

    if "value" in sig.parameters:
        param = sig.parameters["value"]
        if param.annotation is not inspect.Parameter.empty:
            if (
                hasattr(param.annotation, "__origin__")
                and param.annotation.__origin__ is Union
            ):
                return " | ".join(arg.__name__ for arg in param.annotation.__args__)
            elif hasattr(param.annotation, "__name__"):
                return param.annotation.__name__
            else:
                return str(param.annotation).replace("typing.", "")

    return "Any"
