<script lang="ts">
	import { page } from "$app/stores";
	import components from "$lib/component_json";

	const nav_items = Array.from(new Set(components.map((c) => c.name))).sort();
</script>

<header>
	<nav>
		<ul>
			{#each nav_items as nav_item}
				<li
					aria-current={$page.url.pathname === `/${nav_item}`
						? "page"
						: undefined}
				>
					<a href={`/${nav_item}`}>{nav_item}</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: center;
	}

	nav {
		width: 100%;
		box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.1);
	}

	ul {
		width: 100%;
		position: relative;
		padding: 0;
		margin: 0;
		/* height: 3em; */
		display: flex;
		justify-content: center;
		overflow-y: scroll;
		flex-wrap: wrap;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
		padding: 10px;
	}

	li {
		position: relative;
		height: 100%;
		padding: 5px 2px;
	}

	li[aria-current="page"] a {
		color: var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
