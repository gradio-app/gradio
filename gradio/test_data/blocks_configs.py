XRAY_CONFIG = {
    "mode": "blocks",
    "components": [
        {
            "id": 1,
            "type": "markdown",
            "props": {
                "default_value": "<h1>Detect Disease From Scan</h1>\n<p>With this model you can lorem ipsum</p>\n<ul>\n<li>ipsum 1</li>\n<li>ipsum 2</li>\n</ul>\n",
                "name": "markdown",
                "label": None,
                "css": {},
                "interactive": None,
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
                "interactive": None,
            },
        },
        {"id": 3, "type": "tabs", "props": {"css": {}, "default_value": True}},
        {
            "id": 4,
            "type": "tabitem",
            "props": {"label": "X-ray", "css": {}, "default_value": True},
        },
        {
            "id": 5,
            "type": "row",
            "props": {"type": "row", "css": {}, "default_value": True},
        },
        {
            "id": 6,
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
                "interactive": None,
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 8,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {"background-color": "red", "--hover-color": "orange"},
                "interactive": None,
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {"label": "CT Scan", "css": {}, "default_value": True},
        },
        {
            "id": 10,
            "type": "row",
            "props": {"type": "row", "css": {}, "default_value": True},
        },
        {
            "id": 11,
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
                "interactive": None,
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 14,
            "type": "textbox",
            "props": {
                "lines": 1,
                "max_lines": 20,
                "placeholder": None,
                "default_value": "",
                "name": "textbox",
                "label": None,
                "css": {},
                "interactive": None,
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
                        "id": 4,
                        "children": [
                            {"id": 5, "children": [{"id": 6}, {"id": 7}]},
                            {"id": 8},
                        ],
                    },
                    {
                        "id": 9,
                        "children": [
                            {"id": 10, "children": [{"id": 11}, {"id": 12}]},
                            {"id": 13},
                        ],
                    },
                ],
            },
            {"id": 14},
        ],
    },
    "dependencies": [
        {
            "targets": [8],
            "trigger": "click",
            "inputs": [2, 6],
            "outputs": [7],
            "status_tracker": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [2, 11],
            "outputs": [12],
            "status_tracker": None,
        },
        {
            "targets": [],
            "trigger": "load",
            "inputs": [],
            "outputs": [14],
            "status_tracker": None,
        },
    ],
}

XRAY_CONFIG_DIFF_IDS = {
    "mode": "blocks",
    "components": [
        {
            "id": 1,
            "type": "markdown",
            "props": {
                "default_value": "<h1>Detect Disease From Scan</h1>\n<p>With this model you can lorem ipsum</p>\n<ul>\n<li>ipsum 1</li>\n<li>ipsum 2</li>\n</ul>\n",
                "name": "markdown",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 22,
            "type": "checkboxgroup",
            "props": {
                "choices": ["Covid", "Malaria", "Lung Cancer"],
                "default_value": [],
                "name": "checkboxgroup",
                "label": "Disease to Scan For",
                "css": {},
                "interactive": None,
            },
        },
        {"id": 3, "type": "tabs", "props": {"css": {}, "default_value": True}},
        {
            "id": 444,
            "type": "tabitem",
            "props": {"label": "X-ray", "css": {}, "default_value": True},
        },
        {
            "id": 5,
            "type": "row",
            "props": {"type": "row", "css": {}, "default_value": True},
        },
        {
            "id": 6,
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
                "interactive": None,
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 8888,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {"background-color": "red", "--hover-color": "orange"},
                "interactive": None,
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {"label": "CT Scan", "css": {}, "default_value": True},
        },
        {
            "id": 10,
            "type": "row",
            "props": {"type": "row", "css": {}, "default_value": True},
        },
        {
            "id": 11,
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
                "interactive": None,
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 141,
            "type": "textbox",
            "props": {
                "lines": 1,
                "placeholder": None,
                "default_value": "",
                "name": "textbox",
                "max_lines": 20,
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
    ],
    "theme": "default",
    "layout": {
        "id": 0,
        "children": [
            {"id": 1},
            {"id": 22},
            {
                "id": 3,
                "children": [
                    {
                        "id": 444,
                        "children": [
                            {"id": 5, "children": [{"id": 6}, {"id": 7}]},
                            {"id": 8888},
                        ],
                    },
                    {
                        "id": 9,
                        "children": [
                            {"id": 10, "children": [{"id": 11}, {"id": 12}]},
                            {"id": 13},
                        ],
                    },
                ],
            },
            {"id": 141},
        ],
    },
    "dependencies": [
        {
            "targets": [8888],
            "trigger": "click",
            "inputs": [22, 6],
            "outputs": [7],
            "status_tracker": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [22, 11],
            "outputs": [12],
            "status_tracker": None,
        },
    ],
}

XRAY_CONFIG_WITH_MISTAKE = {
    "mode": "blocks",
    "components": [
        {
            "id": 1,
            "type": "markdown",
            "props": {
                "default_value": "<h1>Detect Disease From Scan</h1>\n<p>With this model you can lorem ipsum</p>\n<ul>\n<li>ipsum 1</li>\n<li>ipsum 2</li>\n</ul>\n",
                "name": "markdown",
                "label": None,
                "css": {},
                "interactive": None,
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
                "interactive": None,
            },
        },
        {"id": 3, "type": "tabs", "props": {"css": {}, "default_value": True}},
        {
            "id": 4,
            "type": "tabitem",
            "props": {"label": "X-ray", "css": {}, "default_value": True},
        },
        {
            "id": 5,
            "type": "row",
            "props": {"type": "row", "css": {}, "default_value": True},
        },
        {
            "id": 6,
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
                "interactive": None,
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 8,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {"background-color": "red", "--hover-color": "orange"},
                "interactive": None,
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {"label": "CT Scan", "css": {}, "default_value": True},
        },
        {
            "id": 10,
            "type": "row",
            "props": {"type": "row", "css": {}, "default_value": True},
        },
        {
            "id": 11,
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
                "interactive": None,
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "label": None,
                "css": {},
                "interactive": None,
            },
        },
        {
            "id": 14,
            "type": "textbox",
            "props": {
                "lines": 1,
                "placeholder": None,
                "default_value": "",
                "name": "textbox",
                "label": None,
                "css": {},
                "interactive": None,
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
                        "id": 4,
                        "children": [
                            {"id": 5, "children": [{"id": 6}, {"id": 7}]},
                            {"id": 8},
                        ],
                    },
                    {
                        "id": 9,
                        "children": [
                            {"id": 10, "children": [{"id": 12}, {"id": 11}]},
                            {"id": 13},
                        ],
                    },
                ],
            },
            {"id": 14},
        ],
    },
    "dependencies": [
        {
            "targets": [8],
            "trigger": "click",
            "inputs": [2, 6],
            "outputs": [7],
            "status_tracker": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [2, 11],
            "outputs": [12],
            "status_tracker": None,
        },
    ],
}
