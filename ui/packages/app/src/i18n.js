import { addMessages, init, getLocaleFromNavigator } from "svelte-i18n";
import en from "../public/lang/en.json";
import es from "../public/lang/es.json";
import fr from "../public/lang/fr.json";
import ur from "../public/lang/ur.json";

addMessages("en", en);
addMessages("es", es);
addMessages("fr", fr);
addMessages("ur", ur);

export function setupi18n() {
	init({
		fallbackLocale: "en",
		initialLocale: getLocaleFromNavigator()
	});
}
