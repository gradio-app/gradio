<script module>
	import { defineMeta } from "@storybook/addon-svelte-csf";

	const { Story } = defineMeta({
		title: "Components/Navbar",
		argTypes: {
			visible: {
				options: [true, false],
				description: "Sets the visibility of the navbar",
				control: { type: "boolean" },
				defaultValue: true
			},
			main_page_name: {
				control: "text",
				description: "The name to display for the main page in the navbar",
				name: "main_page_name",
				value: "Home"
			}
		}
	});

	const defaultPages = [
		["", "Home"],
		["page1", "Page 1"],
		["page2", "Page 2"],
		["settings", "Settings"]
	];
</script>

<Story name="Default" args={{
	visible: true,
	main_page_name: "Home",
	pages: defaultPages,
	current_page: ""
}}>
	{#snippet template(args)}
		{#if args.visible}
			<div class="gradio-container" style="font-family: var(--font-sans, system-ui, sans-serif);">
				<div class="nav-holder" style="border-bottom: 1px solid var(--border-color-primary, #e5e7eb); background: var(--background-fill-primary, white);">
					<nav style="display: flex; gap: 0; padding: 0 1rem;">
						{#each args.pages as [route, label], i}
							<a
								href="#{route}"
								style="
									padding: 0.75rem 1rem;
									text-decoration: none;
									color: {route === args.current_page ? 'var(--color-accent, #f97316)' : 'var(--body-text-color, #374151)'};
									border-bottom: 2px solid {route === args.current_page ? 'var(--color-accent, #f97316)' : 'transparent'};
									font-weight: {route === args.current_page ? '600' : '400'};
								"
							>
								{i === 0 && route === "" ? args.main_page_name : label}
							</a>
						{/each}
					</nav>
				</div>
				<div style="padding: 1.5rem;">
					<h2 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">Page Content</h2>
					<p style="margin: 0; color: var(--body-text-color-subdued, #6b7280);">
						This is the content area below the navbar.
					</p>
				</div>
			</div>
		{:else}
			<div style="padding: 1rem; color: #6b7280; text-align: center;">
				Navbar is hidden (visible: false)
			</div>
		{/if}
	{/snippet}
</Story>

<Story name="Custom Main Page Name" args={{
	visible: true,
	main_page_name: "Dashboard",
	pages: defaultPages,
	current_page: ""
}}>
	{#snippet template(args)}
		{#if args.visible}
			<div class="gradio-container" style="font-family: var(--font-sans, system-ui, sans-serif);">
				<div class="nav-holder" style="border-bottom: 1px solid var(--border-color-primary, #e5e7eb); background: var(--background-fill-primary, white);">
					<nav style="display: flex; gap: 0; padding: 0 1rem;">
						{#each args.pages as [route, label], i}
							<a
								href="#{route}"
								style="
									padding: 0.75rem 1rem;
									text-decoration: none;
									color: {route === args.current_page ? 'var(--color-accent, #f97316)' : 'var(--body-text-color, #374151)'};
									border-bottom: 2px solid {route === args.current_page ? 'var(--color-accent, #f97316)' : 'transparent'};
									font-weight: {route === args.current_page ? '600' : '400'};
								"
							>
								{i === 0 && route === "" ? args.main_page_name : label}
							</a>
						{/each}
					</nav>
				</div>
				<div style="padding: 1.5rem;">
					<h2 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">Dashboard Content</h2>
					<p style="margin: 0; color: var(--body-text-color-subdued, #6b7280);">
						The main page is now called "{args.main_page_name}" instead of "Home".
					</p>
				</div>
			</div>
		{/if}
	{/snippet}
</Story>

<Story name="With Active Page" args={{
	visible: true,
	main_page_name: "Home",
	pages: defaultPages,
	current_page: "page1"
}}>
	{#snippet template(args)}
		{#if args.visible}
			<div class="gradio-container" style="font-family: var(--font-sans, system-ui, sans-serif);">
				<div class="nav-holder" style="border-bottom: 1px solid var(--border-color-primary, #e5e7eb); background: var(--background-fill-primary, white);">
					<nav style="display: flex; gap: 0; padding: 0 1rem;">
						{#each args.pages as [route, label], i}
							<a
								href="#{route}"
								style="
									padding: 0.75rem 1rem;
									text-decoration: none;
									color: {route === args.current_page ? 'var(--color-accent, #f97316)' : 'var(--body-text-color, #374151)'};
									border-bottom: 2px solid {route === args.current_page ? 'var(--color-accent, #f97316)' : 'transparent'};
									font-weight: {route === args.current_page ? '600' : '400'};
								"
							>
								{i === 0 && route === "" ? args.main_page_name : label}
							</a>
						{/each}
					</nav>
				</div>
				<div style="padding: 1.5rem;">
					<h2 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">Page 1 Content</h2>
					<p style="margin: 0; color: var(--body-text-color-subdued, #6b7280);">
						"Page 1" is now the active page (highlighted in the navbar).
					</p>
				</div>
			</div>
		{/if}
	{/snippet}
</Story>

<Story name="Hidden Navbar" args={{
	visible: false,
	main_page_name: "Home",
	pages: defaultPages,
	current_page: ""
}}>
	{#snippet template(args)}
		{#if args.visible}
			<div class="gradio-container" style="font-family: var(--font-sans, system-ui, sans-serif);">
				<div class="nav-holder" style="border-bottom: 1px solid var(--border-color-primary, #e5e7eb); background: var(--background-fill-primary, white);">
					<nav style="display: flex; gap: 0; padding: 0 1rem;">
						{#each args.pages as [route, label], i}
							<a
								href="#{route}"
								style="
									padding: 0.75rem 1rem;
									text-decoration: none;
									color: {route === args.current_page ? 'var(--color-accent, #f97316)' : 'var(--body-text-color, #374151)'};
									border-bottom: 2px solid {route === args.current_page ? 'var(--color-accent, #f97316)' : 'transparent'};
									font-weight: {route === args.current_page ? '600' : '400'};
								"
							>
								{i === 0 && route === "" ? args.main_page_name : label}
							</a>
						{/each}
					</nav>
				</div>
			</div>
		{:else}
			<div style="padding: 1.5rem; border: 2px dashed #e5e7eb; border-radius: 8px; text-align: center;">
				<p style="margin: 0; color: #6b7280;">
					Navbar is hidden when <code>visible: false</code>
				</p>
				<p style="margin: 0.5rem 0 0 0; color: #9ca3af; font-size: 0.875rem;">
					Toggle the "visible" control to show the navbar.
				</p>
			</div>
		{/if}
	{/snippet}
</Story>
