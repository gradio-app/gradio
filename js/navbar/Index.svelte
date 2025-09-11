<script lang="ts">
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let main_page_name: string | false = "Home";
	export let value: [string, string][] | null = null;
</script>

<div style="display: none;" id={elem_id} class={elem_classes.join(" ")}></div>
