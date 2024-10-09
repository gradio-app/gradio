import { error, redirect } from "@sveltejs/kit";

export async function load({ params, parent }) {
    const {
        on_main,
        wheel,
        pages,
        url_version,
        VERSION
    } = await parent();

    const modules : any = import.meta.glob("/src/lib/templates*/gradio/**/*.svx");
    let name = params.doc;
    let version = params.version || VERSION;
    let page_path : string | null = null;

    for (const category of pages.gradio) {
        for (const page of category.pages) {
            if (page.name === name) {
                page_path = page.path;
            }
        }
    }

    if (page_path === null) {
        if (!params.version) {
            throw redirect(308, `/docs/gradio/interface`);
        } else {
            throw redirect(308, `/${params.version}/docs/gradio/interface`);
        }
    }

    let version_append = on_main ? "/" : "_" + version.replace(/\./g, "-") + "/";

    let module;
    for (const path in modules) {
        if (path.includes(page_path) && path.includes("templates" + version_append)) {
            module = await modules[path]();
        }
        
    }

    if (module === undefined) {
        if (!params.version) {
            throw redirect(302, `/docs/gradio/interface`);
        } else {
            throw redirect(302, `/${params.version}/docs/gradio/interface`);
        }
    }



    return {
        name,
        on_main,
        wheel,
        url_version,
        pages,
        page_path,
        module
    };
    }
