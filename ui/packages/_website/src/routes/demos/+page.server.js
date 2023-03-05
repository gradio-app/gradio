import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import demos_by_category from "./demos.json"

let language = 'python';

demos_by_category.forEach(category => {category.demos.forEach(demo => {
    demo.code = Prism.highlight(demo.code, Prism.languages[language])
})})

export async function load() {
    return {
        demos_by_category
    };
}
