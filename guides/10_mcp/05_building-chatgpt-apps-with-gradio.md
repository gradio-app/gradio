# Building ChatGPT Apps with Gradio and Apps SDK

[Apps in ChatGPT](https://openai.com/index/introducing-apps-in-chatgpt/) are a great way to let users try your machine learning models or other kinds of apps entirely by chatting in familiar chat application. OpenAI has released the [Apps SDK](https://developers.openai.com/apps-sdk/quickstart) for developers to build complete applications, but you can use Gradio to build ChatGPT apps very quickly, based off of your Gradio MCP server. We will also see how Gradio's built-in [share links](https://www.gradio.app/guides/sharing-your-app#sharing-demos) make it especially easy to iterate on your ChatGPT app!

### Introduction

Building a ChatGPT app requires doing two things:

* Building a Gradio MCP server with at least one tool exposed. If you're not already familiar with building a Gradio MCP server, we recommend reading [this guide first](https://www.gradio.app/guides/building-mcp-server-with-gradio).

* Building a custom UI with HTML, JavaScript, and CSS that will be displayed when your tool is called, an exposing that as an MCP resource. 


We will walk through the steps in more detail below.

### Prerequisites

* You will need to enable "developer mode" in ChatGPT under Settings → Apps & Connectors → Advanced settings in ChatGPT. This currently requires a paid ChatGPT account.
* You need to have `gradio>=6.0` installed with the `mcp` add-on:

```bash
pip install --upgrade gradio[mcp]
```

Now, let's walk through two examples of how you can build build ChatGPT apps with Gradio. 

### Example 1: Letter Counter App

The first example is an ChatGPT app that counts the occurrence of letters in a word and displays a card with the word and specified letters highlighted, like this:

<video src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/letter-counter-app-recording.mp4" controls></video>


So how do we build this? You can find the complete code for the letter counter app [in a single file here](https://github.com/gradio-app/gradio/blob/main/demo/mcp_letter_counter_app/run.py), or follow the steps below:

1. Start by writing your Python function. In our case, the function is simply a letter counter:

```py
def letter_counter(word: str, letter: str) -> int:
    """
    Count the number of letters in a word or phrase.

    Parameters:
        word (str): The word or phrase to count the letters of.
        letter (str): The letter to count the occurrences of.
    """
    return word.count(letter)
```

2. Then, wrap your Python function with a Gradio UI, something along these lines:

```py
with gr.Blocks() as demo:
    with gr.Row():
        with gr.Column():
            word = gr.Textbox(label="Word")
            letter = gr.Textbox(label="Letter")
            btn = gr.Button("Count Letters")
        with gr.Column():
            count = gr.Number(label="Count")

    btn.click(letter_counter, inputs=[word, letter], outputs=count)
```

3. Now, launch your Gradio app with the MCP server enabled, i.e. with `mcp_server=True`

```py
    demo.launch(mcp_server=True)
```

As covered in [earlier guides](https://www.gradio.app/guides/building-mcp-server-with-gradio), you will now be able to test the tool using any MCP Client, such as the MCP Inspector tool. Test it and confirm that it behaves as you expect.

4. Create a UI for your ChatGPT app and expose it as a resource. This part requires writing some frontend code and may be unfamiliar at first, but a few examples will help you create an app that works well for your use case. In our case, we'll create a card with HTML, Javascript, and CSS. Inside the card, we'll display the word presented by the user, highlighting each occurrence of the specified letter. Note that we access the user's tool input using `window.openai?.toolInput?.word` and `window.openai?.toolInput?.letter`. The `window.openai` object is automatically inserted by ChatGPT with the data from the user's tool call. This is what the complete function looks like:

```py
@gr.mcp.resource("ui://widget/app.html", mime_type="text/html+skybridge")
def app_html():
    visual = """
    <div id="letter-card-container"></div>
    <script>
        const container = document.getElementById('letter-card-container');

        function render() {
            const word = window.openai?.toolInput?.word || "strawberry";
            const letter = window.openai?.toolInput?.letter || "r";

            let letterHTML = '';
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const color = char.toLowerCase() === letter.toLowerCase() ? '#b8860b' : '#000000';
                letterHTML += `<span style="color: ${color};">${char}</span>`;
            }

            container.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #f5f5dc 0%, #e8e4d0 100%);
                    background-image:
                        repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139, 121, 94, 0.03) 2px, rgba(139, 121, 94, 0.03) 4px),
                        linear-gradient(135deg, #f5f5dc 0%, #e8e4d0 100%);
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
                    max-width: 600px;
                    margin: 20px auto;
                    font-family: 'Georgia', serif;
                    text-align: center;
                ">
                    <div style="
                        font-size: 48px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        line-height: 1.5;
                    ">
                        ${letterHTML}
                    </div>
                </div>
            `;
        }
        render();
        window.addEventListener("openai:set_globals", (event) => {
            if (event.detail?.globals?.toolInput) {
                render();
            }
        }, { passive: true });
    </script>
    """
    return visual
```

Note that we've provided a URI for the `gr.mcp.resource` at `ui://widget/app.html`. This is arbitrary, but we'll need to use the same URI later on. We also need to specify the mimetype of the resource to be `mime_type="text/html+skybridge"`. Finally, note that we attached an event listener in the JavaScript for "openai:set_globals", which is generally a good practice as it allows the widget to update whenever a new tool call is triggered. 

5. Create an event in your Gradio app corresponding to the resource function. This is necessary because your Gradio app only picks up MCP tools, resources, prompts, etc. if they are associated with a Gradio event. Typically, the convention is to simply display the code for your MCP resource in a `gr.Code` component, e.g. like this:

```py
    html = gr.Code(language="html", max_lines=20)
    
    # ... the rest of your Gradio app

    btn.click(app_html, outputs=html)
```

6. Add `_meta` attributes to your MCP tool. We need to connect the MCP tool that we created to the UI that we created for our app. We can do this by adding this decorator to our MCP tool function:

```py
@gr.mcp.tool(
    _meta={
        "openai/outputTemplate": "ui://widget/app.html",
        "openai/resultCanProduceWidget": True,
        "openai/widgetAccessible": True,
    }
)
```

The key thing to observe is that the `"openai/outputTemplate"` must match the URI of the MCP resource that we created earlier.

7. Relaunch your Gradio app with `share=True`. This will make it very easy to test within ChatGPT. Note the MCP server URL that is printed to your terminal, e.g. `https://2e879c6066d729b11b.gradio.live/gradio_api/mcp/`.

```py
    demo.launch(share=True, mcp_server=True)
```

This will print a public URL that your Gradio app will be running on.

8. Now, navigate to ChatGPT (https://chat.com/). As mentioned earlier, you need to enable "developer mode" in ChatGPT under Settings → Apps & Connectors → Advanced settings in ChatGPT. Then, navigate to Settings → Apps & Connectors and click the "Create" button. Give your connector a name, a description (optional), and paste in the MCP server URL that was printed to your terminal. Choose "No authentication" and create.

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/letter-counter-setup.png)

And that's it! Once the Connector has been created, you can start prompting it by saying something like, "Use @letter-counter to count the number of r's in Gradio."

### Example 2: An 




