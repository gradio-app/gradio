import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";
import JSONTree from "react-json-tree";

class JSONOutput extends BaseComponent {
  render() {
    return this.props.value ? (
      <div className="output_json">
        <JSONTree
          data={this.props.value}
          theme={{
            base00: "#111",
            base01: "#222",
            base02: "#333",
            base03: "#444",
            base04: "#555",
            base05: "#666",
            base06: "#777",
            base07: "#888",
            base08: "#999",
            base09: "#AAA",
            base0A: "#BBB",
            base0B: "#CCC",
            base0C: "#DDD",
            base0D: "#EEE",
            base0E: "#EFEFEF",
            base0F: "#FFF"
          }}
          invertTheme={true}
        />
      </div>
    ) : (
      false
    );
  }
}

class JSONOutputExample extends ComponentExample {
  render() {
    let output_string = JSON.stringify(this.props.value);
    if (output_string.length > 20) {
      output_string = output_string.substring(0, 20) + "...";
    }
    return <div className="output_json_example">{output_string}</div>;
  }
}

export { JSONOutput, JSONOutputExample };
