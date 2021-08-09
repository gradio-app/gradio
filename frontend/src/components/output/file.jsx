import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import { prettyBytes } from "../../utils";

class FileOutput extends BaseComponent {
  render() {
    return this.props.value ? (
      <div className="output_file">
        <a
          className="file_display"
          href={"data:;base64," + this.props.value.data}
          download={this.props.value.name}
        >
          <div className="file_name">{this.props.value.name}</div>
          <div className="file_size">
            {this.props.value.size === null
              ? ""
              : prettyBytes(this.props.value.size)}
          </div>
        </a>
      </div>
    ) : (
      false
    );
  }
}

class FileOutputExample extends ComponentExample {
  render() {
    return <div className="output_file_example">{this.props.value}</div>;
  }
}

export { FileOutput, FileOutputExample };
