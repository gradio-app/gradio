# Contributing a Guide

Want to help teach Gradio? Consider contributing a Guide! 🤗 

Broadly speaking, there are two types of guides:

* **Use cases**: guides that cover step-by-step how to build a particular type of machine learning demo or app using Gradio. Here's an example: [_Creating a Chatbot_](https://github.com/gradio-app/gradio/blob/master/guides/creating_a_chatbot.md)
* **Feature explanation**: guides that describe in detail a particular feature of Gradio.  Here's an example: [_Using Flagging_](https://github.com/gradio-app/gradio/blob/master/guides/using_flagging.md)

We encourage you to submit either type of Guide! (Looking for ideas? We may also have open [issues](https://github.com/gradio-app/gradio/issues?q=is%3Aopen+is%3Aissue+label%3Aguides) where users have asked for guides on particular topics)

## Guide Structure

As you can see with the previous examples, Guides are standard markdown documents. They usually:
* start with an Introduction section describing the topic
* include subheadings to make articles easy to navigate
* include real code snippets that make it easy to follow along and implement the Guide
* include embedded Gradio demos to make them more interactive and provide immediate demonstrations of the topic being discussed. These Gradio demos are hosted on [Hugging Face Spaces](https://huggingface.co/spaces) and are embedded using the standard \<iframe\> tag.


## How to Contribute a Guide

1. Clone or fork this `gradio` repo
2. Add a new markdown document with a descriptive title to the `/guides` folder
3. Write your Guide in standard markdown! Embed Gradio demos wherever helpful
4. Add a list of `related_spaces` at the top of the markdown document (see the previously linked Guides for how to do this)
5. Add 3 `tags` at the top of the markdown document to help users find your guide (again, see the previously linked Guides for how to do this)
6. Open a PR to have your guide reviewed

That's it! We're looking forward to reading your Guide 🥳