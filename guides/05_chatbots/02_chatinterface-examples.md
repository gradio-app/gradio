# Using Popular LLM libraries and APIs

Tags: LLM, CHATBOT, API

In this Guide, we go through several examples of how to use `gr.ChatInterface` with popular LLM libraries and API providers.

We will cover the following libraries and API providers:

* [Llama Index](#llama-index)
* [LangChain](#lang-chain)
* [OpenAI](#open-ai)
* [Hugging Face `transformers`](#hugging-face-transformers)
* [SambaNova](#samba-nova)
* [Hyperbolic](#hyperbolic)
* [Anthropic's Claude](#anthropics-claude)

For many LLM libraries and providers, there exist community-maintained integration libraries that make it even easier to spin up Gradio apps. We reference these libraries in the appropriate sections below.

## Llama Index

Let's start by using `llama-index` on top of `openai` to build a RAG chatbot on any text or PDF files that you can demo and share in less than 30 lines of code. You'll need to have an OpenAI key for this example (keep reading for the free, open-source equivalent!)

$code_llm_llamaindex

## LangChain

Here's an example using `langchain` on top of `openai` to build a general-purpose chatbot. As before, you'll need to have an OpenAI key for this example.

$code_llm_langchain

Tip: For quick prototyping, the community-maintained <a href='https://github.com/AK391/langchain-gradio'>langchain-gradio repo</a>  makes it even easier to build chatbots on top of LangChain.

## OpenAI

Of course, we could also use the `openai` library directy. Here a similar example to the LangChain , but this time with streaming as well:

Tip: For quick prototyping, the  <a href='https://github.com/gradio-app/openai-gradio'>openai-gradio library</a> makes it even easier to build chatbots on top of OpenAI models.


## Hugging Face `transformers`

Of course, in many cases you want to run a chatbot locally. Here's the equivalent example using the SmolLM2-135M-Instruct model using the Hugging Face `transformers` library.

$code_llm_hf_transformers

## SambaNova

The SambaNova Cloud API provides access to full-precision open-source models, such as the Llama family. Here's an example of how to build a Gradio app around the SambaNova API

$code_llm_sambanova

Tip: For quick prototyping, the  <a href='https://github.com/gradio-app/sambanova-gradio'>sambanova-gradio library</a> makes it even easier to build chatbots on top of SambaNova models.

## Hyperbolic

The Hyperbolic AI API provides access to many open-source models, such as the Llama family. Here's an example of how to build a Gradio app around the Hyperbolic

$code_llm_hyperbolic

Tip: For quick prototyping, the  <a href='https://github.com/HyperbolicLabs/hyperbolic-gradio'>hyperbolic-gradio library</a> makes it even easier to build chatbots on top of Hyperbolic models.


## Anthropic's Claude 

Anthropic's Claude model can also be used via API. Here's a simple 20 questions-style game built on top of the Anthropic API:

$code_llm_claude


