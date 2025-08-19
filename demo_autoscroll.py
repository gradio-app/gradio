#!/usr/bin/env python3
"""
Demo script for HTML autoscroll functionality
"""

import gradio as gr
import time
import threading

def create_demo():
    """
    Demo to showcase HTML autoscroll functionality
    """
    with gr.Blocks(title="HTML Autoscroll Demo") as demo:
        gr.Markdown("# HTML Autoscroll Feature Demo")
        gr.Markdown(
            "This demo shows the new autoscroll feature for HTML components. "
            "Content will automatically scroll to the bottom when new content is added."
        )
        
        with gr.Row():
            with gr.Column():
                gr.Markdown("## With Autoscroll (Default)")
                html_with_scroll = gr.HTML(
                    value="<p>Initial content...</p>",
                    autoscroll=True,  # This is the default
                    max_height=300
                )
                
            with gr.Column():
                gr.Markdown("## Without Autoscroll")
                html_no_scroll = gr.HTML(
                    value="<p>Initial content...</p>",
                    autoscroll=False,
                    max_height=300
                )
        
        with gr.Row():
            add_content_btn = gr.Button("Add Content", variant="primary")
            clear_btn = gr.Button("Clear", variant="secondary")
        
        # State to track content
        content_state = gr.State(value=1)
        
        def add_content(current_count):
            """
            Add new content to both HTML components
            """
            new_content = f"<p>Line {current_count}: This is some new content added at {time.strftime('%H:%M:%S')}</p>"
            
            # Read existing content and add new line
            existing_content = "<p>Initial content...</p>" if current_count == 1 else ""
            for i in range(1, current_count):
                existing_content += f"<p>Line {i}: This is some new content added at some time</p>"
            
            full_content = existing_content + new_content
            
            return (
                full_content,  # With autoscroll
                full_content,  # Without autoscroll
                current_count + 1  # Updated counter
            )
        
        def clear_content():
            """
            Clear all content
            """
            return (
                "<p>Initial content...</p>",
                "<p>Initial content...</p>",
                1
            )
        
        # Event handlers
        add_content_btn.click(
            fn=add_content,
            inputs=[content_state],
            outputs=[html_with_scroll, html_no_scroll, content_state]
        )
        
        clear_btn.click(
            fn=clear_content,
            outputs=[html_with_scroll, html_no_scroll, content_state]
        )
        
        gr.Markdown(
            "### Instructions:\n"
            "1. Click 'Add Content' to add new lines\n"
            "2. Notice how the left panel (with autoscroll) automatically scrolls to show new content\n"
            "3. The right panel (without autoscroll) stays at the current scroll position\n"
            "4. Use 'Clear' to reset both panels"
        )
    
    return demo

if __name__ == "__main__":
    print("🚀 Starting HTML Autoscroll Demo...")
    print("📝 This demo showcases the new autoscroll feature for HTML components")
    print("🌐 Open the demo in your browser and try adding content to see the difference!")
    
    demo = create_demo()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        debug=True
    )
