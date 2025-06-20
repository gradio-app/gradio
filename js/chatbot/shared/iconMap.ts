const modules = import.meta.glob("../../icons/src/*.svelte");

type IconMap = Record<string, any>;

const iconMap: IconMap = {};

async function loadIcons(): Promise<IconMap> {
	for (const path in modules) {
		const mod = (await modules[path]()) as { default: any };
		const nameMatch = path.match(/\/([^\/]+)\.svelte$/);
		if (nameMatch) {
			const name = nameMatch[1].toLowerCase();
			iconMap[name] = mod.default;
		}
	}
	return iconMap;
}

export { iconMap, loadIcons };
