<svelte:options accessors={true} />

<script lang="ts">
	import { onMount } from "svelte";
	import { encrypt, decrypt } from "./crypto";

	export let value: unknown;
	export let storage_key: string;
	export let default_value: unknown;
	export let browser_state_secret: string | undefined;

	async function load_value(): Promise<void> {
		const stored = localStorage.getItem(storage_key);
		if (!stored || !browser_state_secret) {
			value = default_value;
			return;
		}
		try {
			const decrypted = await decrypt(stored, browser_state_secret);
			value = JSON.parse(decrypted);
		} catch (e) {
			console.error("Error reading from localStorage:", e);
			value = default_value;
		}
	}

	async function save_value(new_value: unknown): Promise<void> {
		try {
			if (!browser_state_secret) {
				throw new Error(
					"No value for browser_state_secret, cannot set local state value"
				);
			}
			const encrypted = await encrypt(
				JSON.stringify(new_value),
				browser_state_secret
			);
			localStorage.setItem(storage_key, encrypted);
			value = new_value;
		} catch (e) {
			console.error("Error writing to localStorage:", e);
		}
	}

	$: value && save_value(value);

	onMount(() => {
		load_value();
	});
</script>
