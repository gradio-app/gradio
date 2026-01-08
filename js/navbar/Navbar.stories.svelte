<script>
	import { Meta, Template, Story } from "@storybook/addon-svelte-csf";

	const defaultPages = [
		["", "Home"],
		["page1", "Page 1"],
		["page2", "Page 2"],
		["settings", "Settings"]
	];
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
			{#if args.visible}
				<div
					class="nav-holder"
					style="border-bottom: 1px solid var(--border-color-primary, #e5e7eb); background: var(--background-fill-primary, white);"
				>
					<nav
						style="display: flex; gap: 0; padding: 0 1rem; font-family: var(--font-sans, system-ui, sans-serif);"
					>
						{#each defaultPages as [route, label], i}
							<a
								href="#{route}"
								style="
									padding: 0.75rem 1rem;
									text-decoration: none;
									color: {i === 0
									? 'var(--color-accent, #f97316)'
									: 'var(--body-text-color, #374151)'};
									border-bottom: 2px solid {i === 0
									? 'var(--color-accent, #f97316)'
									: 'transparent'};
									font-weight: {i === 0 ? '600' : '400'};
								"
							>
								{i === 0 ? args.main_page_name : label}
							</a>
						{/each}
						{#if args.value}
							{#each args.value as [label, route]}
								<a
									href="#{route}"
									style="
										padding: 0.75rem 1rem;
										text-decoration: none;
										color: var(--body-text-color, #374151);
										border-bottom: 2px solid transparent;
										font-weight: 400;
									"
								>
									{label}
								</a>
							{/each}
						{/if}
					</nav>
				</div>
			{/if}
			<div
				style="padding: 20px; font-family: var(--font-sans, system-ui, sans-serif);"
			>
				<h2 style="margin: 0 0 0.5rem; font-size: 1rem; font-weight: 700;">
					Page Content
				</h2>
				<p style="margin: 0; color: var(--body-text-color-subdued, #6b7280);">
					This is the content area below the navbar.
				</p>
			</div>
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
