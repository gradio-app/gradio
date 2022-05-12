XRAY_CONFIG = {
    "mode": "blocks",
    "components": [
        {
            "id": 1,
            "type": "markdown",
            "props": {
                "value": "<h1>Detect Disease From Scan</h1>\n<p>With this model you can lorem ipsum</p>\n<ul>\n<li>ipsum 1</li>\n<li>ipsum 2</li>\n</ul>\n",
                "name": "markdown",
                "visible": True,
                "style": {},
            },
        },
        {
            "id": 2,
            "type": "checkboxgroup",
            "props": {
                "choices": ["Covid", "Malaria", "Lung Cancer"],
                "value": [],
                "label": "Disease to Scan For",
                "show_label": True,
                "name": "checkboxgroup",
                "visible": True,
                "style": {},
            },
        },
        {"id": 3, "type": "tabs", "props": {"visible": True, "style": {}}},
        {
            "id": 4,
            "type": "tabitem",
            "props": {"label": "X-ray", "visible": True, "style": {}},
        },
        {
            "id": 5,
            "type": "row",
            "props": {"type": "row", "visible": True, "style": {}},
        },
        {
            "id": 6,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "source": "upload",
                "tool": "editor",
                "show_label": True,
                "name": "image",
                "visible": True,
                "style": {},
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "value": '""',
                "show_label": True,
                "name": "json",
                "visible": True,
                "style": {},
            },
        },
        {
            "id": 8,
            "type": "button",
            "props": {
                "value": "Run",
                "variant": "primary",
                "name": "button",
                "visible": True,
                "style": {},
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {"label": "CT Scan", "visible": True, "style": {}},
        },
        {
            "id": 10,
            "type": "row",
            "props": {"type": "row", "visible": True, "style": {}},
        },
        {
            "id": 11,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "source": "upload",
                "tool": "editor",
                "show_label": True,
                "name": "image",
                "visible": True,
                "style": {},
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "value": '""',
                "show_label": True,
                "name": "json",
                "visible": True,
                "style": {},
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "value": "Run",
                "variant": "primary",
                "name": "button",
                "visible": True,
                "style": {},
            },
        },
        {
            "id": 14,
            "type": "textbox",
            "props": {
                "lines": 1,
                "max_lines": 20,
                "value": "",
                "show_label": True,
                "name": "textbox",
                "visible": True,
                "style": {},
            },
        },
    ],
    "theme": "default",
    "css": None,
    "enable_queue": False,
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
            "backend_fn": True,
            "js": None,
            "status_tracker": None,
            "queue": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [2, 11],
            "outputs": [12],
            "backend_fn": True,
            "js": None,
            "status_tracker": None,
            "queue": None,
        },
        {
            "targets": [],
            "trigger": "load",
            "inputs": [],
            "outputs": [14],
            "backend_fn": True,
            "js": False,
            "status_tracker": None,
            "queue": None,
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
                "value": "<h1>Detect Disease From Scan</h1>\n<p>With this model you can lorem ipsum</p>\n<ul>\n<li>ipsum 1</li>\n<li>ipsum 2</li>\n</ul>\n",
                "name": "markdown",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 22,
            "type": "checkboxgroup",
            "props": {
                "choices": ["Covid", "Malaria", "Lung Cancer"],
                "value": [],
                "label": "Disease to Scan For",
                "show_label": True,
                "name": "checkboxgroup",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 3,
            "type": "tabs",
            "props": {"style": {}, "visible": True},
        },
        {
            "id": 444,
            "type": "tabitem",
            "props": {"label": "X-ray", "style": {}, "visible": True},
        },
        {
            "id": 5,
            "type": "row",
            "props": {"type": "row", "style": {}, "visible": True},
        },
        {
            "id": 6,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "source": "upload",
                "tool": "editor",
                "show_label": True,
                "name": "image",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "value": '""',
                "show_label": True,
                "name": "json",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 8888,
            "type": "button",
            "props": {
                "value": "Run",
                "variant": "primary",
                "name": "button",
                "css": {"background-color": "red", "--hover-color": "orange"},
                "visible": True,
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {
                "label": "CT Scan",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 10,
            "type": "row",
            "props": {"type": "row", "style": {}, "visible": True},
        },
        {
            "id": 11,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "source": "upload",
                "tool": "editor",
                "show_label": True,
                "name": "image",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "value": '""',
                "show_label": True,
                "name": "json",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "value": "Run",
                "variant": "primary",
                "name": "button",
                "style": {},
                "visible": True,
            },
        },
        {
            "id": 141,
            "type": "textbox",
            "props": {
                "lines": 1,
                "max_lines": 20,
                "value": "",
                "show_label": True,
                "name": "textbox",
                "style": {},
                "visible": True,
            },
        },
    ],
    "theme": "default",
    "enable_queue": False,
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
            "backend_fn": True,
            "js": None,
            "status_tracker": None,
            "queue": None,
        },
        {
            "targets": [13],
            "trigger": "click",
            "inputs": [22, 11],
            "outputs": [12],
            "backend_fn": True,
            "js": None,
            "status_tracker": None,
            "queue": None,
        },
        {
            "targets": [],
            "trigger": "load",
            "inputs": [],
            "outputs": [141],
            "backend_fn": True,
            "js": False,
            "status_tracker": None,
            "queue": None,
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
                "value": "<h1>Detect Disease From Scan</h1>\n<p>With this model you can lorem ipsum</p>\n<ul>\n<li>ipsum 1</li>\n<li>ipsum 2</li>\n</ul>\n",
                "name": "markdown",
                "style": {},
            },
        },
        {
            "id": 2,
            "type": "checkboxgroup",
            "props": {
                "choices": ["Covid", "Malaria", "Lung Cancer"],
                "value": [],
                "name": "checkboxgroup",
                "show_label": True,
                "label": "Disease to Scan For",
                "style": {},
            },
        },
        {
            "id": 3,
            "type": "tabs",
            "props": {"style": {}, "value": True},
        },
        {
            "id": 4,
            "type": "tabitem",
            "props": {
                "label": "X-ray",
                "style": {},
                "value": True,
            },
        },
        {
            "id": 5,
            "type": "row",
            "props": {"type": "row", "style": {}, "value": True},
        },
        {
            "id": 6,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "style": {},
            },
        },
        {
            "id": 7,
            "type": "json",
            "props": {
                "value": '""',
                "name": "json",
                "style": {},
            },
        },
        {
            "id": 8,
            "type": "button",
            "props": {
                "value": "Run",
                "name": "button",
                "css": {"background-color": "red", "--hover-color": "orange"},
                "variant": "primary",
            },
        },
        {
            "id": 9,
            "type": "tabitem",
            "props": {
                "show_label": True,
                "label": "CT Scan",
                "style": {},
                "value": True,
            },
        },
        {
            "id": 10,
            "type": "row",
            "props": {"type": "row", "style": {}, "value": True},
        },
        {
            "id": 11,
            "type": "image",
            "props": {
                "image_mode": "RGB",
                "source": "upload",
                "tool": "editor",
                "name": "image",
                "style": {},
            },
        },
        {
            "id": 12,
            "type": "json",
            "props": {
                "value": '""',
                "name": "json",
                "style": {},
            },
        },
        {
            "id": 13,
            "type": "button",
            "props": {
                "value": "Run",
                "name": "button",
                "style": {},
                "variant": "primary",
            },
        },
        {
            "id": 14,
            "type": "textbox",
            "props": {
                "lines": 1,
                "value": "",
                "name": "textbox",
                "style": {},
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
