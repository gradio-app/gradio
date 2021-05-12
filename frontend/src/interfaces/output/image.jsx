import React from 'react';

class ImageOutput extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return this.props.value ? <div className="output_image">
      <img src={this.props.value[0]}></img>
    </div> : false;
  }
}

export default ImageOutput;
