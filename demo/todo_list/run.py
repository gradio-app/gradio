import gradio as gr

with gr.Blocks() as demo:

    tasks = gr.State([])
    new_task = gr.Textbox(label="Task Name", autofocus=True)

    def add_task(tasks, new_task_name):
        return tasks + [{"name": new_task_name, "complete": False}], ""

    new_task.submit(add_task, [tasks, new_task], [tasks, new_task])

    @gr.render(inputs=tasks)
    def render_todos(task_list):
        complete = [task for task in task_list if task["complete"]]
        incomplete = [task for task in task_list if not task["complete"]]
        gr.Markdown(f"### Incomplete Tasks ({len(incomplete)})")
        for task in incomplete:
            with gr.Row():
                gr.Textbox(task['name'], show_label=False, container=False)
                done_btn = gr.Button("Done", scale=0)
                def mark_done(task=task):
                    task["complete"] = True
                    return task_list
                done_btn.click(mark_done, None, [tasks])

                delete_btn = gr.Button("Delete", scale=0, variant="stop")
                def delete(task=task):
                    task_list.remove(task)
                    return task_list
                delete_btn.click(delete, None, [tasks])

        gr.Markdown(f"### Complete Tasks ({len(complete)})")
        for task in complete:
            gr.Textbox(task['name'], show_label=False, container=False)

if __name__ == "__main__":
    demo.launch()
