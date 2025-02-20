import ast


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
