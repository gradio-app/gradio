<script>
	const colors = {
		focus: {
			secondary: "var(--color-blue-300)",
			primary: "var(--color-blue-500)"
		},
		background: {
			primary: "white",
			secondary: "var(--color-grey-50)",
			tertiary: "white"
		},
		text: {
			body: "var(--color-grey-700)",
			label: "var(--color-grey)",
			placeholder: "var(--color-grey-400)",
			subdued: "var(--color-grey-400)"
		},
		border: {
			primary: "var(--color-grey-200)",
			secondary: "var(--color-grey-600)",
			highlight: "color.accent.base"
		},
		accent: {
			base: "var(--color-orange-500)",
			light: "var(--color-orange-300)",
			dark: "var(--color-orange-700)",
			muted: "var(--color-orange-50)"
		},
		button: {
			default: "",
			cta: "var(--color-orange-500)",
			warning: "var(--color-red)"
		},
		functional: {
			error: "var(--color-red)", //red
			info: "var(--color-yellow-300)", //yellow
			success: "var(--color-green)" //green
		}
	};
</script>

<h1>Theme</h1>

{#each Object.entries(colors) as [type, cols]}
	<h2>{type}</h2>
	<div class="type">
		{#each Object.entries(cols) as [name, c]}
			<div>
				<div class="col" style:background-color={c} />
				<h3>{name}</h3>
			</div>
		{/each}
	</div>
{/each}

<style>
	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	h2 {
		/* text-transform: uppercase; */
		font-weight: bold;
		margin-bottom: 0.5rem;
		margin-top: 1rem;
	}
	.col {
		height: 40px;
		width: 80px;
		border-radius: 5px;
		margin-right: 40px;
		padding-left: 7px;
		padding-bottom: 3px;
		display: flex;
		justify-content: flex-start;
		align-items: end;
	}

	h3 {
		text-align: left;
		font-size: 12px;
		margin-left: 2px;
	}

	.type {
		display: flex;
	}
</style>
