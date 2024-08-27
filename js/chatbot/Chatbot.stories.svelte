<script context="module">
	import { Template, Story } from "@storybook/addon-svelte-csf";
	import Chatbot from "./Index.svelte";
	import { allModes } from "../storybook/modes";

	export const meta = {
		title: "Components/Chatbot",
		component: Chatbot,
		parameters: {
			chromatic: {
				modes: {
					desktop: allModes["desktop"],
					mobile: allModes["mobile"]
				}
			}
		},
		argTypes: {
			label: {
				control: "text",
				description: "The textbox label",
				name: "label"
			},
			show_label: {
				options: [true, false],
				description: "Whether to show the label",
				control: { type: "boolean" },
				defaultValue: true
			},
			rtl: {
				options: [true, false],
				description: "Whether to render right-to-left",
				control: { type: "boolean" },
				defaultValue: false
			}
		}
	};
</script>

<Template let:args>
	<Chatbot
		value={[
			[
				"Can you write a function in Python?",
				"```py\ndef test():\n\tprint(x)\n```"
			],
			["Can you do math?", "$$1+1=2$$"],
			["Can you say nothing?", null]
		]}
		{...args}
	/>
</Template>

<Story
	name="Chatbot with math enabled"
	args={{ latex_delimiters: [{ left: "$$", right: "$$", display: true }] }}
/>

<Story
	name="Chatbot with math disabled, small height"
	args={{ latex_delimiters: [], height: 200 }}
/>

<Story
	name="Chatbot with text rendered right-to-left"
	args={{
		rtl: true,
		latex_delimiters: [{ left: "$$", right: "$$", display: true }],
		value: [
			[
				"حلّت التجارية عرض لم, كرسي قادة دار كل. ما خيار ماذا بمحاولة به،. كما عن تونس إيطاليا. يتم بـ لأداء حادثة معزّزة.",
				"إعادة احداث اعلان بين قد, ما القوى الحكومة التغييرات جهة. قبل و يذكر الإمتعاض, أوسع وشعار إستعمل بعد تم. سبتمبر الصفحة عل أضف, أي وفي الدمج تشكيل وصافرات. حيث قد بقسوة هاربر بأيدي, أملاً نتيجة الثالث ما على, ثم مدن للسيطرة بالتوقيع. هذه ان حقول أخرى."
			],
			[
				"أي وتنصيب الصعداء انه. تاريخ بالجانب هو فصل, أخذ لمحاكم الإتفاقية ان. كنقطة بالعمل التكاليف شيء مع, وجزر الهادي كان و, أي حدى يطول الحكومة اليابان. حيث كرسي لتقليعة الاندونيسية تم, للصين وبغطاء بال بل. ٣٠ لهذه قتيل، ارتكبها كلا. سابق وبدأت تم ذات.",
				"اليف نفس. ما يتبقّ لبولندا، استراليا، دول."
			]
		]
	}}
/>

<Story
	name="Chatbot with copy button"
	args={{
		latex_delimiters: [{ left: "$$", right: "$$", display: true }],
		show_copy_button: true
	}}
/>

<Story
	name="Chatbot with chat bubble full width disabled"
	args={{
		bubble_full_width: false
	}}
/>

<Story
	name="Chatbot with panel layout enabled"
	args={{
		bubble_full_width: false,
		layout: "panel"
	}}
/>

<Story
	name="Chatbot with panel layout enabled and avatars"
	args={{
		layout: "panel",
		avatar_images: [
			{ url: "https://avatars.githubusercontent.com/u/100000?v=4" },
			{ url: "https://avatars.githubusercontent.com/u/100000?v=4" }
		]
	}}
/>

<Story
	name="Chatbot with bubble layout enabled and avatars"
	args={{
		bubble_full_width: true,
		layout: "bubble",
		avatar_images: [
			{ url: "https://avatars.githubusercontent.com/u/100000?v=4" },
			{ url: "https://avatars.githubusercontent.com/u/100000?v=4" }
		]
	}}
/>

<Story
	name="Chatbot with percentage height"
	args={{
		bubble_full_width: false,
		layout: "panel",
		height: "50%"
	}}
/>

<Story
	name="Chatbot with placeholder"
	args={{
		value: [],
		placeholder:
			"**Gradio Helper**\n\nThis Chatbot can help you on *any topic related to Gradio*."
	}}
/>

<Story
	name="Chatbot with headers and lists"
	args={{
		value: [
			[
				`# Markdown Example

This document is a showcase of various Markdown capabilities.`
			],
			[
				`## Table of Contents

1. [Text Formatting](#text-formating)
2. [Code Blocks](#code-blocks)
3. [Tables](#tables)
4. [Lists](#lists)
5. [Links and Images](#links-and-images)
6. [Quotes](#quotes)`
			]
		]
	}}
/>

<Story
	name="Chatbot with headers and lists"
	args={{
		value: [
			[
				`# Markdown Example

This document is a showcase of various Markdown capabilities.`,
				`## Table of Contents

1. [Text Formatting](#text-formating)
2. [Code Blocks](#code-blocks)
3. [Tables](#tables)`
			]
		]
	}}
/>

<Story
	name="Chatbot with tables and nested lists"
	args={{
		value: [
			[
				`Creating tables in Markdown is straightforward:

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1, Cell 1 | Row 1, Cell 2 | Row 1, Cell 3 |
| Row 2, Cell 1 | Row 2, Cell 2 | Row 2, Cell 3 |
| Row 3, Cell 1 | Row 3, Cell 2 | Row 3, Cell 3 |`,
				`### Unordered List

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

### Ordered List

1. First Item
2. Second Item
   1. Subitem 2.1
   2. Subitem 2.2
3. Third Item`
			]
		]
	}}
/>

<Story
	name="Chatbot with image in markdown"
	args={{
		value: [
			[
				`![A cheetah](https://cdn.britannica.com/02/92702-120-6A02E613/Cheetah.jpg)`
			]
		]
	}}
/>
