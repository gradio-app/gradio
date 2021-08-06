import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";

class TextboxOutput extends BaseComponent {
  render() {
    return (
      <div className="output_text">
        {this.props.value === null ? <span>&nbsp;</span> : this.props.value}
      </div>
    );
  }
  static load_example_preview(data) {
    if (data.length > 20) {
      return data.substring(0, 20) + "...";
    }
    return data;
  }
}

class TextboxOutputExample extends ComponentExample {
  render() {
    return <div className="output_textbox_example">{this.props.value}</div>;
  }
}

export { TextboxOutput, TextboxOutputExample };
