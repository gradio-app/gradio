<script lang="ts">
	import {
		Panel,
		Block,
		BlockTitle,
		BlockLabel,
		IconButton
	} from "@gradio/atoms";

	import { Brush } from "@gradio/icons";
</script>

<Panel>
	<div>
		<IconButton Icon={Brush} />
		<IconButton Icon={Brush} />
		<IconButton Icon={Brush} />
		<IconButton Icon={Brush} />
	</div>
</Panel>

<span />

<Block>
	<BlockTitle>Block</BlockTitle>
	<div />
</Block>

<span />

<Block>
	<BlockLabel Icon={Brush} label="Block" />
	<span />
	<div>Hello</div>
	<div>
		<IconButton Icon={Brush} />
		<IconButton Icon={Brush} />
		<IconButton Icon={Brush} />
		<IconButton Icon={Brush} />
	</div>
</Block>

<span />

<style>
	div {
		display: flex;
		gap: 1rem;
		height: 200px;
	}
	span {
		display: block;
		height: 1rem;
	}
</style>
