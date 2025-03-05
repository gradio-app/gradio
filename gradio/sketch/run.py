import json
import os
from inspect import signature

import gradio as gr
import gradio.utils
from gradio.sketch.sketchbox import SketchBox
from gradio.sketch.utils import set_kwarg


def create(app_file: str, config_file: str):
    file_name = os.path.basename(app_file)
    folder_name = os.path.basename(os.path.dirname(app_file))

    quick_component_list = [
        gr.Textbox,
        gr.Number,
        gr.Button,
        gr.Markdown,
        gr.State,
    ]
    all_component_list = [
        gr.AnnotatedImage,
        # gr.Accordion,
        gr.Audio,
        gr.BarPlot,
        gr.BrowserState,
        gr.Button,
        gr.Chatbot,
        gr.Checkbox,
        gr.CheckboxGroup,
        gr.Code,
        gr.ColorPicker,
        gr.Dataframe,
        gr.DateTime,
        gr.Dropdown,
        gr.File,
        gr.Gallery,
        gr.HighlightedText,
        gr.HTML,
        gr.Image,
        gr.ImageEditor,
        gr.JSON,
        gr.Label,
        gr.LinePlot,
        gr.Markdown,
        gr.Model3D,
        gr.MultimodalTextbox,
        gr.Number,
        gr.Radio,
        gr.Slider,
        gr.State,
        gr.Textbox,
        gr.Timer,
        gr.Video,
    ]

    def get_component_by_name(name):
        return [
            component for component in all_component_list if component.__name__ == name
        ][0]

    def get_box(_slot, i, gp=None):
        parent = _slot
        target = _slot[i[0]] if isinstance(_slot, list) and i[0] < len(_slot) else None
        if len(i) > 1:
            gp, parent, target = get_box(target, i[1:], parent)
        return gp, parent, target

    def add_component(
        component, layout, components, dependencies, add_index, new_component_id
    ):
        gp, parent, _ = get_box(layout, add_index)
        if isinstance(parent, int):
            parent = [parent]
            if gp:
                gp[add_index[-2]] = parent
        parent.insert(add_index[-1], new_component_id)
        components[new_component_id] = [component.__name__, {}, ""]

        component_name = component.__name__.lower()
        existing_names = [components[i][2] for i in components]
        var_name = component_name
        i = 2
        while var_name in existing_names:
            var_name = component_name + "_" + str(i)
            i += 1
        components[new_component_id][2] = var_name

        return (
            layout,
            components,
            dependencies,
            "modify_component",
            new_component_id,
            new_component_id + 1,
            gr.Button(interactive=True),
        )

    with gr.Blocks() as demo:
        _id = gr.State(0)

        # Below was giving issues, commenting out for now
        # if os.path.exists(config_file):
        #     with open(config_file) as f:
        #         config = json.load(f)
        #     _layout = config["layout"]
        #     _components = {int(k): v for k, v in config["components"].items()}
        #     _new_component_id = len(_components)
        #     mode = gr.State("default")
        # else:
        _layout = []
        _components = {}
        _dependencies = []
        _new_component_id = 0
        mode = gr.State("add_component")

        new_component_id = gr.State(_new_component_id)
        components = gr.State(_components)
        dependencies = gr.State(_dependencies)
        layout = gr.State(_layout)
        add_index = gr.State([_new_component_id])
        modify_id = gr.State(None)
        saved = gr.State(False)
        add_fn_btn = gr.Button(
            "+ Add Function", scale=0, interactive=False, render=False
        )

        with gr.Sidebar() as left_sidebar:

            @gr.render(
                [
                    mode,
                    add_index,
                    new_component_id,
                    components,
                    dependencies,
                    modify_id,
                ],
                show_progress="hidden",
            )
            def render_sidebar(
                _mode,
                _add_index,
                _new_component_id,
                _components,
                _dependencies,
                _modify_id,
            ):
                if _mode == "default" and len(_components) == 0:
                    _mode = "add_component"
                    _add_index = [0]
                if _mode == "default":
                    gr.Markdown("## Placement")
                    gr.Markdown("Click on a '+' button to add a component.")
                if _mode == "add_component":
                    gr.Markdown("## Selection")
                    if len(_components) == 0:
                        gr.Markdown("Select first component to place.")
                    else:
                        gr.Markdown("Select component to place in selected area.")
                    for component in quick_component_list:
                        gr.Button(component.__name__, size="md").click(
                            lambda _layout, _component=component: add_component(
                                _component,
                                _layout,
                                _components,
                                _dependencies,
                                _add_index,
                                _new_component_id,
                            ),
                            layout,
                            [
                                layout,
                                components,
                                dependencies,
                                mode,
                                modify_id,
                                new_component_id,
                                add_fn_btn,
                            ],
                        )

                    any_component_search = gr.Dropdown(
                        [component.__name__ for component in all_component_list],
                        container=True,
                        label="Other Components...",
                        interactive=True,
                    )
                    any_component_search.change(
                        lambda _component, _layout: add_component(
                            get_component_by_name(_component),
                            _layout,
                            _components,
                            _dependencies,
                            _add_index,
                            _new_component_id,
                        ),
                        [any_component_search, layout],
                        [
                            layout,
                            components,
                            dependencies,
                            mode,
                            modify_id,
                            new_component_id,
                            add_fn_btn,
                        ],
                    )
                if _mode == "modify_component":
                    component_name, kwargs, var_name = _components[_modify_id]
                    gr.Markdown(
                        "## Configuration\nHover over a component to add new components when done configuring."
                    )

                    var_name_box = gr.Textbox(var_name, label="Variable Name")

                    def set_var_name(name):
                        _components[_modify_id][2] = name
                        return _components

                    gr.on(
                        [var_name_box.blur, var_name_box.submit],
                        set_var_name,
                        var_name_box,
                        components,
                    )

                    gr.Markdown(
                        'Set args below with python syntax, e.g. `True`, `5`, or `["choice1", "choice2"]`.'
                    )

                    component = get_component_by_name(component_name)
                    arguments = list(signature(component.__init__).parameters.keys())[
                        1:
                    ]
                    for arg in arguments:
                        arg_value = kwargs.get(arg, "")
                        arg_box = gr.Textbox(
                            arg_value,
                            label=arg,
                            info=f"<a href='https://www.gradio.app/docs/gradio/{component_name.lower()}#param-{component_name.lower()}-{arg.lower().replace('_', '-')}' target='_blank'>docs</a>",
                        )

                        def set_arg(value, arg=arg):
                            set_kwarg(_components[_modify_id][1], arg, value)
                            return _components

                        gr.on(
                            [arg_box.blur, arg_box.submit], set_arg, arg_box, components
                        )
                if _mode == "modify_function":
                    var_name = _dependencies[_modify_id][3]
                    gr.Markdown("## Event Listeners")
                    function_name_box = gr.Textbox(var_name, label="Function Name")

                    def set_fn_name(name):
                        _dependencies[_modify_id][3] = name
                        return _dependencies

                    gr.on(
                        [function_name_box.blur, function_name_box.submit],
                        set_fn_name,
                        function_name_box,
                        dependencies,
                    )

                    gr.Markdown(
                        "Mark the components in the diagram as inputs or outputs, and select their triggers."
                    )

                    done_function_btn = gr.Button("Done", variant="primary", size="md")
                    done_function_btn.click(
                        lambda: ["default", None], None, [mode, modify_id]
                    )
                    del_function_btn = gr.Button("Delete", variant="stop", size="md")

                    def del_function():
                        del _dependencies[_modify_id]
                        return _dependencies, "default", None

                    del_function_btn.click(
                        del_function, None, [dependencies, mode, modify_id]
                    )

        with gr.Row():
            gr.Markdown("## Sketching '" + folder_name + "/" + file_name + "'")
            add_fn_btn.render()
            save_btn = gr.Button("Save & Render", variant="primary", scale=0)

            deploy_to_spaces_btn = gr.Button(
                "Deploy to Spaces",
                visible=False,
                scale=0,
                min_width=240,
                icon=gradio.utils.get_icon_path("huggingface-logo.svg"),
            )

        @gr.render(
            [layout, components, dependencies, saved, modify_id, mode],
            show_progress="hidden",
        )
        def app(_layout, _components, _dependencies, saved, _modify_id, _mode):
            boxes = []
            function_mode = _mode == "modify_function"

            def render_slot(slot, is_column, index, depth=1):
                container = gr.Column() if is_column else gr.Row()
                with container:
                    for i, element in enumerate(slot):
                        this_index = index + [i]
                        if isinstance(element, list):
                            if saved:
                                render_slot(
                                    element, not is_column, this_index, depth + 1
                                )
                            else:
                                with SketchBox(
                                    is_container=True, function_mode=function_mode
                                ) as box:
                                    render_slot(
                                        element, not is_column, this_index, depth + 1
                                    )
                                boxes.append((box, this_index))
                            continue
                        component_name, kwargs, var_name = _components[element]
                        component = get_component_by_name(component_name)
                        if saved:
                            component(**kwargs)
                        else:
                            if function_mode:
                                triggers = [
                                    t
                                    for c, t in _dependencies[_modify_id][0]
                                    if c == element
                                ]
                                is_input = element in _dependencies[_modify_id][1]
                                is_output = element in _dependencies[_modify_id][2]
                            else:
                                triggers = None
                                is_input = False
                                is_output = False
                            with SketchBox(
                                component_type=component.__name__.lower(),
                                var_name=var_name,
                                active=_modify_id == element and not function_mode,
                                function_mode=function_mode,
                                event_list=component.EVENTS
                                if hasattr(component, "EVENTS")
                                else None,
                                is_input=is_input,
                                is_output=is_output,
                                triggers=triggers,
                            ) as box:
                                component(**kwargs)
                            boxes.append((box, this_index))

            render_slot(_layout, True, [])

            for box, index in boxes:

                def box_action(
                    _layout,
                    _components,
                    _dependencies,
                    _modify_id,
                    data: gr.SelectData,
                    index=index,
                ):
                    if data.value in ("up", "down", "left", "right"):
                        if len(index) % 2 == 1:  # vertical
                            if data.value == "down":
                                index[-1] += 1
                            elif data.value == "left":
                                index.append(0)
                            elif data.value == "right":
                                index.append(1)
                        elif data.value == "right":
                            index[-1] += 1
                        elif data.value == "up":
                            index.append(0)
                        elif data.value == "down":
                            index.append(1)
                        return (
                            _layout,
                            _components,
                            _dependencies,
                            "add_component",
                            index,
                            None,
                        )
                    if data.value == "delete":

                        def delete_index(_layout, index):
                            gp, parent, target = get_box(_layout, index)
                            parent.remove(target)
                            if isinstance(target, int):
                                del _components[target]

                            if len(parent) == 0 and len(index) > 1:
                                delete_index(_layout, index[:-1])
                            elif len(parent) == 1 and gp:
                                gp[index[-2]] = parent[0]

                        delete_index(_layout, index)
                        if len(_layout) == 0:
                            return (
                                _layout,
                                _components,
                                _dependencies,
                                "add_component",
                                [0],
                                None,
                            )
                        else:
                            return (
                                _layout,
                                _components,
                                _dependencies,
                                "default",
                                [],
                                None,
                            )
                    if data.value == "modify":
                        *_, target = get_box(_layout, index)
                        return (
                            _layout,
                            _components,
                            _dependencies,
                            "modify_component",
                            None,
                            target,
                        )
                    if data.value in ["input", "output"]:
                        *_, target = get_box(_layout, index)
                        component_list = _dependencies[_modify_id][
                            1 if data.value == "input" else 2
                        ]
                        if target in component_list:
                            component_list.remove(target)
                        else:
                            component_list.append(target)
                        return (
                            _layout,
                            _components,
                            _dependencies,
                            "modify_function",
                            None,
                            _modify_id,
                        )
                    if data.value.startswith("on:"):
                        *_, target = get_box(_layout, index)
                        event = data.value[3:]
                        triggers = _dependencies[_modify_id][0]
                        if (target, event) in triggers:
                            triggers.remove((target, event))
                        else:
                            triggers.append((target, event))
                        return (
                            _layout,
                            _components,
                            _dependencies,
                            "modify_function",
                            None,
                            _modify_id,
                        )

                box.select(
                    box_action,
                    [layout, components, dependencies, modify_id],
                    [layout, components, dependencies, mode, add_index, modify_id],
                )

        with gr.Sidebar(position="right", open=False) as right_sidebar:
            gr.Markdown("## Functions")

            @gr.render([dependencies], show_progress="hidden")
            def render_deps(_dependencies):
                for i, dep in enumerate(_dependencies):
                    fn_btn = gr.Button(dep[3], size="md")

                    def load_fn(i=i):
                        return "modify_function", i

                    fn_btn.click(load_fn, outputs=[mode, modify_id])

            def add_fn(_dependencies):
                _dependencies.append([[], [], [], f"fn_{len(_dependencies) + 1}"])
                return (
                    _dependencies,
                    "modify_function",
                    len(_dependencies) - 1,
                    gr.Sidebar(open=True),
                )

            add_fn_btn.click(
                add_fn, dependencies, [dependencies, mode, modify_id, right_sidebar]
            )

            gr.Markdown("## Generated File")
            code = gr.Code(language="python", interactive=False, show_label=False)

            @gr.on(
                inputs=[layout, components, dependencies],
                outputs=code,
                show_progress="hidden",
            )
            def render_code(_layout, _components, _dependencies):
                code_str = ""

                def render_code_slot(slot, is_column, index, depth=1):
                    nonlocal code_str
                    for i, element in enumerate(slot):
                        this_index = index + [i]
                        if isinstance(element, list):
                            code_str += (
                                "    " * depth
                                + "with gr."
                                + ("Row" if is_column else "Column")
                                + "():\n"
                            )
                            render_code_slot(
                                element, not is_column, this_index, depth + 1
                            )
                            continue
                        component_name, kwargs, var_name = _components[element]
                        code_str += (
                            "    " * depth + var_name + " = gr." + component_name + "("
                        )
                        for i, (k, v) in enumerate(kwargs.items()):
                            v = (
                                f'"{v}"'.replace("\n", "\\n")
                                if isinstance(v, str)
                                else v
                            )
                            if i != 0:
                                code_str += ", "
                            code_str += f"{k}={v}"
                        code_str += ")\n"

                render_code_slot(_layout, True, [])

                for dep in _dependencies:
                    triggers = [_components[c][2] + "." + t for c, t in dep[0]]
                    inputs = [_components[c][2] for c in dep[1]]
                    outputs = [_components[c][2] for c in dep[2]]
                    fn_name = dep[3]
                    code_str += f"""
    @{triggers[0] + "(" if len(triggers) == 1 else "gr.on([" + ", ".join(triggers) + "], "}inputs=[{", ".join(inputs)}], outputs=[{", ".join(outputs)}])
    def {fn_name}({", ".join(inputs)}):
        ...
        return {", ".join(["..." for _ in outputs])}
"""

                code_str = f"""import gradio as gr

with gr.Blocks() as demo:
{code_str}
demo.launch()"""
                return code_str

        @save_btn.click(
            inputs=[saved, code],
            outputs=[
                saved,
                save_btn,
                add_fn_btn,
                deploy_to_spaces_btn,
                mode,
                left_sidebar,
                right_sidebar,
            ],
            show_progress="hidden",
        )
        def save(saved, code):
            with open(app_file, "w") as f:
                f.write(code)
            with open(config_file, "w") as f:
                json.dump(
                    {
                        "layout": _layout,
                        "components": _components,
                    },
                    f,
                )
            return [
                not saved,
                "Save & Render" if saved else "Edit Sketch",
                gr.Button(visible=saved),
                gr.Button(visible=not saved),
                "default",
                gr.Sidebar(open=saved),
                gr.Sidebar(open=False),
            ]

        deploy_to_spaces_btn.click(
            fn=None,
            inputs=code,
            js="""(code) => {
                code = encodeURIComponent(code);
                url = `https://huggingface.co/new-space?name=new-space&sdk=gradio&files[0][path]=app.py&files[0][content]=${code}`
                window.open(url, '_blank')
            }""",
        )

    return demo


if __name__ == "__main__":
    demo = create("app.py", "app.json")
    demo.launch()
