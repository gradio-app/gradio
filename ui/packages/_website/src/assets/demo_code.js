export const sketch = `<pre class="language-python"><code class="language-python"><span class="token keyword">import</span> gradio <span class="token keyword">as</span> gr
<span class="token keyword">def</span> <span class="token function">sketch_recognition</span><span class="token punctuation">(</span>img<span class="token punctuation">)</span><span class="token punctuation">:</span>
    <span class="token keyword">pass</span><span class="token comment"># Implement your sketch recognition model here...</span>

gr<span class="token punctuation">.</span>Interface<span class="token punctuation">(</span>fn<span class="token operator">=</span>sketch_recognition<span class="token punctuation">,</span> inputs<span class="token operator">=</span><span class="token string">"sketchpad"</span><span class="token punctuation">,</span> outputs<span class="token operator">=</span><span class="token string">"label"</span><span class="token punctuation">).</span>launch<span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre>`;

export const q_a = `<pre class="language-python"><code class="language-python"><span class="token keyword">import</span> gradio <span class="token keyword">as</span> gr
<span class="token keyword">def</span> <span class="token function">question_answer</span><span class="token punctuation">(</span>context<span class="token punctuation">,</span> question<span class="token punctuation">)</span><span class="token punctuation">:</span>
<span class="token keyword">pass </span><span class="token comment"> # Implement your question-answering model here...</span>

gr<span class="token punctuation">.</span>Interface<span class="token punctuation">(</span>fn<span class="token operator">=</span>question_answer<span class="token punctuation">,</span> inputs<span class="token operator">=</span><span class="token punctuation">[</span><span class="token string">"text"</span><span class="token punctuation">,</span> <span class="token string">"text"</span><span class="token punctuation">],</span> outputs<span class="token operator">=</span>[</span><span class="token string">"textbox"</span><span class="token punctuation">,</span> <span class="token string">"text"</span><span class="token punctuation">]).</span>launch<span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre>`;

export const img = `<pre class="language-python"><code class="language-python"><span class="token keyword">import</span> gradio <span class="token keyword">as</span> gr
<span class="token keyword">def</span> <span class="token function">segment</span><span class="token punctuation">(</span>image<span class="token punctuation">)</span><span class="token punctuation">:</span>
<span class="token keyword">pass </span><span class="token comment"> # Implement your image segmentation model here...</span>

gr<span class="token punctuation">.</span>Interface<span class="token punctuation">(</span>fn<span class="token operator">=</span>segment<span class="token punctuation">,</span> inputs<span class="token operator">=</span><span class="token string">"image"</span><span class="token punctuation">,</span> outputs<span class="token operator">=</span><span class="token string">"image"</span><span class="token punctuation">).</span>launch<span class="token punctuation">(</span><span class="token punctuation">)</span>
</code></pre>`;