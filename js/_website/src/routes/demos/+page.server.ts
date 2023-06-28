import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import demos_by_category from "./demos.json"

let language = 'python';


export async function load() {

    demos_by_category.forEach(category => {
        category.demos.forEach((demo: { name: string; dir: string; code: string; highlighted_code?: string }) => {
            demo.highlighted_code = Prism.highlight(demo.code, Prism.languages[language], "python");
        })
    })

    return {
        demos_by_category
    };
}
