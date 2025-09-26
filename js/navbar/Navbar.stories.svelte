<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import { Embed } from "@gradio/core";

	/** @type {HTMLDivElement} */
	let wrapper;
	const pages = /** @type {[string, string, boolean][]} */ ([
		["", "Home", true],
		["page1", "Page 1", true],
		["page2", "Page 2", false],
		["settings", "Settings", true]
	]);
</script>

<Meta
	title="Components/Navbar"
	argTypes={{
		visible: {
			options: [true, false],
			description: "Sets the visibility of the navbar",
			control: { type: "boolean" },
			defaultValue: true
		},
		main_page_name: {
			control: "text",
			description:
				"The name to display for the main page in the navbar. Set to false to use default 'Home'",
			name: "main_page_name",
			value: "Home"
		},
		value: {
			control: "object",
			description:
				"List of [route, name] tuples for additional navbar pages. These are added to the existing pages",
			name: "value",
			value: null
		}
	}}
/>

<Template let:args>
	{#key `${args.visible}-${args.main_page_name}-${JSON.stringify(args.value)}`}
		<div
			style="width: 100%; min-height: 400px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;"
		>
			<Embed
				bind:wrapper
				version="4.0.0"
				initial_height="400px"
				fill_width={true}
				is_embed={false}
				space={null}
				display={true}
				info={false}
				loaded={true}
				{pages}
				current_page=""
				root=""
				components={[
					{
						id: 1,
						type: "navbar",
						props: {
							visible: args.visible,
							main_page_name: args.main_page_name,
							value: args.value
						}
					}
				]}
			>
				<div style="padding: 20px;">
					<h2>Navbar Storybook Demo</h2>
					<p>The navbar above shows:</p>
					<ul>
						<li>
							<strong>Visibility:</strong>
							{args.visible ? "Visible" : "Hidden"}
						</li>
						<li><strong>Main Page Name:</strong> {args.main_page_name}</li>
						<li>
							<strong>Custom Pages:</strong>
							{args.value
								? JSON.stringify(args.value)
								: "None (using default pages)"}
						</li>
					</ul>
					<p>Use the controls panel to change the navbar properties.</p>
				</div>
			</Embed>
		</div>
	{/key}
</Template>

<Story
	name="Default"
	args={{
		visible: true,
		main_page_name: "Home",
		value: null
	}}
/>

<Story
	name="Custom Main Page Name"
	args={{
		visible: true,
		main_page_name: "Dashboard",
		value: null
	}}
/>

<Story
	name="Additional Pages"
	args={{
		visible: true,
		main_page_name: "Home",
		value: [
			["Analytics", "analytics"],
			["Twitter", "https://twitter.com/abidlabs"]
		]
	}}
/>

<Story
	name="Hidden Navbar"
	args={{
		visible: false,
		main_page_name: "Home",
		value: null
	}}
/>
