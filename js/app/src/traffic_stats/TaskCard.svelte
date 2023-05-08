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
    <div>{task[0]}</div>
    <div>{task[1]}</div>
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
