XRAY_CONFIG = {
    "mode": "blocks",
    "components": [
        {
            "id": 1,
            "type": "markdown",
            "props": {
                "default_value": "<pre><code>        # Detect Disease From Scan\n        With this model you can lorem ipsum\n        - ipsum 1\n        - ipsum 2\n</code></pre>\n",
                "name": "markdown",
                "label": None,
                "css": {},
            },
        },
        {
            "id": 2,
            "type": "checkboxgroup",
            "props": {
                "choices": ["Covid", "Malaria", "Lung Cancer"],
                "default_value": [],
                "name": "checkboxgroup",
                "label": "Disease to Scan For",
                "css": {},
            },
        },
        {"id": 3, "type": "tabs", "props": {"css": {}}},
        {"id": 4, "type": "tabitem", "props": {"label": "X-ray", "css": {}}},
        {"id": 5, "type": "tabitem", "props": {"label": "X-ray", "css": {}}},
        {"id": 6, "type": "row", "props": {"type": "row", "css": {}}},
        {
            "id": 7,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "shape": None,
                "source": "upload",
                "tool": "editor",
                "default_value": None,
                "name": "image",
                "label": None,
                "css": {},
            },
        },
        {
            "id": 8,
            "type": "json",
            "props": {"default_value": '""', "name": "json", "label": None, "css": {}},
        },
        {
            "id": 9,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {"background-color": "red", "--hover-color": "orange"},
            },
        },
        {"id": 10, "type": "tabitem", "props": {"label": "CT Scan", "css": {}}},
        {"id": 11, "type": "tabitem", "props": {"label": "CT Scan", "css": {}}},
        {"id": 12, "type": "row", "props": {"type": "row", "css": {}}},
        {
            "id": 13,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "shape": None,
                "source": "upload",
                "tool": "editor",
                "default_value": None,
                "name": "image",
                "label": None,
                "css": {},
            },
        },
        {
            "id": 14,
            "type": "json",
            "props": {"default_value": '""', "name": "json", "label": None, "css": {}},
        },
        {
            "id": 15,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {},
            },
        },
        {
            "id": 16,
            "type": "textbox",
            "props": {
                "lines": 1,
                "placeholder": None,
                "default_value": "",
                "name": "textbox",
                "label": None,
                "css": {},
            },
        },
    ],
    "theme": "default",
    "layout": {
        "id": 0,
        "children": [
            {"id": 1},
            {"id": 2},
            {
                "id": 3,
                "children": [
                    {
                        "id": 5,
                        "children": [
                            {"id": 6, "children": [{"id": 7}, {"id": 8}]},
                            {"id": 9},
                        ],
                    },
                    {
                        "id": 5,
                        "children": [
                            {"id": 6, "children": [{"id": 7}, {"id": 8}]},
                            {"id": 9},
                        ],
                    },
                    {
                        "id": 11,
                        "children": [
                            {"id": 12, "children": [{"id": 13}, {"id": 14}]},
                            {"id": 15},
                        ],
                    },
                    {
                        "id": 11,
                        "children": [
                            {"id": 12, "children": [{"id": 13}, {"id": 14}]},
                            {"id": 15},
                        ],
                    },
                ],
            },
            {"id": 16},
        ],
    },
    "dependencies": [
        {"targets": [9], "trigger": "click", "inputs": [2, 7], "outputs": [8]},
        {"targets": [15], "trigger": "click", "inputs": [2, 13], "outputs": [14]},
    ],
}
