<script lang="ts">
	export let parameters = [] as any[];
	import ParamViewer from "@gradio/paramviewer";

	interface Param {
    type: string | null;
    description: string;
    default: string | null;
    name?: string;
}

function convert_parameters(parameters: any[]): Record<string, Param> {
    if (!Array.isArray(parameters)) {
        console.error('Invalid parameters: expected an array');
        return {};
    }

    const result: Record<string, Param> = {};

    for (const param of parameters) {
        if (param && typeof param === 'object' && param.name && param.name !== "self") {
            result[param.name] = {
                type: param.annotation ? param.annotation.replace("Sequence[", "list[") : null,
                description: param.doc || "",
                default: param.default !== undefined ? String(param.default) : null,
                name: param.name
            };
        }
    }

    return result;
}
let docs = convert_parameters(parameters);

</script>

<ParamViewer {docs} />

