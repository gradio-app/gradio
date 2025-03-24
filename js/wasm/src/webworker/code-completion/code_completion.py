import jedi


def get_code_completions(code: str, line: int, column: int):
    script = jedi.Script(code)
    completions = script.complete(line, column)
    serializable_completions = [
        {
            "label": completion.name,
            "type": completion.type,
            "docstring": completion.docstring(raw=True),
            "completion_prefix_length": completion.get_completion_prefix_length(),
        }
        for completion in completions
    ]
    return serializable_completions
