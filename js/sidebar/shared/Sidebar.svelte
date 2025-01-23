<script lang="ts">
	import { createEventDispatcher } from "svelte";
	const dispatch = createEventDispatcher<{
		expand: void;
		collapse: void;
	}>();

	export let open = true;
	export let label = "";
</script>

<div class="sidebar" class:open>
    <button
        on:click={() => {
            open = !open;
            if (open) {
                dispatch("expand");
            } else {
                dispatch("collapse");
            }
        }}
        class="hamburger-button"
        aria-label="Toggle Sidebar"
    >
        <div class="chevron">
            <span class="chevron-left"></span>
        </div>
    </button>
    <div class="sidebar-content">
        <slot />
    </div>
</div>

<style>
    .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        background-color: var(--background-fill);
        box-shadow: 2px 0 5px rgba(100, 89, 89, 0.1);
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
        width: 250px;
    }

    .sidebar.open {
        transform: translateX(0);
    }

    .hamburger-button {
        position: absolute;
        top: 15px;
        right: -40px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chevron {
        width: 20px;
        height: 20px;
        position: relative;
    }

    .chevron-left {
        position: absolute;
        width: 12px;
        height: 12px;
        border-top: 2px solid var(--block-background-fill);
        border-right: 2px solid var(--block-background-fill);
        transform: rotate(45deg);
        transition: transform 0.3s ease-in-out;
    }

    .open .chevron-left {
        transform: rotate(225deg);
    }

    .sidebar-content {
        padding: 20px;
    }
</style>
