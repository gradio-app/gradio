## Developing Quickly with Auto-Reloading

**Prerequisite**: This Guide requires you to know about Blocks. Make sure to [read the Guide to Blocks first](/introduction_to_blocks).

<span id="advanced-features"></span>

When you are building a Gradio demo, particularly out of Blocks, you may find it cumbersome to keep re-running your code to test your changes. 

To make it faster and more convenient to write your code, we've made it easier to "reload" your Gradio apps instantly when you are developing in a **Python IDE** (like VS Code, Sublime Text, PyCharm, or so on) or generally running your Python code from the terminal. We've also developed an analogous "magic command" that allows you to re-run cells faster if you use **Jupyter Notebooks** (or any similar environment like Colab).

This short Guide will cover both of these methods, so no matter how you write Python, you'll leave knowing how to build Gradio apps faster.

### Python IDE Reload 🔥

If you are building Gradio Blocks using a Python IDE, your file of code (let's name it `app.py`) probably looks something like this: 

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("Hello World")
    with gr.Tabs():
        with gr.TabItem("Tab 1")
            ...

if __name__ == "__main__":
    demo.launch()
```

The problem is that anytime that you want to make a change to the layout or components, you have to close and  rerun your app by writing `python app.py`.

Instead of doing this, you can run your code in **reload mode** by changing 1 word: `python` to `gradio`:

In the terminal, run `gradio app.py`. That's it! 

Now, you'll see that after you'll see something like this:

```
Launching in *reload mode* on: http://127.0.0.1:7860 (Press CTRL+C to quit)

Watching...

WARNING:  The --reload flag should not be used in production on Windows.
```

The important part here is the line that says `Watching...` What's happening here is that Gradio will be observing the directory where `app.py` file lives, and if the file changes, it will automatically rerun the file for you. So you can focus on writing your code, and your Gradio demo will refresh automatically 🥳

⚠️ Now, there are a couple of important things to keep in mind when use the reload mode:

* Because Gradio launches the demo for you in debug mode, you should *not* `launch()` your Gradio Interface or Gradio Blocks in the main block in your code. Instead, like we did above, you can `launch()` your demo within an `if __name__ == "__main__":` context, so that your code will continue to run normally if you decide to do `python app.py` as well:

```py
if __name__ == "__main__":
    demo.launch()
```

* Gradio specifically looks for a Gradio Blocks/Interface demo called `demo` in your code. If you have named your demo something else, you can pass that as the 2nd parameter in your code, like this: `gradio app.py my_demo`

As a small aside, this auto-reloading happens if you change your `app.py` source code or the Gradio source code. Meaning that this can be useful if you decide to [contribute to Gradio itself](https://github.com/gradio-app/gradio/blob/main/CONTRIBUTING.md) ✅

### Jupyter Notebook Magic 🔮

What about if you use Jupyter Notebooks (or Colab Notebooks, etc.) to develop code? We got something for you too!

We've developed a **magic command** that will create and run a Blocks demo for you. To use this, load the gradio extension at the top of your notebook: 

`%load_ext gradio`

Then, in the cell that you are developing your Gradio demo, simply write the magic command **`%%blocks`** at the top, and then write the layout and components like you would normally:

```py
gr.Markdown("Hello World")
with gr.Tabs():
    with gr.TabItem("Tab 1")
    ...
```

Notice that:

* You do not need to put the boiler plate `with gr.Blocks() as demo:` and `demo.launch()` code — Gradio does that for you automatically!

* Every time you rerun the cell, Gradio will re-launch your app on the same port and using the same underlying web server. This means you'll see your changes *much, much faster* than if you were rerunning the cell normally. 

In fact, this approach is now the author's preferred way of writing! Regardless of how you write Python code, we hope  these methods will give you a much better development experience using Gradio. 

### Next Steps

Now that you know how to develop quickly using Gradio, start building your own! 

If you are looking for inspiration, try exploring demos other people have built with Gradio, [browse public Hugging Face Spaces](http://hf.space/) 🤗

