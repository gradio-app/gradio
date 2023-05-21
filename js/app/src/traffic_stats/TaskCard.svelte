<script lang="ts">
	import { task_status_colors } from "./utils";
	import type { TaskStatus, Task } from "./utils";

	export let task: Task;
	export let status: TaskStatus = "pending";
</script>

<div
	class="task"
	style:background-color="rgba({task_status_colors[status]}, 0.2)"
	style:border-color="rgba({task_status_colors[status]}, 0.5)"
>
	<div>{task.fn}</div>
	<div>{task.idx}</div>
</div>

<style>
	.task {
		transition: all 0.5s linear;
		border-width: 2px;
		border-radius: 2px;
		padding: 2px;
		width: 60px;
		height: 60px;
		overflow: hidden;
		font-size: 10px;
	}
	.task > * {
		word-wrap: break-word;
	}
</style>
