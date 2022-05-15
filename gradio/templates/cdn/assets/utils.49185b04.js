function normalise_file(file, root) {
  if (file == null)
    return null;
  if (typeof file === "string") {
    return {
      name: "file_data",
      data: file
    };
  } else if (file.is_example) {
    file.data = root + "file/" + file.name;
  }
  return file;
}

export { normalise_file as n };
