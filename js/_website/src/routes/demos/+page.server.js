import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import demos_by_category from "./demos.json"

let language = 'python';


export async function load() {

    demos_by_category.forEach(category => {category.demos.forEach(demo => {
        demo.highlighted_code = Prism.highlight(demo.code, Prism.languages[language]);
    })})

    return {
        demos_by_category
    };
}
