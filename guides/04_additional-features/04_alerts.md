# Alerts

You may wish to display alerts to the user. To do so, raise a `gr.Error("custom message")` in your function to halt the execution of your function and display an error message to the user.

You can also issue `gr.Warning("custom message")` or `gr.Info("custom message")` by having them as standalone lines in your function, which will immediately display modals while continuing the execution of your function. The only difference between `gr.Info()` and `gr.Warning()` is the color of the alert. 

```python
def start_process(name):
    gr.Info("Starting process")
    if name is None:
        gr.Warning("Name is empty")
    ...
    if success == False:
        raise gr.Error("Process failed")
```

Tip: Note that `gr.Error()` is an exception that has to be raised, while `gr.Warning()` and `gr.Info()` are functions that are called directly.


## Unexpected errors

If your function raises any other exception (for example a `ValueError` or a `KeyError`), Gradio shows the exception's message in an error modal, so users can see what went wrong instead of a generic "Error". Only the message is sent to the browser, never the traceback. Before it is sent, Gradio redacts Hugging Face tokens (`hf_...`), and in any URLs it masks `user:password@` credentials, query strings (which often carry API keys) and IP-address hosts (which usually point at a private backend).

If your exception messages may contain information you don't want users to see, turn this off with `demo.launch(show_error=False)`. Users will then see a generic "Error", and the full exception is still printed in the terminal running your app. Errors you raise with `gr.Error()` are always shown.
