# Embedding Gradio Demos on Websites

**Prerequisite**: This Guide builds on topics introduced in the Quickstart. Make sure to [read the Quickstart first](/getting_started).

### Introduction

Once you have created a Gradio demo and [hosted it on Hugging Face Spaces](https://huggingface.co/blog/gradio-spaces), you may want to embed the demo on a different website, such as your blog or your portfolio. Embedding an interactive demo allows people to try out the machine learning model that you have built, without needing to download or install anything — right in their browser! The best part is that you can embed interative demos even in static websites, such as GitHub pages.

There are two ways to embed your Gradio demos, hosted on Hugging Face Spaces, into your websites:

* (Preferred) **Web components**, using the \<gradio-app\> tag

* **Iframes**, using the \<iframe\> tag, in cases where you cannot add javascript to your page

In either case, the first step is to create your Gradio demo and host it on Hugging Face Spaces, a process which is described in this blog post: https://huggingface.co/blog/gradio-spaces 

In this guide, we will be embedding this image classification Space: https://huggingface.co/spaces/abidlabs/pytorch-image-classifier using both web components and  

### Embedding with Web Components 

Embedding with web components has a number of advantages over traditional iframes:
* It's easy! All you need is the name of the Space
* It's faster to load than iframes 
* The embedded demo takes up just the right width and height for the demo

How do you embed your Gradio demo with web components? There are two steps:

1. Somewhere in your webpage, usually in the \<head\> tags, include the following javascript code, which imports the Gradio package:

```html
<script type="module" src="https://gradio.s3-us-west-2.amazonaws.com/3.0.18/gradio.js"></script>
```

* Instead of <code>3.0.18</code>, you can put whichever version of `gradio`, you'd like to run (a safe choice is the [latest stable version of Gradio](https://pypi.org/project/gradio/)). 

2. Wherever you'd like to put your demo on your webpage, insert the following code:

```html
<gradio-app space="abidlabs/pytorch-image-classifier"> </gradio-app>
```

* Instead of <code>abidlabs/pytorch-image-classifier</code>, you should, of course, put the path to your Space

That's it! Here's what it looks like in action:



### Embedding with Iframes

Notice that using web components requires importing javascript. If you cannot do this on your website, you can use Iframes instead. 

The URL to the iframe should be:

```html
https://hf.space/embed/{path/space}/+
```



--------

### Next Steps

Now that you know how to embed Gradio demos in your own portfolios, blog, or website, start building your own demo! 

If you are looking for inspiration, try exploring demos other people have built with Gradio, [browse public Hugging Face Spaces](http://hf.space/) 🤗

