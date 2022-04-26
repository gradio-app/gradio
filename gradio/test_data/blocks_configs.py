XRAY_CONFIG = {
    "mode": "blocks",
    "components": [
        {
            "id": 1,
            "type": "markdown",
            "props": {
                "default_value": "<h1>Detect Disease From Scan</h1>\n<p>With this model you can lorem ipsum</p>\n<ul>\n<li>ipsum 1</li>\n<li>ipsum 2</li>\n</ul>\n",
                "name": "markdown",
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
                "show_label": True,
                "label": "Disease to Scan For",
                "css": {},
            },
        },
        {"id": 3, "type": "tabs", "props": {"css": {}, "default_value": True}},
        {
            "id": 4,
            "type": "tabitem",
            "props": {
                "show_label": True,
                "label": "X-ray",
                "css": {},
                "default_value": True,
            },
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
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "css": {},
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "css": {},
            },
        },
        {
            "id": 8,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "css": {"background-color": "red", "--hover-color": "orange"},
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {
                "show_label": True,
                "label": "CT Scan",
                "css": {},
                "default_value": True,
            },
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
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "css": {},
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "css": {},
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "css": {},
            },
        },
        {
            "id": 14,
            "type": "textbox",
            "props": {
                "lines": 1,
                "max_lines": 20,
                "default_value": "",
                "name": "textbox",
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
            "queue": False,
            "status_tracker": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [2, 11],
            "outputs": [12],
            "queue": False,
            "status_tracker": None,
        },
        {
            "targets": [],
            "trigger": "load",
            "inputs": [],
            "outputs": [14],
            "queue": False,
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
                "css": {},
            },
        },
        {
            "id": 22,
            "type": "checkboxgroup",
            "props": {
                "choices": ["Covid", "Malaria", "Lung Cancer"],
                "default_value": [],
                "name": "checkboxgroup",
                "show_label": True,
                "label": "Disease to Scan For",
                "css": {},
            },
        },
        {"id": 3, "type": "tabs", "props": {"css": {}, "default_value": True}},
        {
            "id": 444,
            "type": "tabitem",
            "props": {
                "show_label": True,
                "label": "X-ray",
                "css": {},
                "default_value": True,
            },
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
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "css": {},
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "css": {},
            },
        },
        {
            "id": 8888,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "css": {"background-color": "red", "--hover-color": "orange"},
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {
                "show_label": True,
                "label": "CT Scan",
                "css": {},
                "default_value": True,
            },
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
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "css": {},
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "css": {},
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "css": {},
            },
        },
        {
            "id": 141,
            "type": "textbox",
            "props": {
                "lines": 1,
                "default_value": "",
                "name": "textbox",
                "max_lines": 20,
                "css": {},
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
            "queue": False,
            "status_tracker": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [22, 11],
            "outputs": [12],
            "queue": False,
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
                "show_label": True,
                "label": "Disease to Scan For",
                "css": {},
            },
        },
        {"id": 3, "type": "tabs", "props": {"css": {}, "default_value": True}},
        {
            "id": 4,
            "type": "tabitem",
            "props": {
                "show_label": True,
                "label": "X-ray",
                "css": {},
                "default_value": True,
            },
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
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "css": {},
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "css": {},
            },
        },
        {
            "id": 8,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "css": {"background-color": "red", "--hover-color": "orange"},
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {
                "show_label": True,
                "label": "CT Scan",
                "css": {},
                "default_value": True,
            },
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
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "css": {},
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "default_value": '""',
                "name": "json",
                "css": {},
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "default_value": "Run",
                "name": "button",
                "css": {},
            },
        },
        {
            "id": 14,
            "type": "textbox",
            "props": {
                "lines": 1,
                "default_value": "",
                "name": "textbox",
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
            "queue": False,
            "status_tracker": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [2, 11],
            "outputs": [12],
            "queue": False,
            "status_tracker": None,
        },
    ],
}
