import docs_json from "$lib/json/docs.json";

let docs: { [key: string]: any } = docs_json.docs;


export function get_object(name: string) {
    let obj: any;
    for (const key in docs) {
        for (const o in docs[key]) {
            if (o === name) {
                obj = docs[key][o];
                break;
            }
        }
    }
    return obj;
}