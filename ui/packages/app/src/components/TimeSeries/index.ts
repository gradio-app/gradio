export { default as Component } from "./TimeSeries.svelte";
export const modes = ["static", "dynamic"];

export const document = (config: Record<string, any>) => ({
    "type": "{data: Array<Array<number>> | string; headers?: Array<string>;}",
    "description": "dataset of series",
})