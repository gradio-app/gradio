import docs_json from "$lib/json/docs.json";

let docs: { [key: string]: any } = docs_json.docs;


export function get_object(name: string) {
    let obj: any;
    for (const library in docs) {
        for (const key in docs[library]) {
            for (const o in docs[library][key]) {
                if (o === name) {
                    obj = docs[library][key][o];
                    break;
                }
            }
        }
    }
    return obj;
}