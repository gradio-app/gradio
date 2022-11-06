# More on Examples & Flagging

## Providing Examples

As covered in the Quickstart, adding examples to an Interface is as easy as providing a list of lists to the `examples`
keyword argument. 
Each sublist is a data sample, where each element corresponds to an input of the prediction function.
The inputs must be ordered in the same order as the prediction function expects them.

If your interface only has one input component, then you can provide your examples as a regular list instead of a list of lists.

### Loading Examples from a Directory

You can also specify a path to a directory containing your examples. If your Interface takes only a single file-type input, e.g. an image classifier, you can simply pass a directory filepath to the `examples=` argument, and the `Interface` will load the images in the directory as examples. 
In the case of multiple inputs, this directory must
contain a log.csv file with the example values.
In the context of the calculator demo, we can set  `examples='/demo/calculator/examples'` and in that directory we include the following `log.csv` file:
```csv
num,operation,num2
5,"add",3
4,"divide",2
5,"multiply",3
```

This can be helpful when browsing flagged data. Simply point to the flagged directory and the `Interface` will load the examples from the flagged data.

### Providing Partial Examples

Sometimes your app has many input components, but you would only like to provide examples for a subset of them. In order to exclude some inputs from the examples, pass `None` for all data samples corresponding to those particular components.

## Caching examples

You may wish to provide some cached examples of your model for users to quickly try out, in case your model takes a while to run normally.
If `cache_examples=True`, the `Interface` will run all of your examples through your app and save the outputs when you call the `launch()` method. This data will be saved in a directory called `gradio_cached_examples`. 

Whenever a user clicks on an example, the output will automatically be populated in the app now, using data from this cached directory instead of actually running the function. This is useful so users can quickly try out your model without adding any load!  

Keep in mind once the cache is generated, it will not be updated in future launches. If the examples or function logic change, delete the cache folder to clear the cache and rebuild it with another `launch()`.

