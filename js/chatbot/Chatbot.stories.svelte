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
		latex_delimiters={[{ left: "$$", right: "$$", display: true }]}
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
	args={{ latex_delimiters: [], height: 200, show_copy_button: false }}
/>

<Story
	name="Chatbot with math disabled, small max_height"
	args={{ latex_delimiters: [], max_height: 200 }}
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
	name="Chatbot with panel layout enabled and avatars"
	args={{
		show_copy_button: true,
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

<Story
	name="Uploaded text files"
	args={{
		type: "messages",
		value: [
			{
				role: "user",
				content: {
					file: {
						path: "abc/qwerty.pdf",
						url: ""
					},
					alt_text: null
				}
			},
			{
				role: "user",
				content: {
					file: {
						path: "abc/qwerty.txt",
						url: ""
					},
					alt_text: null
				}
			},
			{
				role: "user",
				content: {
					file: {
						path: "abc/qwerty.rtf",
						url: ""
					},
					alt_text: null
				}
			}
		]
	}}
/>

<Story
	name="Consecutive messages grouped in same bubble"
	args={{
		type: "messages",
		display_consecutive_in_same_bubble: true,
		value: [
			{
				role: "user",
				content: "Show me the file."
			},
			{
				role: "user",
				content: "Second user message"
			},
			{
				role: "assistant",
				content: "Here is the file you requested"
			},
			{
				role: "assistant",
				content: {
					file: {
						path: "abc/qwerty.txt",
						url: ""
					},
					alt_text: null
				}
			}
		]
	}}
/>

<Story
	name="MultimodalChatbot with examples"
	args={{
		value: [],
		examples: [
			{
				text: "What is machine learning?",
				icon: { mime_type: "text" }
			},
			{
				text: "Analyze this image",
				files: [
					{
						mime_type: "image/jpeg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
						orig_name: "bus.png"
					}
				]
			},
			{
				text: "Process this document",
				files: [
					{
						mime_type: "application/pdf",
						url: "/document.pdf",
						orig_name: "document.pdf"
					}
				]
			},
			{
				text: "Compare these images",
				files: [
					{
						mime_type: "image/jpeg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
						orig_name: "image1.jpg"
					},
					{
						mime_type: "image/jpeg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
						orig_name: "image2.jpg"
					},
					{
						mime_type: "image/jpeg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
						orig_name: "image3.jpg"
					}
				]
			},
			{
				text: "Process these files",
				files: [
					{
						mime_type: "application/pdf",
						url: "doc1.pdf",
						orig_name: "document1.pdf"
					},
					{
						mime_type: "application/pdf",
						url: "/doc2.pdf",
						orig_name: "document2.pdf"
					},
					{
						mime_type: "application/pdf",
						url: "/doc3.pdf",
						orig_name: "document3.pdf"
					}
				]
			},
			{
				text: "Analyze this dataset",
				files: [
					{
						mime_type: "image/jpeg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
						orig_name: "visualization.jpg"
					},
					{
						mime_type: "image/jpeg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
						orig_name: "visualization.jpg"
					},
					{
						mime_type: "application/pdf",
						url: "/data.pdf",
						orig_name: "data.pdf"
					},
					{
						mime_type: "audio/mp3",
						url: "/audio.mp3",
						orig_name: "recording.mp3"
					},
					{
						mime_type: "video/mp4",
						url: "/video.mp4",
						orig_name: "video.mp4"
					}
				]
			}
		]
	}}
/>

<Story
	name="Consecutive messages not grouped in same bubble"
	args={{
		type: "messages",
		display_consecutive_in_same_bubble: false,
		value: [
			{
				role: "user",
				content: "Show me the file."
			},
			{
				role: "user",
				content: "Second user message"
			},
			{
				role: "assistant",
				content: "Here is the file you requested"
			},
			{
				role: "assistant",
				content: {
					file: {
						path: "abc/qwerty.txt",
						url: ""
					},
					alt_text: null
				}
			}
		]
	}}
/>

<Story
	name="Chatbot with examples (not multimodal)"
	args={{
		value: [],
		examples: [
			{
				text: "What is machine learning?"
			},
			{
				text: "Analyze this image",
				files: [
					{
						mime_type: "image/jpeg",
						url: "https://raw.githubusercontent.com/gradio-app/gradio/main/test/test_files/bus.png",
						orig_name: "bus.png"
					}
				]
			},
			{
				text: "Process this document",
				files: [
					{
						mime_type: "application/pdf",
						url: "/document.pdf",
						orig_name: "document.pdf"
					}
				]
			}
		]
	}}
/>

<Story
	name="Displaying Tool Message"
	args={{
		type: "messages",
		display_consecutive_in_same_bubble: true,
		value: [
			{
				role: "user",
				content: "What is 27 * 14?",
				duration: 0.1
			},
			{
				role: "assistant",
				duration: 10,
				content: "Let me break this down step by step.",
				metadata: {
					id: 1,
					title: "Solving multiplication",
					parent_id: 0
				}
			},
			{
				role: "assistant",
				content: "First, let's multiply 27 by 10: 27 * 10 = 270",
				metadata: {
					id: 2,
					title: "Step 1",
					parent_id: 1
				}
			},
			{
				role: "assistant",
				content:
					"We can do this quickly because multiplying by 10 just adds a zero",
				metadata: {
					id: 6,
					title: "Quick Tip",
					parent_id: 2
				}
			},
			{
				role: "assistant",
				content: "Then multiply 27 by 4: 27 * 4 = 108",
				metadata: {
					id: 3,
					title: "Step 2",
					parent_id: 1
				}
			},
			{
				role: "assistant",
				content:
					"Adding these together: 270 + 108 = 378. Therefore, 27 * 14 = 378"
			},
			{
				role: "assistant",
				content: "Let me verify this result using a different method.",
				metadata: {
					id: 4,
					title: "Verification",
					parent_id: 0
				}
			},
			{
				role: "assistant",
				content: "Using the standard algorithm: 27 * 14 = (20 + 7) * (10 + 4)",
				metadata: {
					id: 5,
					title: "Expanding",
					parent_id: 4
				}
			},
			{
				role: "assistant",
				content: "The result is confirmed to be 378."
			}
		]
	}}
/>
