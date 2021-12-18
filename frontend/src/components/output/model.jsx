import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";

class ModelOutput extends BaseComponent {
  render() {
    if (this.props.value) {
      return (
          <div className="output_model">
            <h1>example: {this.props.value["name"]}</h1>
          </div>
      )
    } else {
      return false;
    }
  }
}

class ModelOutputExample extends ComponentExample {
  render() {
    return <div className="output_model_example">{this.props.value}</div>;
  }
}

export { ModelOutput, ModelOutputExample };
