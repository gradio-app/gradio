<script lang="ts">
	import { style_formatted_text } from "$lib/text";

	export let name = null as any;
	export let preprocess = null as any;
	export let postprocess = null as any;
</script>

<p><strong>Using {name} as an input component.</strong></p>

<p>How {name} will pass its value to your function:</p>

<p>
	<span style="font-weight: 500">Type: </span>

	<code class="language-python !bg-transparent">
		{preprocess.return_doc.annotation}
	</code>
</p>

<p>
	{@html style_formatted_text(preprocess.return_doc.doc)}
</p>

<h5 class="mb-2">Example Code</h5>

<pre class="language-python">
    <code class="language-python">
    import gradio as gr 

    def predict(
        value: {preprocess.return_doc.annotation}
    ):
            # process value from the {name} component
        return "prediction"

    interface = gr.Interface(predict, gr.{name}(), gr.Textbox())
    interface.launch()
</code>
</pre>

<br />

<p><strong>Using {name} as an output component</strong></p>

<p>How {name} expects its value from your function:</p>

<p>
	<span style="font-weight: 500">Type: </span>

	<code class="language-python !bg-transparent">
		{postprocess.parameter_doc[0].annotation}
	</code>
</p>

<p>
	{@html style_formatted_text(postprocess.parameter_doc[0].doc)}
</p>

<h5 class="mb-2">Example Code</h5>
<pre class="language-python">
    <code class="language-python">
    import gradio as gr 

    def predict(text) -> {postprocess.parameter_doc[0].annotation}
            # process value to return to the AnnotatedImage component
        return value
    
    interface = gr.Interface(predict, gr.Textbox(), gr.{name}())
    interface.launch()
</code>
</pre>
