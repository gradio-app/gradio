// filename: inlang.config.js

export async function initializeConfig(env) {
    const plugin = await env.$import(
      "https://cdn.jsdelivr.net/gh/samuelstroschein/inlang-plugin-json@1/dist/index.js"
    );
  
    const pluginConfig = {
      pathPattern: "./ui/packages/app/src/lang/{language}.json",
    };
  
    return {
      referenceLanguage: "en-us",
      languages: ["en-us", "zh-cn"],
      readResources: (args) =>
        plugin.readResources({ ...args, ...env, pluginConfig }),
      writeResources: (args) =>
        plugin.writeResources({ ...args, ...env, pluginConfig }),
    };
  }