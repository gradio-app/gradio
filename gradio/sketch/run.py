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

    with gr.Blocks() as demo:
        _id = gr.State(0)

        # Below was giving issues, commenting out for now
        # if os.path.exists(config_file):
        #     with open(config_file) as f:
        #         config = json.load(f)
        #     _layout = config["layout"]
        #     _components = {int(k): v for k, v in config["components"].items()}
        #     _running_id = len(_components)
        #     mode = gr.State("default")
        # else:
        _layout = []
        _components = {}
        _running_id = 0
        mode = gr.State("add_component")

        running_id = gr.State(_running_id)
        components = gr.State(_components)
        layout = gr.State(_layout)
        add_index = gr.State([_running_id])
        modify_id = gr.State(None)
        saved = gr.State(False)

        with gr.Sidebar():

            @gr.render(
                [mode, add_index, running_id, components, modify_id],
                show_progress="hidden",
            )
            def render_sidebar(_mode, _add_index, _running_id, _components, _modify_id):
                if _mode == "default":
                    gr.Markdown("## Placement")
                    gr.Markdown("Click on a '+' button to add a component.")
                elif _mode == "add_component":
                    gr.Markdown("## Selection")
                    if len(_components) == 0:
                        gr.Markdown("Select first component to place.")
                    else:
                        gr.Markdown("Select component to place in selected area.")
                    for component in quick_component_list:

                        def add_component(layout, component=component):
                            gp, parent, _ = get_box(layout, _add_index)
                            if isinstance(parent, int):
                                parent = [parent]
                                if gp:
                                    gp[_add_index[-2]] = parent
                            parent.insert(_add_index[-1], _running_id)
                            _components[_running_id] = [component.__name__, {}, ""]

                            return (
                                layout,
                                _components,
                                "modify_component",
                                _running_id,
                                _running_id + 1,
                            )

                        gr.Button(component.__name__, size="md").click(
                            add_component,
                            layout,
                            [layout, components, mode, modify_id, running_id],
                        )

                    def add_any_component(component_name, layout):
                        gp, parent, _ = get_box(layout, _add_index)
                        if isinstance(parent, int):
                            parent = [parent]
                            if gp:
                                gp[_add_index[-2]] = parent
                        parent.insert(_add_index[-1], _running_id)
                        _components[_running_id] = [component_name, {}, ""]
                        return (
                            layout,
                            _components,
                            "modify_component",
                            _running_id,
                            _running_id + 1,
                        )

                    any_component_search = gr.Dropdown(
                        [component.__name__ for component in all_component_list],
                        container=True,
                        label="Other Components...",
                        interactive=True,
                    )
                    any_component_search.change(
                        add_any_component,
                        [any_component_search, layout],
                        [layout, components, mode, modify_id, running_id],
                    )
                elif _mode == "modify_component":
                    gr.Markdown(
                        "## Configuration\nHover over a component to add new components when done configuring."
                    )
                    component_name, kwargs, var_name = _components[_modify_id]
                    just_created = var_name == ""
                    if just_created:
                        existing_names = [_components[i][2] for i in _components]
                        var_name = component_name.lower()
                        i = 2
                        while var_name in existing_names:
                            var_name = component_name.lower() + "_" + str(i)
                            i += 1
                        _components[_modify_id][2] = var_name

                    gr.Markdown()
                    var_name_box = gr.Textbox(
                        var_name, label="Variable Name", autofocus=just_created
                    )

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

        with gr.Row():
            gr.Markdown(
                "<h2> Sketching <code style='font-size: inherit; font-weight: inherit;'>"
                + folder_name
                + "/"
                + file_name
                + "</code></h2>"
            )
            save_btn = gr.Button("Save & Render", variant="primary", scale=0)
            deploy_to_spaces_btn = gr.Button(
                "Deploy to Spaces",
                visible=False,
                scale=0,
                min_width=240,
                icon=gradio.utils.get_icon_path("huggingface-logo.svg"),
            )

        save_btn.click(
            lambda saved: (
                not saved,
                "Save & Render" if saved else "Edit",
                gr.Button(visible=not saved),
            ),
            saved,
            [saved, save_btn, deploy_to_spaces_btn],
        )

        @gr.render([layout, components, saved, modify_id], show_progress="hidden")
        def app(_layout, _components, saved, _modify_id):
            boxes = []
            code = ""

            def render_slot(slot, is_column, index, depth=1):
                nonlocal code
                container = gr.Column() if is_column else gr.Row()
                with container:
                    for i, element in enumerate(slot):
                        this_index = index + [i]
                        if isinstance(element, list):
                            if saved:
                                code += (
                                    "    " * depth
                                    + "with gr."
                                    + ("Row" if is_column else "Column")
                                    + "():\n"
                                )
                                render_slot(
                                    element, not is_column, this_index, depth + 1
                                )
                            else:
                                with SketchBox(is_container=True) as box:
                                    render_slot(
                                        element, not is_column, this_index, depth + 1
                                    )
                                boxes.append((box, this_index))
                            continue
                        component_name, kwargs, var_name = _components[element]
                        component = get_component_by_name(component_name)
                        if saved:
                            code += (
                                "    " * depth
                                + var_name
                                + " = gr."
                                + component_name
                                + "("
                            )
                            for i, (k, v) in enumerate(kwargs.items()):
                                v = (
                                    f'"{v}"'.replace("\n", "\\n")
                                    if isinstance(v, str)
                                    else v
                                )
                                if i != 0:
                                    code += ", "
                                code += f"{k}={v}"
                            code += ")\n"
                            component(**kwargs)
                        else:
                            with SketchBox(
                                component_type=component.__name__.lower(),
                                var_name=var_name,
                                active=_modify_id == element,
                            ) as box:
                                component(**kwargs)
                            boxes.append((box, this_index))

            render_slot(_layout, True, [])

            if saved:
                code = f"""import gradio as gr

with gr.Blocks() as demo:
{code}
demo.launch()"""
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
                code = code.replace("\n", "%0A")
                url = f"""https://huggingface.co/new-space?name=new-space&sdk=gradio&files[0][path]=app.py&files[0][content]={code}"""
                deploy_to_spaces_btn.click(
                    fn=None, js="() => window.open('" + url + "', '_blank')"
                )
            for box, index in boxes:

                def box_action(_layout, _components, data: gr.SelectData, index=index):
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
                        return _layout, _components, "add_component", index, None
                    if data.value == "delete":

                        def delete_index(_layout, index):
                            _, parent, target = get_box(_layout, index)
                            parent.remove(target)
                            if isinstance(target, int):
                                del _components[target]

                            if len(parent) == 0 and len(index) > 1:
                                delete_index(_layout, index[:-1])

                        delete_index(_layout, index)
                        if len(_layout) == 0:
                            return _layout, _components, "add_component", [0], None
                        else:
                            return _layout, _components, "default", [], None
                    if data.value == "modify":
                        *_, target = get_box(_layout, index)
                        return _layout, _components, "modify_component", None, target

                box.select(
                    box_action,
                    [layout, components],
                    [layout, components, mode, add_index, modify_id],
                )

    return demo


if __name__ == "__main__":
    demo = create("app.py", "app.json")
    demo.launch()
