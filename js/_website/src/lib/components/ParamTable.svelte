<script lang="ts">
	export let parameters = [] as any[];
	import ParamViewer from "@gradio/paramviewer";

	interface OriginalParam {
        annotation: string | null;
        doc: string;
        default?: string | null;
        name: string;
    }

	interface NewParam {
        type: string | null;
        description: string;
        default: string | null;
        name?: string;
    }

    console.log(parameters);

    function decode_html_entities(input: string): string {
        const doc = new DOMParser().parseFromString(input, 'text/html');
        return doc.documentElement.textContent || "";
    }

    function convert_params(original_parameters: OriginalParam[]): Record<string, NewParam> {
        let new_parameters: Record<string, NewParam> = {};
        for (let param of original_parameters) {
            new_parameters[param.name] = {
                type: param.annotation,
                description: decode_html_entities(param.doc),
                default: param.default || null
            };
        }
        return new_parameters;
    }
    let new_parameters = convert_params(parameters)
    console.log("new_parameters", new_parameters);
</script>

<ParamViewer value={new_parameters} header="Parameters"/>

