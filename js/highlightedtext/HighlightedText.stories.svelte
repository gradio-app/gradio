<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import HighlightedText from "./Index.svelte";
	import { wrapProps } from "../storybook/wrapProps";

	const { Story } = defineMeta({
		title: "Components/HighlightedText",
		component: HighlightedText
	});

	const defaultValue = [
		{ token: "zebras", class_or_confidence: "+" },
		{ token: "dogs", class_or_confidence: "-" },
		{ token: "elephants", class_or_confidence: "+" }
	];
</script>

<Story name="Highlighted Text Default" args={{}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps({ value: defaultValue, ...args })} />
	{/snippet}
</Story>

<Story name="Highlighted Text with legend" args={{ show_legend: true }}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps({ value: defaultValue, ...args })} />
	{/snippet}
</Story>

<Story name="Highlighted Text with label" args={{ label: "animals" }}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps({ value: defaultValue, ...args })} />
	{/snippet}
</Story>

<Story name="Highlighted Text with new lines" args={{
	value: [
		{ token: "zebras", class_or_confidence: "+" },
		{ token: "\n" },
		{ token: "dogs", class_or_confidence: "-" },
		{ token: "\n" },
		{ token: "elephants", class_or_confidence: "+" }
	]
}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Highlighted Text with color map" args={{ color_map: { "+": "green", "-": "red" } }}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps({ value: defaultValue, ...args })} />
	{/snippet}
</Story>

<Story name="Highlighted Text with combine adjacent" args={{
	value: [
		{ token: "The", class_or_confidence: null },
		{ token: "quick", class_or_confidence: "adjective" },
		{ token: " sneaky", class_or_confidence: "adjective" },
		{ token: "fox", class_or_confidence: "subject" },
		{ token: " jumped ", class_or_confidence: "past tense verb" },
		{ token: "over the", class_or_confidence: null },
		{ token: "lazy dog", class_or_confidence: "object" }
	],
	combine_adjacent: true
}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Highlighted Text without combine adjacent" args={{
	value: [
		{ token: "The", class_or_confidence: null },
		{ token: "quick", class_or_confidence: "adjective" },
		{ token: " sneaky", class_or_confidence: "adjective" },
		{ token: "fox", class_or_confidence: "subject" },
		{ token: " jumped ", class_or_confidence: "past tense verb" },
		{ token: "over the", class_or_confidence: null },
		{ token: "lazy dog", class_or_confidence: "object" }
	]
}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Highlighted Text with combine adjacent and new lines" args={{
	value: [
		{ token: "The", class_or_confidence: null },
		{ token: "quick", class_or_confidence: "adjective" },
		{ token: " sneaky", class_or_confidence: "adjective" },
		{ token: "fox", class_or_confidence: "subject" },
		{ token: "\n", class_or_confidence: null },
		{ token: " jumped ", class_or_confidence: "past tense verb" },
		{ token: "\n", class_or_confidence: null },
		{ token: "over the", class_or_confidence: null },
		{ token: "lazy dog", class_or_confidence: "object" }
	],
	combine_adjacent: true
}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Highlighted Text in scores mode" args={{
	value: [
		{ token: "the", class_or_confidence: -1 },
		{ token: "quick", class_or_confidence: 1 },
		{ token: "fox", class_or_confidence: 0.3 }
	],
	show_legend: true
}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Highlighted Text with hidden inline category" args={{
	value: [
		{ token: "the", class_or_confidence: -1 },
		{ token: "quick", class_or_confidence: 1 },
		{ token: "fox", class_or_confidence: 0.3 }
	],
	show_legend: false,
	show_inline_category: false,
	interactive: false
}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps(args)} />
	{/snippet}
</Story>

<Story name="Highlighted Text with RTL" args={{
	label: "مرحبا بالعالم",
	value: [
		{ token: "مرحبا", class_or_confidence: "greeting" },
		{ token: " ", class_or_confidence: null },
		{ token: "بالعالم", class_or_confidence: "subject" }
	],
	rtl: true,
	color_map: { greeting: "green", subject: "blue" }
}}>
	{#snippet template(args)}
		<HighlightedText {...wrapProps(args)} />
	{/snippet}
</Story>
