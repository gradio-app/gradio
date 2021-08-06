import React from "react";
import BaseComponent from "./base_component";

export default class ComponentExample extends BaseComponent {
  render() {
    return <div>{this.props.value}</div>;
  }
  static async preprocess(x) {
    return x;
  }
}

export class FileComponentExample extends ComponentExample {
  static async preprocess(x, examples_dir) {
    return examples_dir + "/" + x;
  }
}

export class DataURLComponentExample extends ComponentExample {
  static async preprocess(x, examples_dir) {
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
}
