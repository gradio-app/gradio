import json
from gradio.mockup import MockupParser

# Test the exact same ASCII art from the failing test
ascii_art = """
[textbox] "Title"
[row]
[textbox:3] "Description"
[column]
[slider] "Priority" min=1 max=5
[checkbox] "Urgent"
[button] "Create Task"
"""

print("ASCII art:")
print(repr(ascii_art))

# Parse and print result
parsed = MockupParser.parse(ascii_art)
print("\nParsed result:")
print(json.dumps(parsed, indent=2))

# Expected result from the test
expected = {
    "layout": [
        {"type": "textbox", "label": "Title", "lines": 1},
        {
            "type": "row", 
            "elements": [
                {"type": "textbox", "label": "Description", "lines": 3},
                {
                    "type": "column",
                    "elements": [
                        {"type": "slider", "label": "Priority", "min": 1, "max": 5},
                        {"type": "checkbox", "label": "Urgent"}
                    ]
                }
            ]
        },
        {"type": "button", "label": "Create Task"}
    ]
}

print("\nExpected result:")
print(json.dumps(expected, indent=2))

print("\nResult matches expected:", parsed == expected)
