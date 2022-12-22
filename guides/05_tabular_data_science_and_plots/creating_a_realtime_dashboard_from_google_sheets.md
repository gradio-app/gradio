# Creating a Real-Time Dashboard from Google Sheets

Tags: TABULAR, DASHBOARD, PLOTS 

[Google Sheets](https://www.google.com/sheets/about/) are an easy way to store tabular data in the form of spreadsheets. With Gradio and pandas, it's easy to read data from public or private Google Sheets and then display the data or plot it. In this blog post, we'll build a small *real-time* dashboard, one that updates when the data in the Google Sheets updates. 

Building the dashboard itself with just be 9 lines of Python code using Gradio, and our final dashboard will look like this:

<gradio-app space="gradio/line-plot"></gradio-app>

**Prerequisites**: This Guide uses [Gradio Blocks](../01_getting_started/01_quickstart.md#blocks-more-flexibility-and-control), so make your are familiar with the Blocks class. 

The process is a little different depending on if you are working with a publicly accessible or a private Google Sheet. We'll cover both, so let's get started!

## Public Google Sheets

If you want to build a dashboard from a Google Sheet that is public, then loading the data is very easy, thanks to the `pandas` library.

1. Get the URL of the Google Sheets that we want to use. To do this, simply go to the Google Sheets, click on the "Share" button in the top-right corner, and then click on the "Get shareable link" button. This will give you a URL that looks something like this:

```html
https://docs.google.com/spreadsheets/d/1UoKzzRzOCt-FXLLqDKLbryEKEgllGAQUEJ5qtmmQwpU/edit#gid=0
```

2. Now, let's use this URL to read the data from the Google Sheets into a Pandas DataFrame. Note that we tweak the URL slightly to export the Google Sheet into a CSV that can be read by `pandas` (replace the `URL` variable with the URL of your public Google Sheet):

```py
import pandas as pd

URL = "https://docs.google.com/spreadsheets/d/1UoKzzRzOCt-FXLLqDKLbryEKEgllGAQUEJ5qtmmQwpU/edit#gid=0"
csv_url = URL.replace('/edit#gid=', '/export?format=csv&gid=')

def get_data():
    return pd.read_csv(csv_url)
```

3. We've made the data query a function, which means that, it's easy to display it real-time using the the `gr.DataFrame` component, or plot it real-time using the `gr.LinePlot` component. To do this, we just pass the function into the respective components, and set the `every` parameter based on how frequently (in seconds) we would like the component to refresh. Here's the Gradio code:

```py
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# 📈 Real-Time Line Plot")
    with gr.Row():
        with gr.Column():
            gr.DataFrame(get_data, every=5)
        with gr.Column():
            gr.LinePlot(get_data, every=5, x="Date", y="Sales", y_title="Sales ($ millions)", overlay_point=True, width=500, height=500)

demo.queue().launch()  # Run the demo with queuing enabled
```
 
And that's it! You have a Dashboard that refreshes every 5 seconds, pulling the data from your Google Sheet.

## Private Google Sheets

For private Google Sheets, the process requires a little more work, but not that much! The key difference is that now, we must authenticate ourselves so to authorize access to the private Google Sheets.

### Authentication

To authenticate ourselves, we'll obtain credentials from Google Cloud. You can do this for free in just a couple of minutes.

1. First, log in to your Google Cloud account and go to the Google Cloud Console (https://console.cloud.google.com/)

2. In the Cloud Console, click on the hamburger menu in the top-left corner and select "APIs & Services" from the menu. If you do not have an existing project, you will need to create one.

3. Then, click the "+ Enabled APIs & services" button, which allows you to enable specific services for your project. Search for "Google Sheets API", click on it, and click the "Enable" button. If you see the "Manage" button, then Google Sheets is already enabled, and you're all set. 

4. In the APIs & Services menu, click on the "Credentials" tab and then click on the "Create credentials" button.

5. In the "Create credentials" dialog, select "Service account key" as the type of credentials to create, and give it a name. **Note down the email of the service account**

6. After selecting the service account, select the "JSON" key type and then click on the "Create" button. This will download the JSON key file containing your credentials to your computer. It will look something like this:

```json
{
 "type": "service_account",
 "project_id": "your project",
 "private_key_id": "your private key id",
 "private_key": "private key",
 "client_email": "email",
 "client_id": "client id",
 "auth_uri": "https://accounts.google.com/o/oauth2/auth",
 "token_uri": "https://accounts.google.com/o/oauth2/token",
 "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
 "client_x509_cert_url":  "https://www.googleapis.com/robot/v1/metadata/x509/email_id"
}
```

### Querying

Once you have the credentials `.json` file, you can use the following steps to query your Google Sheet:

1. Click on the "Share" button in the top-right corner of the Google Sheet. Share the Google Sheets with the email address of the service from Step 5 of authentication subsection (this step is important!). Then click on the "Get shareable link" button. This will give you a URL that looks something like this:

```html
https://docs.google.com/spreadsheets/d/1UoKzzRzOCt-FXLLqDKLbryEKEgllGAQUEJ5qtmmQwpU/edit#gid=0
```


2. Install the `gspread` library, which makes it easy to work with the Google Sheets API in Python: `pip install gspread`

3. Write a function to load the data from the Google Sheet, like this (replace the `URL` variable with the URL of your private Google Sheet):

```py
import gspread
import pandas as pd

# Authenticate with Google and get the sheet
URL = 'https://docs.google.com/spreadsheets/d/1_91Vps76SKOdDQ8cFxZQdgjTJiz23375sAT7vPvaj4k/edit#gid=0'

gc = gspread.service_account("path/to/key.json")
sh = gc.open_by_url(URL)
worksheet = sh.sheet1 

def get_data():
    values = worksheet.get_all_values()
    df = pd.DataFrame(values[1:], columns=values[0])
    return df

```

3. We've made the data query a function, which means that, it's easy to display it real-time using the the `gr.DataFrame` component, or plot it real-time using the `gr.LinePlot` component. To do this, we just pass the function into the respective components, and set the `every` parameter based on how frequently (in seconds) we would like the component to refresh. Here's the Gradio code:

```py
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# 📈 Real-Time Line Plot")
    with gr.Row():
        with gr.Column():
            gr.DataFrame(get_data, every=5)
        with gr.Column():
            gr.LinePlot(get_data, every=5, x="Date", y="Sales", y_title="Sales ($ millions)", overlay_point=True, width=500, height=500)

demo.queue().launch()  # Run the demo with queuing enabled
```
 
And that's it! You have a Dashboard that refreshes every 5 seconds, pulling the data from your Google Sheet.


## Conclusion

And that's all there is to it! With just a few lines of code, you can use `gradio` and other libraries to read data from a public or private Google Sheet and then display the data in a real-time dashboard.



