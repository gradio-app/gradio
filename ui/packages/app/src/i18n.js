import { addMessages, init, getLocaleFromNavigator } from "svelte-i18n";
import en from "../public/lang/en.json";
import es from "../public/lang/es.json";

addMessages("en", en);
addMessages("es", es);

export function setupi18n() {
	init({
		fallbackLocale: "en",
		initialLocale: getLocaleFromNavigator()
	});
}
