import React from 'react';
import ComponentExample from '../component_example';

class ImageOutput extends React.Component {
  render() {
    return this.props.value ? <div className="output_image">
      <img alt="" src={this.props.value[0]}></img>
    </div> : false;
  }
}

class ImageOutputExample extends ComponentExample {
  render() {
    return <img className="output_image_example" src={this.props.value} alt="" />
  }
}

export {ImageOutput, ImageOutputExample};
