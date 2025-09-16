import gradio as gr


def update_tab_visibility(choice, tab_choice):
    updates = {}

    # Update the selected tab's visibility
    if tab_choice == "Tab 1":
        if choice == "Show":
            updates["tab1_content"] = gr.update(visible=True)
        elif choice == "Hide (remove from DOM)":
            updates["tab1_content"] = gr.update(visible=False)
        else:  # "Hide (keep in DOM)"
            updates["tab1_content"] = gr.update(visible="hidden")
    elif tab_choice == "Tab 2":
        if choice == "Show":
            updates["tab2_content"] = gr.update(visible=True)
        elif choice == "Hide (remove from DOM)":
            updates["tab2_content"] = gr.update(visible=False)
        else:  # "Hide (keep in DOM)"
            updates["tab2_content"] = gr.update(visible="hidden")

    return updates.get("tab1_content", gr.update()), updates.get(
        "tab2_content", gr.update()
    )


with gr.Blocks() as demo:
    gr.Markdown("# Test Visibility States with Tabs")
    gr.Markdown("""
    This demo tests the three visibility states with tabs:
    - **Show**: Component is visible (visible=True)
    - **Hide (remove from DOM)**: Component is not rendered (visible=False)
    - **Hide (keep in DOM)**: Component is rendered but hidden with CSS (visible="hidden")
    """)

    with gr.Row():
        tab_choice = gr.Radio(
            ["Tab 1", "Tab 2"],
            label="Choose which tab content to control",
            value="Tab 1",
        )
        visibility_choice = gr.Radio(
            ["Show", "Hide (remove from DOM)", "Hide (keep in DOM)"],
            label="Choose visibility state",
            value="Show",
        )

    with gr.Tabs():
        with gr.TabItem("Tab 1"):
            tab1_content = gr.Textbox(
                label="Tab 1 Content",
                value="This is tab 1 content",
                visible=True,
                elem_id="tab1_content",
            )

        with gr.TabItem("Tab 2"):
            tab2_content = gr.Textbox(
                label="Tab 2 Content",
                value="This is tab 2 content",
                visible=True,
                elem_id="tab2_content",
            )

    # Update visibility based on selections
    visibility_choice.change(
        update_tab_visibility,
        inputs=[visibility_choice, tab_choice],
        outputs=[tab1_content, tab2_content],
    )
    tab_choice.change(
        update_tab_visibility,
        inputs=[visibility_choice, tab_choice],
        outputs=[tab1_content, tab2_content],
    )

    gr.Markdown("""
    ### Expected Behavior:
    - **visible=True**: Component is rendered and visible
    - **visible=False**: Component is not in DOM at all (optimization for unselected tabs) 
    - **visible="hidden"**: Component is in DOM but hidden with display:none (maintains state)
    
    The "hidden" state is useful when you want to:
    - Keep component state while hiding it
    - Avoid re-rendering when showing again
    - Maintain form values even when hidden
    """)

if __name__ == "__main__":
    demo.launch()
