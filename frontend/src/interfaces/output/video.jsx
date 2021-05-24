import React from 'react';
import ComponentExample from '../component_example';

class VideoOutput extends React.Component {
  render() {
    return this.props.value ? <div className="output_video">
      <video controls src={this.props.value}></video>
    </div> : false;
  }
}

class VideoOutputExample extends ComponentExample {
  render() {
    return <div className="output_video_example">{this.props.value}</div>
  }
}

export {VideoOutput, VideoOutputExample};
