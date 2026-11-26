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

If your function raises any other exception (for example a `ValueError` or a `KeyError`), Gradio does not send the exception's message to the browser by default, because messages can contain secrets such as private URLs, IP addresses or API keys. Instead, users see a message like:

```
An unexpected error occurred (ConnectionError). The app could not connect to a service it depends on. Error ID: 3f9a2c1b
```

This only uses the exception's type, a short description for common errors (timeouts, running out of memory, connection failures, missing files, and so on), and a random error ID. The same ID is printed in the terminal running your app, next to the full traceback, so you can find the error a user is reporting.

If you want users to see the full exception message (never the traceback), use `demo.launch(show_error=True)`. Only do this if you're sure your exception messages can't contain sensitive information. To show a specific message for an error you expect, catch it and raise a `gr.Error()` instead.
