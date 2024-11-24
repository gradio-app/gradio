In this Guide, we go through several examples of how to use `gr.ChatInterface` with popular LLM libraries and API providers.

We will cover the following libraries and API providers:

* [Llama Index](#llama-index)
* [LangChain](#langchain)
* [OpenAI](#openai)
* [Hugging Face `transformers`](#hugging-face-transformers)
* [SambaNova](#sambanova)
* [Hyperbolic](#hyperbolic)

For many LLM libraries and providers, there exist community-maintained integration libraries that make it even easier to spin up Gradio apps. We reference these libraries in the appropriate sections below.

## Llama Index

Let's start by using `llama-index` on top of `openai` to build a RAG chatbot on any text or PDF files that you can demo and share in less than 30 lines of code. You'll need to have an OpenAI key for this example (keep reading for the free, open-source equivalent!)

$code_llm_llamaindex

## LangChain

Here's an example using `langchain` on top of `openai` to build a general-purpose chatbot. As before, you'll need to have an OpenAI key for this example.

$code_llm_langchain

**Note**: For quick prototyping, the community-maintained [langchain-gradio repo](https://github.com/AK391/langchain-gradio)  makes it even easier to build chatbots on top of LangChain.

## OpenAI

Of course, we could also use the `openai` library directy. Here a similar example to the LangChain , but this time with streaming as well:

**Note**: For quick prototyping, the  [openai-gradio library](https://github.com/gradio-app/openai-gradio) makes it even easier to build chatbots on top of OpenAI models.


## Hugging Face `transformers`

Of course, in many cases you want to run a chatbot locally. Here's the equivalent example using Together's RedPajama model, from Hugging Face (this requires you to have a GPU with CUDA).

$code_llm_hf_transformers

## SambaNova

The SambaNova Cloud API provides access to full-precision open-source models, such as the Llama family. Here's an example of how to build a Gradio app around the SambaNova API

$code_llm_sambanova

**Note**: For quick prototyping, the  [sambanova-gradio library](https://github.com/gradio-app/sambanova-gradio) makes it even easier to build chatbots on top of OpenAI models.

## Hyperbolic

$code_llm_hyperbolic

**Note**: For quick prototyping, the  [openai-gradio library](https://github.com/gradio-app/openai-gradio) makes it even easier to build chatbots on top of OpenAI models.


