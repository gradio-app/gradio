# How to Style the Gradio Dataframe

Tags: DATAFRAME, STYLE, COLOR

## Introduction

Data visualization is a crucial aspect of data analysis and machine learning. The Gradio `DataFrame` component is a popular way to display tabular data within a web application. 

But what if you want to stylize the table of data? What if you want to add background colors, partially highlight cells, or change the display precision of numbers? This Guide is for you!



Let's dive in!

**Prerequisites**: We'll be using the `gradio.Blocks` class in our examples.
You can [read the Guide to Blocks first](https://gradio.app/blocks-and-event-listeners) if you are not already familiar with it. Also please make sure you are using the **latest version** version of Gradio: `pip install --upgrade gradio`.


## The Pandas `Styler`

The Gradio `DataFrame` component now supports values of the type `Styler` from the `pandas` class. This allows us to reuse the rich existing API and documentation of the `Styler` class instead of inventing a new style format on our own. Here's a complete example of how it looks:

```python
import pandas as pd 
import gradio as gr

# Creating a sample dataframe
df = pd.DataFrame({
    "A" : [14, 4, 5, 4, 1], 
    "B" : [5, 2, 54, 3, 2], 
    "C" : [20, 20, 7, 3, 8], 
    "D" : [14, 3, 6, 2, 6], 
    "E" : [23, 45, 64, 32, 23]
}) 

# Applying style to highlight the maximum value in each row
styler = df.style.highlight_max(color = 'lightgreen', axis = 0)

# Displaying the styled dataframe in Gradio
with gr.Blocks() as demo:
    gr.DataFrame(styler)
    
demo.launch()
```

The Styler class can be used to apply conditional formatting and styling to dataframes, making them more visually appealing and interpretable. You can highlight certain values, apply gradients, or even use custom CSS to style the DataFrame. The Styler object is applied to a DataFrame and it returns a new object with the relevant styling properties, which can then be previewed directly, or rendered dynamically in a Gradio interface.

To read more about the Styler object, read the official `pandas` documentation at: https://pandas.pydata.org/docs/user_guide/style.html

Below, we'll explore a few examples:

### Highlighting Cells

Ok, so let's revisit the previous example. We start by creating a `pd.DataFrame` object and then highlight the highest value in each row with a light green color:

```python
import pandas as pd 

# Creating a sample dataframe
df = pd.DataFrame({
    "A" : [14, 4, 5, 4, 1], 
    "B" : [5, 2, 54, 3, 2], 
    "C" : [20, 20, 7, 3, 8], 
    "D" : [14, 3, 6, 2, 6], 
    "E" : [23, 45, 64, 32, 23]
}) 

# Applying style to highlight the maximum value in each row
styler = df.style.highlight_max(color = 'lightgreen', axis = 0)
```

Now, we simply pass this object into the Gradio `DataFrame` and we can visualize our colorful table of data in 4 lines of python:

```python
import gradio as gr

with gr.Blocks() as demo:
    gr.Dataframe(styler)
    
demo.launch()
```

Here's how it looks:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/df-highlight.png)

### Font Colors

Apart from highlighting cells, you might want to color specific text within the cells. Here's how you can change text colors for certain columns:

```python
import pandas as pd 
import gradio as gr

# Creating a sample dataframe
df = pd.DataFrame({
    "A" : [14, 4, 5, 4, 1], 
    "B" : [5, 2, 54, 3, 2], 
    "C" : [20, 20, 7, 3, 8], 
    "D" : [14, 3, 6, 2, 6], 
    "E" : [23, 45, 64, 32, 23]
}) 

# Function to apply text color
def highlight_cols(x): 
    df = x.copy() 
    df.loc[:, :] = 'color: purple'
    df[['B', 'C', 'E']] = 'color: green'
    return df 

# Applying the style function
s = df.style.apply(highlight_cols, axis = None)

# Displaying the styled dataframe in Gradio
with gr.Blocks() as demo:
    gr.DataFrame(s)
    
demo.launch()
```

In this script, we define a custom function highlight_cols that changes the text color to purple for all cells, but overrides this for columns B, C, and E with green. Here's how it looks:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/df-color.png)

### Display Precision 

Sometimes, the data you are dealing with might have long floating numbers, and you may want to display only a fixed number of decimals for simplicity. The pandas Styler object allows you to format the precision of numbers displayed. Here's how you can do this:

```python
import pandas as pd
import gradio as gr

# Creating a sample dataframe with floating numbers
df = pd.DataFrame({
    "A" : [14.12345, 4.23456, 5.34567, 4.45678, 1.56789], 
    "B" : [5.67891, 2.78912, 54.89123, 3.91234, 2.12345], 
    # ... other columns
}) 

# Setting the precision of numbers to 2 decimal places
s = df.style.format("{:.2f}")

# Displaying the styled dataframe in Gradio
with gr.Blocks() as demo:
    gr.DataFrame(s)
    
demo.launch()
```

In this script, the format method of the Styler object is used to set the precision of numbers to two decimal places. Much cleaner now:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/df-precision.png)



## Custom Styling

So far, we've been restricting ourselves to styling that is supported by the Pandas `Styler` class. But what if you want to create custom styles like partially highlighting cells based on their values:

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/dataframe_custom_styling.png)


This isn't possible with `Styler`, but you can do this by creating your own **`styling`** array, which is a 2D array the same size and shape as your data. Each element in this list should be a string of CSS that applies to the `<td>` element containing the cell value (or an empty string if no custom CSS should be applied). Similarly, you can create a **`display_value`** array which controls the value that is displayed in each cell (which can be different the underlying value which is the one that is used for searching/sorting).

Here's the complete code for how to can use custom styling with `gr.Dataframe` as in the screenshot above:

$code_dataframe_custom_styling


## Note about Interactivity

One thing to keep in mind is that the gradio `DataFrame` component only accepts custom styling objects when it is non-interactive (i.e. in "static" mode). If the `DataFrame` component is interactive, then the styling information is ignored and instead the raw table values are shown instead. 

The `DataFrame` component is by default non-interactive, unless it is used as an input to an event. In which case, you can force the component to be non-interactive by setting the `interactive` prop like this:

```python
c = gr.DataFrame(styler, interactive=False)
```

## Conclusion 🎉

This is just a taste of what's possible using the `gradio.DataFrame` component with the `Styler` class from `pandas`. Try it out and let us know what you think!