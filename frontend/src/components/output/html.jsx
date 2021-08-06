import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";

class HTMLOutput extends BaseComponent {
  render() {
    return this.props.value ? (
      <div
        className="output_html"
        dangerouslySetInnerHTML={{ __html: this.props.value }}
      ></div>
    ) : (
      false
    );
  }
}

class HTMLOutputExample extends ComponentExample {
  render() {
    return <div className="output_html_example">[HTML]</div>;
  }
}

export { HTMLOutput, HTMLOutputExample };
