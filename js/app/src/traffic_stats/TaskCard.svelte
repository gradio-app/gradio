<script lang="ts">
    import { task_status_colors } from "./utils";
    import type { task_status, Task } from "./utils";

    export let task: Task;
    export let status: task_status = "pending";
</script>

<div
    class="task"
    style:background-color="rgba({task_status_colors[status]}, 0.2)"
    style:border-color="rgba({task_status_colors[status]}, 0.5)"
>
    <div>{task.id}</div>
    <div>{task.fn}</div>
</div>

<style>
    .task {
        border-width: 2px;
        height: 60px;
        width: 60px;
        overflow: hidden;
        padding: 2px;
        border-radius: 2px;
        font-size: 10px;
        transition: all 0.5s linear;
    }
    .task > * {
        word-wrap: break-word;
    }
</style>
