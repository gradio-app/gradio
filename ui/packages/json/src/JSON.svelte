<script lang="ts">
	import JSONNode from "./JSONNode.svelte";

	export let value: any = {};
	export let style: string = "";
</script>

<button
	class="font-sans absolute right-0 top-0 py-1 px-2 rounded-bl-lg shadow-sm text-xs text-gray-500 flex items-center pointer-events-none bg-white z-20 border-l border-b border-gray-100"
>
	copy to clipboard
</button>

<JSONNode {value} depth={0} />
