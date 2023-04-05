import guides_by_category_json from "../guides/json/guides_by_category.json";

let guides_by_category = guides_by_category_json.guides_by_category;

const COLOR_SETS = [
    ["from-green-100", "to-green-50"],
    ["from-yellow-100", "to-yellow-50"],
    ["from-red-100", "to-red-50"],
    ["from-blue-100", "to-blue-50"],
    ["from-pink-100", "to-pink-50"],
    ["from-purple-100", "to-purple-50"],
]

let total_guides = 0;
for (const category in guides_by_category) {
    for (const guide in guides_by_category[category].guides) {
            total_guides += 1;
    }
}

export async function load() {

    return {
        guides_by_category,
        total_guides,
        COLOR_SETS
    };
}