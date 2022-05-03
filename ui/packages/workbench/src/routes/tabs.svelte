<script>
	import { Tabs, TabItem } from "@gradio/tabs";
</script>

<Tabs>
	<TabItem name="tab 1" on:select={() => console.log("tab 1")}>
		<h1>HELLO FROM TAB 1</h1>
	</TabItem>

	<TabItem name="tab 2" on:select={() => console.log("tab 2")}>
		<h1>HELLO FROM TAB 2</h1>
	</TabItem>

	<TabItem name="tab 3" on:select={() => console.log("tab 3")}>
		<h1>HELLO FROM TAB 2</h1>
		<p>I am text</p>
		<blockquote>I am a quote</blockquote>
		<p>I am text</p>
		<blockquote>I am a quote</blockquote>
		<p>I am text</p>
		<blockquote>I am a quote</blockquote>
		<p>I am text</p>
		<blockquote>I am a quote</blockquote>
	</TabItem>
</Tabs>
