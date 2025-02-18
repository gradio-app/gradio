import gradio as gr
import os
from gradio.sketch.sketchbox import SketchBox


def launch(app_file: str, config_file: str):
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
        gr.Accordion,
        gr.Audio,
        gr.Button,
        gr.Checkbox,
        gr.ColorPicker,
        gr.File,
        gr.Image,
        gr.Markdown,
        gr.Number,
        gr.Radio,
        gr.State,
        gr.Slider,
        gr.Textbox,
        gr.Video,
    ]

    def get_box(_slot, i, gp=None):
        parent = _slot
        target = _slot[i[0]] if isinstance(_slot, list) and i[0] < len(_slot) else None
        if len(i) > 1:
            gp, parent, target = get_box(target, i[1:], parent)
        return gp, parent, target

    with gr.Blocks() as demo:
        _id = gr.State(0)
        running_id = gr.State(0)
        components = gr.State({})
        layout = gr.State([])
        mode = gr.State("add_component")
        add_index = gr.State([0])
        modify_id = gr.State(None)
        saved = gr.State(False)

        with gr.Sidebar() as sidebar:
            gr.Markdown("## Configuration")

            @gr.render([mode, add_index, running_id, components, modify_id], show_progress="hidden")
            def render_sidebar(_mode, _add_index, _running_id, _components, _modify_id):
                if _mode == "default":
                    gr.Markdown("Click on a '+' button to add a component.")
                elif _mode == "add_component":
                    for component in quick_component_list:

                        def add_component(layout, component=component):
                            gp, parent, _ = get_box(layout, _add_index)
                            if isinstance(parent, int):
                                parent = [parent]
                                gp[_add_index[-2]] = parent
                            parent.insert(_add_index[-1], _running_id)
                            _components[_running_id] = [component, {}, ""]

                            return layout, _components, "modify_component", _running_id, _running_id + 1

                        gr.Button(component.__name__, size="sm").click(
                            add_component, layout, [layout, components, mode, modify_id, running_id]
                        )

                    def add_any_component(component_name, layout):
                        for component in all_component_list:
                            if component.__name__ == component_name:
                                gp, parent, _ = get_box(layout, _add_index)
                                if isinstance(parent, int):
                                    parent = [parent]
                                    gp[_add_index[-2]] = parent
                                parent.insert(_add_index[-1], _running_id)
                                _components[_running_id] = [component, {}, ""]
                                return layout, _components, "modify_component", _running_id, _running_id + 1
                        return layout, _components, "add_component", None, _running_id

                    any_component_search = gr.Dropdown(
                        ["Search Components..."]
                        + [component.__name__ for component in all_component_list],
                        container=False,
                        interactive=True,
                    )
                    any_component_search.change(
                        add_any_component,
                        [any_component_search, layout],
                        [layout, components, mode, modify_id, running_id],
                    )
                elif _mode == "modify_component":
                    component, _, var_name = _components[_modify_id]
                    just_created = var_name == ""
                    if just_created:
                        existing_names = [_components[i][2] for i in _components]
                        var_name = component.__name__.lower()
                        i = 2
                        while var_name in existing_names:
                            var_name = component.__name__.lower() + "_" + str(i)
                            i += 1
                        _components[_modify_id][2] = var_name

                    var_name_box = gr.Textbox(var_name, label="Variable Name", autofocus=just_created) 
                    def set_var_name(name):
                        _components[_modify_id][2] = name
                    var_name_box.blur(set_var_name, var_name_box, None)

        with gr.Row():
            gr.Markdown("## Sketching *" + folder_name + "/" + file_name + "*")
            save_btn = gr.Button("Save & Render", scale=0)

        save_btn.click(lambda saved: (not saved, "Save & Render" if saved else "Edit"), saved, [saved, save_btn])

        @gr.render([layout, components, saved], show_progress="hidden")
        def app(_layout, _components, saved):
            boxes = []
            code = ""
            def render_slot(slot, is_column, index, depth=1):
                nonlocal code
                Container = gr.Column() if is_column else gr.Row()
                with Container:
                    for i, element in enumerate(slot):
                        this_index = index + [i]
                        if isinstance(element, list):
                            if saved:
                                code += "    " * depth + "with gr." + ("Column" if is_column else "Row") + "():\n"
                                render_slot(element, not is_column, this_index, depth+1)
                            else:
                                with SketchBox(is_container=True) as box:
                                    render_slot(element, not is_column, this_index, depth+1)
                                boxes.append((box, this_index))
                            continue
                        component, kwargs, var_name = _components[element]
                        if saved:
                            code += "    " * depth + var_name + " = gr." + component.__name__ + "(" + ", ".join([f"{k}={v}" for k, v in kwargs.items()]) + ")\n"
                            component(**kwargs)
                        else:
                            with SketchBox(component_type=component.__name__.lower(), var_name=var_name) as box:
                                component(**kwargs)
                            boxes.append((box, this_index))

            render_slot(_layout, True, [])

            if saved:
                with open(app_file, "w") as f:
                    f.write(f"""import gradio as gr
                            
with gr.Blocks() as demo:
{code}
demo.launch()""")
            for box, index in boxes:
                def box_action(_layout, _components, data: gr.SelectData, index=index):
                    if data.value in ("up", "down", "left", "right"):
                        if len(index) % 2 == 1: # vertical
                            if data.value == "down":
                                index[-1] += 1
                            elif data.value == "left":
                                index.append(0)
                            elif data.value == "right":
                                index.append(1)
                        else: # horizontal
                            if data.value == "right":
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
                        return _layout, _components, "default", [], None                
                    if data.value == "modify":
                        *_, target = get_box(_layout, index)
                        return _layout, _components, "modify_component", None, target
                box.select(box_action, [layout, components], [layout, components, mode, add_index, modify_id])
            
    demo.launch()
