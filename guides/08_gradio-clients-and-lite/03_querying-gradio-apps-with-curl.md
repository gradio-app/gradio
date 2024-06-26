# Querying Gradio Apps with Curl

Tags: CURL, API, SPACES

It is possible to use any Gradio app as an API using cURL, the command-line tool that is pre-installed on many operating systems. This is particularly useful if you are trying to query a Gradio app from an environment other than Python or Javascript (since specialized Gradio clients exist for both [Python](/guides/getting-started-with-the-python-client) and [Javascript](/guides/getting-started-with-the-js-client)).

As an example, consider this Gradio demo that translates text from English to French: https://abidlabs-en2fr.hf.space/.

Using `curl`, we can translate text programmatically.

Here's the code to do it:

```bash
$ curl -X POST https://abidlabs-en2fr.hf.space/call/predict -H "Content-Type: application/json" -d '{
  "data": ["Hello, my friend."] 
}'

>> {"event_id": $EVENT_ID}   
```

```bash
$ curl -N https://abidlabs-en2fr.hf.space/call/predict/$EVENT_ID

>> event: complete
>> data: ["Bonjour, mon ami."]
```


Note: making a prediction and getting a result requires two `curl` requests: a `POST` and a `GET`. The `POST` request returns an `EVENT_ID` and prints  it to the console, which is used in the second `GET` request to fetch the results. You can combine these into a single command using `awk` and `read` to parse the results of the first command and pipe into the second, like this:

```bash
$ curl -X POST https://abidlabs-en2fr.hf.space/call/predict -H "Content-Type: application/json" -d '{
  "data": ["Hello, my friend."] 
}' \
  | awk -F'"' '{ print $4}'  \
  | read EVENT_ID; curl -N https://abidlabs-en2fr.hf.space/call/predict/$EVENT_ID

>> event: complete
>> data: ["Bonjour, mon ami."]
```

In the rest of this Guide, we'll explain these two steps in more detail and provide additional examples of querying Gradio apps with `curl`.


**Prerequisites**: For this Guide, you do _not_ need to know how to build Gradio apps in great detail. However, it is helpful to have general familiarity with Gradio's concepts of input and output components.

## Installation

You generally don't need to install cURL, as it comes pre-installed on many operating systems. Run:

```bash
curl --version
```

to confirm that `curl` is installed. If it is not already installed, you can install it by visiting https://curl.se/download.html. 


## Step 0: Get the URL for your Gradio App 

To query a Gradio app, you'll need its full URL. This is usually just the URL that the Gradio app is hosted on, for example: https://bec81a83-5b5c-471e.gradio.live


**Hugging Face Spaces**

However, if you are querying a Gradio on Hugging Face Spaces, you will need to use the URL of the embedded Gradio app, not the URL of the Space webpage. For example:

```bash
❌ Space URL: https://huggingface.co/spaces/abidlabs/en2fr
✅ Gradio app URL: https://abidlabs-en2fr.hf.space/
```

You can get the Gradio app URL by clicking the "view API" link at the bottom of the page. Or, you can right-click on the page and then click on "View Frame Source" or the equivalent in your browser to view the URL of the embedded Gradio app.

While you can use any public Space as an API, you may get rate limited by Hugging Face if you make too many requests. For unlimited usage of a Space, simply duplicate the Space to create a private Space,
and then use it to make as many requests as you'd like!

Note: to query private Spaces, you will need to pass in your Hugging Face (HF) token. You can get your HF token here: https://huggingface.co/settings/tokens. In this case, you will need to include an additional header in both of your `curl` calls that we'll discuss below:

```bash
-H "Authorization: Bearer $HF_TOKEN"
```

Now, we are ready to make the two `curl` requests.

## Step 1: Make a Prediction (POST)

The first of the two `curl` requests is `POST` request that submits the input payload to the Gradio app. 

The syntax of the `POST` request is as follows:

```bash
$ curl -X POST $URL/call/$API_NAME -H "Content-Type: application/json" -d '{
  "data": $PAYLOAD
}'
```

Here:

* `$URL` is the URL of the Gradio app as obtained in Step 0
* `$API_NAME` is the name of the API endpoint for the event that you are running. You can get the API endpoint names by clicking the "view API" link at the bottom of the page.
*  `$PAYLOAD` is a valid JSON data list containing the input payload, one element for each input component.

When you make this `POST` request successfully, you will get an event id that is printed to the terminal in this format:

```bash
>> {"event_id": $EVENT_ID}   
```

This `EVENT_ID` will be needed in the subsequent `curl` request to fetch the results of the prediction. 

Here are some examples of how to make the `POST` request

**Basic Example**

Revisiting the example at the beginning of the page, here is how to make the `POST` request for a simple Gradio application that takes in a single input text component:

```bash
$ curl -X POST https://abidlabs-en2fr.hf.space/call/predict -H "Content-Type: application/json" -d '{
  "data": ["Hello, my friend."] 
}'
```

**Multiple Input Components**

This [Gradio demo](https://huggingface.co/spaces/gradio/hello_world_3) accepts three inputs: a string corresponding to the `gr.Textbox`, a boolean value corresponding to the `gr.Checkbox`, and a numerical value corresponding to the `gr.Slider`. Here is the `POST` request:

```bash
curl -X POST https://gradio-hello-world-3.hf.space/call/predict -H "Content-Type: application/json" -d '{
  "data": ["Hello", true, 5]
}'
```

**Private Spaces**

As mentioned earlier, if you are making a request to a private Space, you will need to pass in a [Hugging Face token](https://huggingface.co/settings/tokens) that has read access to the Space. The request will look like this:

```bash
$ curl -X POST https://private-space.hf.space/call/predict -H "Content-Type: application/json" -H "Authorization: Bearer $HF_TOKEN" -d '{
  "data": ["Hello, my friend."] 
}'
```

**Files**

If you are using `curl` to query a Gradio application that requires file inputs, the files *need* to be provided as URLs, and The URL needs to be enclosed in a dictionary in this format:

```bash
{"path": $URL}
```

Here is an example `POST` request:

```bash
$ curl -X POST https://gradio-image-mod.hf.space/call/predict -H "Content-Type: application/json" -d '{
  "data": [{"path": "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png"}] 
}'
```


**Stateful Demos**

If your Gradio demo [persists user state](/guides/interface-state) across multiple interactions (e.g. is a chatbot), you can pass in a `session_hash` alongside the `data`. Requests with the same `session_hash` are assumed to be part of the same user session. Here's how that might look:

```bash
# These two requests will share a session

curl -X POST https://gradio-chatinterface-random-response.hf.space/call/chat -H "Content-Type: application/json" -d '{
  "data": ["Are you sentient?"],
  "session_hash": "randomsequence1234"
}'

curl -X POST https://gradio-chatinterface-random-response.hf.space/call/chat -H "Content-Type: application/json" -d '{
  "data": ["Really?"],
  "session_hash": "randomsequence1234"
}'

# This request will be treated as a new session

curl -X POST https://gradio-chatinterface-random-response.hf.space/call/chat -H "Content-Type: application/json" -d '{
  "data": ["Are you sentient?"],
  "session_hash": "newsequence5678"
}'
```



## Step 2: GET the result

Once you have received the `EVENT_ID` corresponding to your prediction, you can stream the results. Gradio stores these results  in a least-recently-used cache in the Gradio app. By default, the cache can store 2,000 results (across all users and endpoints of the app). 

To stream the results for your prediction, make a `GET` request with the following syntax:

```bash
$ curl -N $URL/call/$API_NAME/$EVENT_ID
```


Tip: If you are fetching results from a private Space, include a header with your HF token like this: `-H "Authorization: Bearer $HF_TOKEN"` in the `GET` request.

This should produce a stream of responses in this format:

```bash
event: ... 
data: ...
event: ... 
data: ...
...
```

Here: `event` can be one of the following:
* `generating`: indicating an intermediate result
* `complete`: indicating that the prediction is complete and the final result 
* `error`: indicating that the prediction was not completed successfully
* `heartbeat`: sent every 15 seconds to keep the request alive

The `data` is in the same format as the input payload: valid JSON data list containing the output result, one element for each output component.

Here are some examples of what results you should expect if a request is completed successfully:

**Basic Example**

Revisiting the example at the beginning of the page, we would expect the result to look like this:

```bash
event: complete
data: ["Bonjour, mon ami."]
```

**Multiple Outputs**

If your endpoint returns multiple values, they will appear as elements of the `data` list:

```bash
event: complete
data: ["Good morning Hello. It is 5 degrees today", -15.0]
```

**Streaming Example**

If your Gradio app [streams a sequence of values](/guides/streaming-outputs), then they will be streamed directly to your terminal, like this:

```bash
event: generating
data: ["Hello, w!"]
event: generating
data: ["Hello, wo!"]
event: generating
data: ["Hello, wor!"]
event: generating
data: ["Hello, worl!"]
event: generating
data: ["Hello, world!"]
event: complete
data: ["Hello, world!"]
```

**File Example**

If your Gradio app returns a file, the file will be represented as a dictionary in this format (including potentially some additional keys):

```python
{
    "orig_name": "example.jpg",
    "path": "/path/in/server.jpg",
    "url": "https:/example.com/example.jpg",
    "meta": {"_type": "gradio.FileData"}
}
```

In your terminal, it may appear like this:

```bash
event: complete
data: [{"path": "/tmp/gradio/359933dc8d6cfe1b022f35e2c639e6e42c97a003/image.webp", "url": "https://gradio-image-mod.hf.space/c/file=/tmp/gradio/359933dc8d6cfe1b022f35e2c639e6e42c97a003/image.webp", "size": null, "orig_name": "image.webp", "mime_type": null, "is_stream": false, "meta": {"_type": "gradio.FileData"}}]
```

## Authentication

What if your Gradio application has [authentication enabled](/guides/sharing-your-app#authentication)? In that case, you'll need to make an additional `POST` request with cURL to authenticate yourself before you make any queries. Here are the complete steps:

First, login with a `POST` request supplying a valid username and password:

```bash
curl -X POST $URL/login \
     -d "username=$USERNAME&password=$PASSWORD" \
     -c cookies.txt
```

If the credentials are correct, you'll get `{"success":true}` in response and the cookies will be saved in `cookies.txt`.

Next, you'll need to include these cookies when you make the original `POST` request, like this:

```bash
$ curl -X POST $URL/call/$API_NAME -b cookies.txt -H "Content-Type: application/json" -d '{
  "data": $PAYLOAD
}'
```

Finally, you'll need to `GET` the results, again supplying the cookies from the file:

```bash
curl -N $URL/call/$API_NAME/$EVENT_ID -b cookies.txt
```
