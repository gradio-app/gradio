import React from "react";
import BaseComponent from "../base_component";
import ComponentExample from "../component_example";

class JSONNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: this.props.depth > 5 };
  }
  open = () => {
    this.setState({ collapsed: false });
  };
  close = () => {
    this.setState({ collapsed: true });
  };
  render() {
    var node = null;
    var nodetype = null;
    if (this.props.value instanceof Array) {
      if (this.state.collapsed) {
        node = (
          <button onClick={this.open}>
            [+{this.props.value.length} children]
          </button>
        );
      } else {
        node = (
          <>
            [
            <div class="json_children">
              {this.props.value.map((n, i) => (
                <div class="json_item">
                  {i}: <JSONNode value={n} depth={this.props.depth + 1} />,
                </div>
              ))}
            </div>
            ]
          </>
        );
        nodetype = "array";
      }
    } else if (this.props.value instanceof Object) {
      if (this.state.collapsed) {
        node = (
          <button onClick={this.open}>
            &#123;+{Object.keys(this.props.value).length} items&#125;
          </button>
        );
      } else {
        node = (
          <>
            &#123;
            <div class="json_children">
              {Object.entries(this.props.value).map((n) => (
                <div class="json_item">
                  {n[0]}: <JSONNode value={n[1]} depth={this.props.depth + 1} />
                  ,
                </div>
              ))}
            </div>
            &#125;
          </>
        );
        nodetype = "object";
      }
    } else if (this.props.value === null) {
      node = "null";
      nodetype = "null";
    } else {
      node = this.props.value;
      nodetype = typeof this.props.value;
      if (nodetype === "string") {
        node = '"' + node + '"';
      } else if (nodetype === "boolean") {
        node = node.toLocaleString();
      }
    }
    return (
      <div type={nodetype} class="json_node">
        {node}
      </div>
    );
  }
}

class JSONOutput extends BaseComponent {
  render() {
    return this.props.value ? (
      <div className="output_json">
        <JSONNode value={this.props.value} depth={1} />
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
