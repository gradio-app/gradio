<script lang="ts">
	import ColorRow from "./ColorRow.svelte";

	export let token: { tokenName: string; value: string };

	let copied = false;

	export const TokenTypeRow = (token: string): any => {
		if (isHexCode(token)) {
			return ColorRow;
		}
	};

	const isHexCode = (value: string): boolean => /^[0-9a-fA-F]+$/.test(value);
</script>

<tr>
	<td class="token-name"><pre>{token.tokenName}</pre></td>
	<td><pre>{token.value}</pre></td>
	<td />
</tr>

<style>
	td {
		padding: 10px;
	}
</style>
