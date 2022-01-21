loadAsFile = async (x, examples_dir) => {
  return {
    name: x,
    data: examples_dir + "/" + x,
    is_example: true
  };
}

loadAsData = async (x, examples_dir) => {
  let file_url = examples_dir + "/" + x;
  let response = await fetch(file_url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  let blob = await response.blob();
  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        resolve(reader.result);
      },
      false
    );

    reader.onerror = () => {
      return reject(this);
    };
    reader.readAsDataURL(blob);
  });
}
