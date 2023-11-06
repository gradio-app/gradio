<script lang="ts">
	import Handle from "./Handle.svelte";

	export let left = 0;
	export let top = 0;
	export let width = 300;
	export let height = 400;

	let _height = height;
	let _width = width;

	let el;

	const positions = ["tl", "br", "tr", "bl", "t", "b", "l", "r"] as const;
</script>

<div
	bind:this={el}
	style:height="{height}px"
	style:width="{width}px"
	class="wrap"
>
	<div
		class="box"
		style:height="{_height}px"
		style:width="{_width}px"
		style:top="{top - 1}px"
		style:left="{left - 1}px"
	>
		{#each positions as position}
			<Handle
				location={position}
				bind:x={left}
				bind:y={top}
				bind:height={_height}
				bind:width={_width}
				parent={el}
			/>
		{/each}

		<div class="grid">
			{#each { length: 25 } as _}
				<div></div>
			{/each}
		</div>
	</div>
</div>

<style>
	.grid {
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 1px 1fr 1px 1fr;
		grid-template-columns: 1fr 1px 1fr 1px 1fr;
		overflow: hidden;
	}

	.grid > div {
		width: 100%;
		height: 100%;
	}

	.grid > div:nth-of-type(even) {
		background: black;
		opacity: 0.5;
	}

	.wrap {
		position: absolute;
	}

	.box {
		position: absolute;
		border: 1px solid black;
	}

	/* .handle {
		position: absolute;
		background: black;
		
	}

	.corner {
		width:4px;
		height: 4px;
		background: black;
	}

	.corner::after {
		position: absolute;
		content: "";
		width: 4px;
		height: 20px;
		background: black;
	}
	.corner::before {
		position: absolute;
		content: "";
		width: 20px;
		height: 4px;
		background: black;
	}

	.tlc {
		top: -4px;
		left: -4px;
		cursor: nwse-resize;
	}

	.tlc:after {
		top: 4px;
		left: 0px
	}

	.tlc::before {
		
		top: 0px;
		left: 4px
	}

	.trc {
		top: -4px;
		right: -4px;
		cursor: nesw-resize;
	}

	.trc:after {
		
		top: 4px;
		right: 0px;

	}

	.trc::before {
		
		top: 0px;
		right: 4px
	}

	.brc {
		bottom: -4px;
		right: -4px;
						cursor: nwse-resize;

	}

	.brc:after {
		
		bottom: 4px;
		right: 0px
	}

	.brc::before {
		
		bottom: 0px;
		right: 4px
	}

	.blc {
		bottom: -4px;
		left: -4px;
						cursor: nesw-resize;

	}

	.blc:after {
		
		bottom: 4px;
		left: 0px
	}

	.blc::before {
		
		bottom: 0px;
		left: 4px
	}

	.rm {
		height: 30px;
		width: 4px;
		top: calc((100% - 30px) / 2);
		left: -4px;
		cursor: ew-resize;
	}

	.lm {
    
		height: 30px;
		width: 4px;
		top: calc((100% - 30px) / 2);
		right: -4px;
cursor: ew-resize;
	}

	.tm {
		height: 4px;
		width: 30px;
		left: calc((100% - 30px) / 2);
		top: -4px;
		cursor: ns-resize;
	}

	.bm {
		height: 4px;
		width: 30px;
		left: calc((100% - 30px) / 2);
		bottom: -4px;
				cursor: ns-resize;

	} */
</style>
