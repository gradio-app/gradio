// filename: inlang.config.js

export async function defineConfig(env) {
  const plugin = await env.$import(
    "https://cdn.jsdelivr.net/gh/samuelstroschein/inlang-plugin-json@1/dist/index.js"
  );

  const pluginConfig = {
    pathPattern: "./ui/packages/app/src/lang/{language}.json",
  };

  return {
    referenceLanguage: "en",
    languages: [
      "ar",
      "de",
      "en",
      "es",
      "fa",
      "fr",
      "he",
      "hi",
      "ja",
      "ko",
      "lt",
      "nl",
      "pl",
      "pt-BR",
      "ru",
      "ta",
      "tr",
      "uk",
      "ur",
      "uz",
      "zh-cn",
      "zh-tw",
    ],
    readResources: (args) =>
      plugin.readResources({ ...args, ...env, pluginConfig }),
    writeResources: (args) =>
      plugin.writeResources({ ...args, ...env, pluginConfig }),
  };
}
