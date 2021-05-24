import React from 'react';
import ComponentExample from '../component_example';
import JSONTree from 'react-json-tree'

class JSONOutput extends React.Component {
  render() {
    return this.props.value ? <div className="output_json">
      <JSONTree data={this.props.value }/>
    </div> : false;
  }
}

class JSONOutputExample extends ComponentExample {
  render() {
    let output_string = JSON.stringify(this.props.value);
    if (output_string.length > 20) {
      output_string = output_string.substring(0,20) + "...";
    }
    return <div className="output_json_example">{output_string}</div>
  }
}

export {JSONOutput, JSONOutputExample};
