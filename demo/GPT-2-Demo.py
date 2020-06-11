#!/usr/bin/env python
# coding: utf-8

# In[2]:


# installing transformers
# !pip install -q git+https://github.com/huggingface/transformers.git
# !pip install -q tensorflow==2.1


# In[12]:


import tensorflow as tf
from transformers import TFGPT2LMHeadModel, GPT2Tokenizer
import gradio


# In[4]:


tokenizer = GPT2Tokenizer.from_pretrained("gpt2")

# add the EOS token as PAD token to avoid warnings
model = TFGPT2LMHeadModel.from_pretrained("gpt2", pad_token_id=tokenizer.eos_token_id)


# In[15]:


def predict(inp):
    input_ids = tokenizer.encode(inp, return_tensors='tf')
    beam_output = model.generate(input_ids, max_length=49, num_beams=5, no_repeat_ngram_size=2, early_stopping=True)
    output = tokenizer.decode(beam_output[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)
    return ".".join(output.split(".")[:-1]) + "."

# In[18]:


gradio.Interface(predict,"textbox","textbox").launch(inbrowser=True)


# In[ ]:




