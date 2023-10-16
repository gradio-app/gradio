// See https://vitejs.dev/guide/features.html#client-types

declare module "*.whl" {
	const content: string;
	export default content;
}

// virtual module component type definition
declare module "virtual:component-loader" {
	export function load_component(
		api_url: string,
		name: string,
		mode: "interactive" | "static" | "example",
		id: string
	): Promise<{
		name: ComponentMeta["type"];
		component: LoadedComponent;
	}>;
}
