// See https://vitejs.dev/guide/features.html#client-types

declare module "*.whl" {
	const content: string;
	export default content;
}

// virtual module component type definition
declare module "virtual:component-loader" {
	interface Args {
		api_url: string;
		name: string;
		id: string;
		variant: "component" | "example";
	}
	export function load_component(args: Args): Promise<{
		name: ComponentMeta["type"];
		component: LoadedComponent;
	}>;
}
