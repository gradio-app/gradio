Google Sheets is an easy way to store tabular data in the form of spreadsheets. With Gradio
and pandas, it's easy to read data from public or private Google Sheets and then display
the data or plot it. In this blog post, we'll take a look at how to use Gradio to do just that.

First, let's start by installing Gradio:

!pip install gradio
Next, we need to get the URL of the Google Sheets that we want to use. To do this, simply go to the Google Sheets, click on the "Share" button in the top-right corner, and then click on the "Get shareable link" button. This will give you a URL that looks something like this:

https://docs.google.com/spreadsheets/d/1nu8OZP_RwJpIM5D0oWd_Jh1em_5L5c5Q/edit#gid=0


Now, let's use this URL to read the data from the Google Sheets into a Pandas DataFrame:

Copy code
import pandas as pd

# Replace the URL below with the URL of your own Google Sheets
url = "https://docs.google.com/spreadsheets/d/1nu8OZP_RwJpIM5D0oWd_Jh1em_5L5c5Q/edit#gid=0"

# Read the data from the Google Sheets into a Pandas DataFrame
df = pd.read_csv(url)
Once we have the data in a Pandas DataFrame, it's easy to plot it using the gr.LinePlot component. To do this, we just need to create a new gr.LinePlot object and pass it the DataFrame as an argument:

Copy code
import gradio as gr

# Create a new gr.LinePlot object and pass it the DataFrame
line_plot = gr.LinePlot(df)
Finally, we can use the launch() method to launch the line plot and interact with it:

Copy code
# Launch the line plot and interact with it
line_plot.launch()
And that's all there is to it! With just a few lines of code, you can use Gradio to read data from a public Google Sheets and then plot it using the gr.LinePlot component.



Gradio is a powerful tool that allows you to quickly and easily build and deploy interactive machine learning interfaces. One of the great things about Gradio is that it can read data from a private Google Sheets and then plot it using the gr.LinePlot component. In this blog post, we'll take a look at how to use Gradio to do just that.

First, let's start by installing Gradio and the Google API client library for Python:

Copy code
!pip install gradio google-api-python-client
Next, we need to authenticate our Google account and authorize access to the private Google Sheets. To do this, we need to create a new project in the Google Developers Console, enable the Sheets API, and then download the credentials file. Once you have the credentials file, you can use the following code to authenticate your Google account and authorize access to the Sheets API:

Copy code
from google.oauth2.credentials import Credentials

# Replace the path and filename below with the path and filename of your own credentials file
creds = Credentials.from_service_account_file("/path/to/credentials.json")
Now, let's get the URL of the private Google Sheets that we want to use. To do this, simply go to the Google Sheets, click on the "Share" button in the top-right corner, and then click on the "Get shareable link" button. This will give you a URL that looks something like this:

Copy code
https://docs.google.com/spreadsheets/d/1nu8OZP_RwJpIM5D0oWd_Jh1em_5L5c5Q/edit#gid=0
Now, let's use the googleapiclient library to read the data from the private Google Sheets into a Pandas DataFrame:

Copy code
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import pandas as pd

# Replace the URL below with the URL of your own private Google Sheets
url = "https://docs.google.com/spreadsheets/d/1nu8OZP_RwJpIM5D0oWd_Jh1em_5L5c5Q/edit#gid=0"

# Extract the spreadsheet ID from the URL
spreadsheet_id = url.split("/")[-2]

# Build the Sheets API client
service = build("sheets", "v4", credentials=creds)

try:
    # Read the data from the private Google Sheets into a Pandas DataFrame
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range="Sheet1")
        .execute()
    )
    values = result.get("values", [])
    df = pd.DataFrame(values[1:], columns=values[0])
except HttpError as error:
    print(f"An error occurred: {error}")
    df = None
Once we have the data in a Pandas DataFrame, it's easy to plot it using the gr.LinePlot component. To do this, we just need to create a new `gr.Line



Plot` object and pass it the DataFrame as an argument:

Copy code
import gradio as gr

# Create a new gr.LinePlot object and pass it the DataFrame
line_plot = gr.LinePlot(df)
Finally, we can use the launch() method to launch the line plot and interact with it:

Copy code
# Launch the line plot and interact with it
line_plot.launch()
And that's all there is to it! With just a few lines of code, you can use Gradio to read data from a private Google Sheets and then plot it using the gr.LinePlot component. Keep in mind that since the Google Sheets is private, you will need to authenticate your Google account and authorize access to the Sheets API before you can read the data from it.



