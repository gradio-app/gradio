// @ts-nocheck

const request_map = {};
const runtime_map = {};

const is_browser = typeof window !== "undefined";

export function load_component({ api_url, name, id, variant }) {
  const comps = is_browser && window.__GRADIO__CC__;

  const _component_map = {
    // eslint-disable-next-line no-undef
    ...component_map,
    ...(!comps ? {} : comps),
  };

  let _id = id || name;

  if (request_map[`${_id}-${variant}`]) {
    return {
      component: request_map[`${_id}-${variant}`],
      name,
      runtime: runtime_map[`${_id}-${variant}`],
    };
  }
  try {
    if (!_component_map?.[_id]?.[variant] && !_component_map?.[name]?.[variant])
      throw new Error();

    request_map[`${_id}-${variant}`] = (
      _component_map?.[_id]?.[variant] || // for dev mode custom components
      _component_map?.[name]?.[variant]
    )();

    return {
      name,
      component: request_map[`${_id}-${variant}`],
      runtime: runtime_map[`${_id}-${variant}`],
    };
  } catch (e) {
    if (!_id) throw new Error(`Component not found: ${name}`);
    try {
      const [component_module, svelte_runtime_module] = get_component_with_css(
        api_url,
        _id,
        variant,
      );

      request_map[`${_id}-${variant}`] = component_module;

      runtime_map[`${_id}-${variant}`] = false;

      return {
        name,
        component: request_map[`${_id}-${variant}`],
        runtime: runtime_map[`${_id}-${variant}`],
      };
    } catch (e) {
      if (variant === "example") {
        request_map[`${_id}-${variant}`] = import("@gradio/fallback/example");

        return {
          name,
          component: request_map[`${_id}-${variant}`],
          runtime: runtime_map[`${_id}-${variant}`],
        };
      }
      console.error(`failed to load: ${name}`);
      console.error(e);
      throw e;
    }
  }
}

function load_css(url) {
  if (!is_browser) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
    link.onload = () => resolve();
    link.onerror = () => reject();
  });
}

function get_component_with_css(api_url, id, variant) {
  const environment = is_browser ? "client" : "server";
  let path;
  if (environment === "server") {
    // uncomment when we make gradio cc build support ssr
    //path = await (await fetch(`${api_url}/custom_component/${id}/${variant}/index.js/server`)).text();
    return Promise.all([
      load_css(`${api_url}/custom_component/${id}/${variant}/style.css`),
      import(
        /* @vite-ignore */
        "@gradio/fallback"
      ),
    ]).then(([_, module]) => {
      return module;
    });
  }

  path = `${api_url}/custom_component/${id}/${environment}/${variant}/index.js`;

  return Promise.all([
    load_css(
      `${api_url}/custom_component/${id}/${environment}/${variant}/style.css`,
    ),
    import(
      /* @vite-ignore */
      path
    ),
    import(
      /* @vite-ignore */
      `${api_url}/custom_component/${id}/${environment}/svelte_runtime/index.js`
    ).catch((e) => "helooooooo"),
  ]).then(([_, component_module, svelte_runtime_module]) => {
    return [component_module, svelte_runtime_module];
  });
}
