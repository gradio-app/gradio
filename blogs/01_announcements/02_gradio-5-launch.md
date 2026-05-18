# Gradio 5: A New Era for ML Demos

Author: Gradio Team
Date: 2026-03-21
Tags: announcement, release, gradio-5

Gradio 5 represents a major leap forward in how developers build and share machine learning applications. In this post, we'll walk through the highlights and what they mean for you.

## Performance That Speaks for Itself

Gradio 5 is built on a completely revamped architecture that delivers significant performance improvements:

- **Faster load times** — Apps now start up to 3x faster thanks to optimized component bundling
- **Smaller bundle sizes** — We've reduced the default JavaScript payload by over 40%
- **Streaming improvements** — Real-time applications feel smoother with reduced latency

## A Refreshed Design System

The default theme in Gradio 5 has been redesigned from the ground up. Components look more polished, spacing is more consistent, and the overall feel is more modern — all while maintaining the simplicity that makes Gradio approachable.

## Enhanced Developer Experience

We've invested heavily in making the development workflow smoother:

- **Hot reload** now works reliably across all component types
- **Error messages** are clearer and more actionable
- **Type hints** are comprehensive, so your editor can help you write correct code faster

## Custom Components, Evolved

The custom components ecosystem in Gradio 5 is more powerful than ever. Building, publishing, and sharing components is streamlined, and the API surface is cleaner.

```python
import gradio as gr

demo = gr.Interface(
    fn=lambda x: f"Hello, {x}!",
    inputs=gr.Textbox(label="Your Name"),
    outputs=gr.Textbox(label="Greeting"),
)

demo.launch()
```

## What's Next

We're just getting started. Expect more posts diving deeper into individual features, migration guides, and community showcases. If you haven't already, [upgrade to Gradio 5](https://pypi.org/project/gradio/) and let us know what you think!
