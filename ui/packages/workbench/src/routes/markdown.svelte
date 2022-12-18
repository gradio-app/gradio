<script>
	import { Markdown } from "@gradio/markdown";

	const src = `<h1>title</h1>
<p>some text</p>
<blockquote>some quote</blockquote>
<h2>second title</h2>
<p>some more text</p>
<p>text with <a href="asd">a link</a></p>`;
</script>

<Markdown value={src} />
