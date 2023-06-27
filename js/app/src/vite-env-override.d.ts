// See https://vitejs.dev/guide/features.html#client-types

declare module "*.whl" {
	const content: string;
	export default content;
}
