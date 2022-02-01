const { minify } = require("terser");

const transform = (code, optionsString) => {
  const options = eval(`(${optionsString})`);
  return minify(code, options).then(result => ({ result, nameCache: options.nameCache }));
};

exports.transform = transform;
