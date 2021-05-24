import React from 'react';
import ComponentExample from '../component_example';

class FileOutput extends React.Component {
  render() {
    return this.props.value ? <div className="output_file">
    <a className="file_display" href={"data:;base64," + this.props.value.data} download={this.props.value.name}>
      <div className="file_name">{this.props.value.name}</div>
      <div className="file_size">{this.props.value.size}</div>
    </a>
  </div> : false;
  }
}

class FileOutputExample extends ComponentExample {
  render() {
    return <div className="output_file_example">{this.props.value}</div>
  }
}

export {FileOutput, FileOutputExample};
