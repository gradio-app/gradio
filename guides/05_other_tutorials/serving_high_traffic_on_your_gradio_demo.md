# Configuring a Gradio Queue for High-Volume Traffic

Once in a while, a Gradio demo goes *viral* on social media -- you have lots of users trying
it out simultaneously, and you want to provide your users with the best possible experience:
minimize the amount of time that each user has to wait in the queue to see their prediction.

How can you configure your Gradio demo to handle the most traffic the most efficiently?
In this Guide, we dive into some of the parameters of Gradio's `.queue()` method as well
as some other related configuations, which allows you to serve lots of users simultaneously.
This is an advanced guide, so make sure you know the basics of Gradio's queuing.
