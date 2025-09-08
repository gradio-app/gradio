<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";
	import { Embed } from "@gradio/core";
	
	/** @type {HTMLDivElement} */
	let wrapper;
	const pages = /** @type {[string, string][]} */ ([
		["", "Home"],
		["page1", "Page 1"],
		["page2", "Page 2"],
		["settings", "Settings"]
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
		home_page_title: {
			control: "text",
			description: "The title to display for the home page in the navbar",
			name: "home_page_title",
			value: "Home"
		}
	}}
/>

<Template let:args>
	{#key `${args.visible}-${args.home_page_title}`}
		<div style="width: 100%; min-height: 400px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
			<Embed
				bind:wrapper
				version="4.0.0"
				initial_height="400px"
				fill_width={true}
				is_embed={false}
				is_lite={false}
				space={null}
				display={true}
				info={false}
				loaded={true}
				pages={pages}
				current_page=""
				root=""
				components={[{
					id: 1,
					type: "navbar",
					props: {
						visible: args.visible,
						home_page_title: args.home_page_title
					}
				}]}
			>
				<div style="padding: 20px;">
					<h2>Navbar Storybook Demo</h2>
					<p>The navbar above shows:</p>
					<ul>
						<li><strong>Visibility:</strong> {args.visible ? "Visible" : "Hidden"}</li>
						<li><strong>Home Page Title:</strong> {args.home_page_title}</li>
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
		home_page_title: "Home"
	}}
/>

<Story
	name="Custom Home Title"
	args={{
		visible: true,
		home_page_title: "Dashboard"
	}}
/>

<Story
	name="Hidden Navbar"
	args={{
		visible: false,
		home_page_title: "Home"
	}}
/>
